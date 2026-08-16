# Estoque (Fase 3)

## Modelo de dados

`inventory` guarda o saldo **atual** por variante (`unique(variant_id)`) e o estoque mínimo. `inventory_movements` é o histórico append-only — cada linha registra o tipo de movimento, o delta aplicado e o saldo resultante.

Estoque mínimo é por variante (cor+tamanho), não por produto — um tamanho pode esgotar antes de outro do mesmo modelo.

## Regra central: saldo nunca é escrito diretamente

Toda alteração passa pela função Postgres `register_inventory_movement(variant_id, type, quantity, reason)`, que roda dentro de uma transação: lê o saldo atual com `for update` (trava a linha), calcula o novo saldo, escreve em `inventory` e grava a movimentação em `inventory_movements` — nunca uma sem a outra. Não existe policy de RLS de `insert`/`update` direta nessas tabelas; a única forma de escrever é pela função `security definer`, que já valida o tenant internamente.

Três tipos de movimento:

| Tipo | Significado | `quantity` recebido pela função |
|---|---|---|
| `entry` | Entrada de mercadoria | Delta positivo |
| `adjustment` | Correção manual (perda, achado, erro) | Delta (positivo ou negativo) |
| `count` | Resultado de contagem física | Saldo absoluto final — a função calcula o delta internamente |

A função rejeita qualquer operação que resultaria em saldo negativo (`raise exception`), então uma venda ou ajuste não pode "furar" o estoque real — isso antecipa a regra que a Fase 4 (PDV) também vai precisar respeitar.

## UI

`/dashboard/estoque` lista todas as variações ativas do tenant com saldo, mínimo e um badge (`OK`/`Baixo`) quando `quantity <= min_quantity`. Cada linha abre um dialog (`MovementDialog`) com abas para Entrada, Ajuste (com toggle adicionar/remover), Contagem e definição de estoque mínimo. `/dashboard/estoque/[variantId]` mostra o extrato completo de movimentações daquela variação, mais recente primeiro.

## Achados durante os testes

**Bug real de mapeamento PostgREST → TypeScript:** a página de estoque tratava a relação `inventory(quantity, min_quantity)` como array (`inventory[0]`), mas o PostgREST retorna a relação como **objeto único** quando a tabela filha tem `unique` na coluna de FK — o schema define `unique(variant_id)`, então o Supabase infere 1:1, não 1:N. O saldo aparecia sempre como `0` na tela mesmo com o dado correto no banco. Corrigido tratando `variant.inventory` como `Inventory | null`, não array. Vale lembrar esse comportamento para qualquer join futuro contra uma tabela com `unique` na FK.

**Trigger de consistência reaproveitado:** `inventory` e `inventory_movements` usam o mesmo padrão de trigger `check_variant_tenant_consistency` introduzido na Fase 2 (renomeado de `check_product_tenant_consistency`, mas equivalente — valida contra `product_variants` em vez de `products`). Testado o mesmo tipo de ataque cruzado via RPC direto (`register_inventory_movement` com `variant_id` de outro tenant) — bloqueado pela validação explícita dentro da própria função (`v_tenant_id != auth_tenant_id()`), antes mesmo de chegar no trigger.

## Testado manualmente (Playwright + API direta)

- Sequência completa: saldo inicial 0 → entrada +10 → mínimo definido em 5 (status OK) → ajuste -7 (status Baixo) → contagem definindo 20 → tentativa de remover 999 corretamente bloqueada (nenhuma linha órfã gravada, confirmado no banco)
- Histórico mostra exatamente os 3 movimentos válidos, na ordem certa, com o delta e saldo resultante corretos
- Isolamento entre tenants: RPC de escrita cross-tenant bloqueado, leitura via REST retorna vazio, histórico de variante de outro tenant retorna 404 na UI
