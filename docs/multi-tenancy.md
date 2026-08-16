# Multi-tenancy

Isolamento em duas camadas redundantes.

## Camada 1 — resolução de tenant na aplicação

`src/lib/tenant/index.ts` expõe `getCurrentAppUser()` / `requireAppUser()`, que buscam o registro `users` (com `tenant_id` e `role`) do usuário autenticado na sessão atual. Toda tela e Server Action que precisa do contexto do tenant passa por aqui — nunca lê `tenant_id` de um formulário ou query param vindo do cliente.

`src/middleware.ts` protege `/dashboard/*`: sem sessão válida, redireciona para `/login`.

## Camada 2 — RLS como piso de segurança

Toda tabela de domínio tem RLS habilitado com policies equivalentes a:

```sql
tenant_id = auth_tenant_id()
```

onde `auth_tenant_id()` é uma função `sql stable security definer` que resolve `tenant_id` a partir de `auth.uid()`. Isso vale para `select`, `insert` e `update` — mesmo que a aplicação tenha um bug e esqueça de filtrar por tenant, o Postgres recusa a operação.

## Testes de isolamento executados na Fase 1

Validados manualmente via API REST do Supabase (dois tenants reais, dois usuários reais, sessões distintas):

- Usuário do tenant B pedindo `tenants?id=eq.<id-do-tenant-A>` → array vazio (RLS filtra antes de expor).
- Usuário do tenant B pedindo todos os `tenants` sem filtro → só vê o próprio.
- Usuário do tenant B tentando `INSERT` em `stores` com `tenant_id` do tenant A → `403`, `new row violates row-level security policy`.
- Usuário do tenant B tentando `UPDATE` em um `users` do tenant A → `200` mas zero linhas afetadas (confirmado por leitura direta: dado do tenant A permaneceu intacto).

Nenhum desses casos depende de código de aplicação correto — são garantidos pelo banco.
