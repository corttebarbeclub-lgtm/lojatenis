'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import {
  openCashRegisterSchema,
  closeCashRegisterSchema,
  registerCashMovementSchema,
  createSaleSchema,
} from '@/lib/validations/pdv';
import type {
  OpenCashRegisterInput,
  CloseCashRegisterInput,
  RegisterCashMovementInput,
  CreateSaleInput,
} from '@/lib/validations/pdv';

export async function openCashRegister(input: OpenCashRegisterInput) {
  const parsed = openCashRegisterSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data, error } = await supabase.rpc('open_cash_register', {
    p_store_id: parsed.data.storeId,
    p_opening_balance_cents: parsed.data.openingBalanceCents,
  });

  if (error) {
    if (error.message.includes('já existe um caixa aberto') || error.message.toLowerCase().includes('já existe')) {
      return { error: 'Já existe um caixa aberto para esta loja.' };
    }
    return { error: 'Não foi possível abrir o caixa.' };
  }

  await supabase.from('audit_logs').insert({
    tenant_id: user.tenant_id,
    user_id: user.id,
    action: 'cash_register_opened',
    entity_type: 'cash_register',
    entity_id: data.id,
    metadata: { opening_balance_cents: parsed.data.openingBalanceCents },
  });

  revalidatePath('/dashboard/pdv');
  return { success: true, cashRegister: data };
}

export async function closeCashRegister(input: CloseCashRegisterInput) {
  const parsed = closeCashRegisterSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data, error } = await supabase.rpc('close_cash_register', {
    p_cash_register_id: parsed.data.cashRegisterId,
    p_closing_balance_cents: parsed.data.closingBalanceCents,
  });

  if (error) {
    return { error: 'Não foi possível fechar o caixa.' };
  }

  await supabase.from('audit_logs').insert({
    tenant_id: user.tenant_id,
    user_id: user.id,
    action: 'cash_register_closed',
    entity_type: 'cash_register',
    entity_id: parsed.data.cashRegisterId,
    metadata: {
      closing_balance_cents: parsed.data.closingBalanceCents,
      expected_balance_cents: data.expected_balance_cents,
    },
  });

  revalidatePath('/dashboard/pdv');
  return { success: true, cashRegister: data };
}

export async function registerCashMovement(input: RegisterCashMovementInput) {
  const parsed = registerCashMovementSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await requireAppUser();
  const supabase = createClient(cookies());
  const { clientOperationId } = parsed.data;

  const { data, error } = await supabase.rpc('register_cash_movement', {
    p_cash_register_id: parsed.data.cashRegisterId,
    p_type: parsed.data.type,
    p_amount_cents: parsed.data.amountCents,
    p_reason: parsed.data.reason || null,
    p_client_operation_id: clientOperationId || null,
  });

  if (error) {
    // Veio de uma sincronização offline (fila) e falhou por regra de
    // negócio, não por validação — nunca descarta silenciosamente:
    // registra como conflito para o gestor decidir.
    if (clientOperationId) {
      const { error: conflictError } = await supabase.from('sync_conflicts').insert({
        tenant_id: user.tenant_id,
        client_operation_id: clientOperationId,
        operation_type: 'cash_movement',
        payload: parsed.data,
        error_message: error.message,
      });
      if (conflictError && conflictError.code !== '23505') {
        throw new Error(`Falha ao registrar conflito de sincronização: ${conflictError.message}`);
      }
      return { error: 'Movimentação registrada como pendência de sincronização.', conflict: true };
    }
    return { error: 'Não foi possível registrar a movimentação de caixa.' };
  }

  await supabase.from('audit_logs').insert({
    tenant_id: user.tenant_id,
    user_id: user.id,
    action: 'cash_movement_registered',
    entity_type: 'cash_movement',
    entity_id: data.id,
    metadata: { type: parsed.data.type, amount_cents: parsed.data.amountCents, reason: parsed.data.reason || null },
  });

  revalidatePath('/dashboard/pdv');
  return { success: true, cashMovement: data };
}

export async function createSale(input: CreateSaleInput) {
  const parsed = createSaleSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await requireAppUser();
  const supabase = createClient(cookies());
  const { cashRegisterId, items, payments, discountCents, customerId, sellerId, clientOperationId } = parsed.data;

  const { data, error } = await supabase.rpc('create_sale', {
    p_cash_register_id: cashRegisterId,
    p_items: items.map((i) => ({
      variant_id: i.variantId,
      quantity: i.quantity,
      unit_price_cents: i.unitPriceCents,
    })),
    p_payments: payments.map((p) => ({ method: p.method, amount_cents: p.amountCents })),
    p_discount_cents: discountCents,
    p_customer_id: customerId || null,
    p_seller_id: sellerId || null,
    p_client_operation_id: clientOperationId || null,
  });

  if (error) {
    // Sincronização offline: uma venda feita sem conexão pode chegar ao
    // servidor depois que o estoque real já mudou (outro caixa vendeu o
    // mesmo item). Nunca descarta a venda nem força — vira um conflito
    // visível para o gestor resolver, o operador do caixa nem percebe.
    if (clientOperationId) {
      const { error: conflictError } = await supabase.from('sync_conflicts').insert({
        tenant_id: user.tenant_id,
        client_operation_id: clientOperationId,
        operation_type: 'sale',
        payload: parsed.data,
        error_message: error.message,
      });
      // 23505 = já existe um conflito com esse client_operation_id (a
      // mesma sincronização rodou em paralelo/retry) — idempotente, não é
      // erro. Qualquer outro erro no insert do conflito é grave o
      // suficiente para não silenciar.
      if (conflictError && conflictError.code !== '23505') {
        throw new Error(`Falha ao registrar conflito de sincronização: ${conflictError.message}`);
      }
      return { error: 'Venda registrada como pendência de sincronização.', conflict: true };
    }
    if (error.message.includes('estoque negativo')) {
      return { error: 'Um dos itens não tem estoque suficiente.' };
    }
    if (error.message.includes('não corresponde ao total')) {
      return { error: 'A soma dos pagamentos não confere com o total da venda.' };
    }
    if (error.message.includes('caixa fechado')) {
      return { error: 'O caixa foi fechado. Abra um novo caixa para continuar vendendo.' };
    }
    return { error: 'Não foi possível registrar a venda.' };
  }

  await supabase.from('audit_logs').insert({
    tenant_id: user.tenant_id,
    user_id: user.id,
    action: 'sale_created',
    entity_type: 'sale',
    entity_id: data.id,
    metadata: { total_cents: data.total_cents, item_count: items.length },
  });

  revalidatePath('/dashboard/pdv');
  revalidatePath('/dashboard/estoque');
  return { success: true, sale: data };
}
