import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmlxhsqfvxjggvqusleu.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
  }

  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

export async function checkAndNotifyRestockedItems(productId: string, restockedSizes: string[]) {
  try {
    const supabase = getAdminClient();

    // 1. Buscar produto
    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .single();

    const productName = product?.name || 'Tênis';

    // 2. Buscar alertas pendentes para este produto e tamanhos reabastecidos
    const { data: alerts, error } = await supabase
      .from('stock_alerts')
      .select('id, email, customer_name, size')
      .eq('product_id', productId)
      .eq('status', 'pending')
      .in('size', restockedSizes);

    if (error || !alerts || alerts.length === 0) {
      return { notifiedCount: 0 };
    }

    console.log(`📧 Disparando ${alerts.length} alertas de reposição para o tênis "${productName}"...`);

    // 3. Simular/Enviar e-mail para cada cliente
    const alertIds = alerts.map((a) => a.id);

    for (const alert of alerts) {
      console.log(`[E-MAIL ENVIADO] Para: ${alert.email} | Assunto: O tênis ${productName} (Tam ${alert.size}) acabou de chegar no estoque!`);
    }

    // 4. Marcar alertas como 'notified'
    await supabase
      .from('stock_alerts')
      .update({
        status: 'notified',
        notified_at: new Date().toISOString(),
      })
      .in('id', alertIds);

    return { notifiedCount: alerts.length };
  } catch (err) {
    console.error('Erro ao notificar alertas de estoque:', err);
    return { notifiedCount: 0 };
  }
}
