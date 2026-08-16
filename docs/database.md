# Banco de dados

Projeto Supabase: `lojatenis` (ref `jmlxhsqfvxjggvqusleu`, região `sa-east-1`).

## Tabelas (Fase 1)

| Tabela | Descrição |
|---|---|
| `plans` | Catálogo estático dos 3 planos (basic/pro/premium): preço, limites, lista de features. |
| `tenants` | Uma linha por loja cliente da plataforma. `slug` único gerado no bootstrap. |
| `subscriptions` | Assinatura ativa de cada tenant. Relação 1:1 com `tenants` (`unique (tenant_id)`) — multi-plano por tenant não existe. |
| `stores` | Filiais do tenant. Fase 1 sempre cria uma única loja `is_main = true`; multi-filial chega na Fase 10. |
| `users` | Espelha `auth.users` (mesmo `id`, FK `on delete cascade`). Carrega `tenant_id`, `store_id`, `role`. |
| `audit_logs` | Trilha de auditoria por tenant: ação, entidade, metadata livre em `jsonb`. |

## Tabelas (Fase 2)

| Tabela | Descrição |
|---|---|
| `brands`, `categories`, `suppliers` | Entidades simples por tenant, `unique (tenant_id, name)`. Criáveis inline no formulário de produto. |
| `products` | Dados comuns ao modelo (nome, marca, categoria, fornecedor, gênero, referência, NCM). |
| `product_variants` | Cada combinação vendável de cor+tamanho: SKU, código de barras, custo, preço. `unique (product_id, color, size)`. |
| `product_images` | Fotos do produto: `storage_path`, `url`, posição, `is_primary`, dimensões e tamanho pós-compressão. |

Ver [products.md](products.md) para detalhes de imagem e o achado de segurança do trigger de consistência.

## Tabelas (Fase 3)

| Tabela | Descrição |
|---|---|
| `inventory` | Saldo atual e mínimo por variante, `unique(variant_id)`. Nunca escrita diretamente — só via `register_inventory_movement`/`set_min_quantity`. |
| `inventory_movements` | Histórico append-only: tipo (`entry`/`adjustment`/`count`), delta aplicado, saldo resultante, motivo, usuário. |

Ver [inventory.md](inventory.md) para o fluxo de movimentação e um achado real de mapeamento PostgREST (relação 1:1 via `unique` retorna objeto, não array).

## Migrations aplicadas

- `001_foundation.sql` — schema da Fase 1 + RLS + função `auth_tenant_id()`.
- `002_signup_bootstrap.sql` — função `create_tenant_for_new_user(p_tenant_name, p_store_name, p_full_name)`.
- `003_updated_at_trigger.sql` — função genérica `set_updated_at()`.
- `004_products.sql` — schema de produtos da Fase 2 acima + RLS.
- `005_storage_policies.sql` — policies do bucket `product-images` (leitura pública, escrita/exclusão por tenant).
- `006_tenant_consistency_guard.sql` — trigger que impede `product_variants`/`product_images` de referenciar produto de outro tenant (RLS sozinho não cobre esse caso).
- `007_inventory.sql` — schema de estoque da Fase 3 acima + funções `register_inventory_movement`/`set_min_quantity` + trigger de consistência reaproveitado contra `product_variants`.

Aplicadas via Supabase Management API (`POST /v1/projects/{ref}/database/query`), registradas em `supabase_migrations.schema_migrations`.

## Bootstrap do primeiro acesso

`create_tenant_for_new_user` é uma função `security definer` chamada via RPC pelo usuário recém-autenticado. Em uma única transação: cria `tenant`, `subscription` (`basic`/`trialing`), `store` principal, o registro `users` com `role = 'owner'`, e uma entrada em `audit_logs`. Rejeita explicitamente se o usuário chamador já tiver um registro em `users` — protege contra o callback de confirmação rodar duas vezes.

## Convenção para novas tabelas

Toda tabela de domínio que for adicionada em fases futuras deve:

1. Ter coluna `tenant_id uuid not null references tenants(id) on delete cascade`.
2. Ter RLS habilitado com policy baseada em `auth_tenant_id()`.
3. Ganhar índice em `tenant_id` se for consultada com frequência.
