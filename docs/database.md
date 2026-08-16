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

## Migrations aplicadas

- `001_foundation.sql` — schema completo acima + RLS + função `auth_tenant_id()`.
- `002_signup_bootstrap.sql` — função `create_tenant_for_new_user(p_tenant_name, p_store_name, p_full_name)`.

Aplicadas via Supabase Management API (`POST /v1/projects/{ref}/database/query`), registradas em `supabase_migrations.schema_migrations`.

## Bootstrap do primeiro acesso

`create_tenant_for_new_user` é uma função `security definer` chamada via RPC pelo usuário recém-autenticado. Em uma única transação: cria `tenant`, `subscription` (`basic`/`trialing`), `store` principal, o registro `users` com `role = 'owner'`, e uma entrada em `audit_logs`. Rejeita explicitamente se o usuário chamador já tiver um registro em `users` — protege contra o callback de confirmação rodar duas vezes.

## Convenção para novas tabelas

Toda tabela de domínio que for adicionada em fases futuras deve:

1. Ter coluna `tenant_id uuid not null references tenants(id) on delete cascade`.
2. Ter RLS habilitado com policy baseada em `auth_tenant_id()`.
3. Ganhar índice em `tenant_id` se for consultada com frequência.
