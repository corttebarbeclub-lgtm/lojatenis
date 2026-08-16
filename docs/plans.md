# Planos e feature flags

## Catálogo (seed em `001_foundation.sql`)

| Plano | Preço | Usuários | Filiais |
|---|---|---|---|
| `basic` | R$149/mês | 1 | 1 |
| `pro` | R$249/mês | 10 | 1 |
| `premium` | R$399/mês | ilimitado | ilimitado |

Cada plano carrega um array `features: text[]` com os slugs habilitados (`pdv`, `ecommerce`, `whatsapp`, `ai_assistant`, etc. — lista completa no tipo `PlanFeature` em `src/types/database.ts`).

Todo tenant novo nasce em `basic` / `trialing` (função `create_tenant_for_new_user`). Não há checkout ou billing real ainda — isso é trabalho futuro, fora do escopo da Fase 1.

## Guard de backend

`src/lib/plans/index.ts` expõe:

- `requireFeature(tenantId, feature)` — lança `FeatureNotAllowedError` se o plano ativo do tenant não incluir a feature. Toda Server Action ou Route Handler que tocar um recurso pago deve chamar isso **antes** de executar a operação — nunca confiar só em esconder botão na UI.
- `requireUserSlot(tenantId)` — lança `UserLimitReachedError` se o tenant já atingiu `max_users` do plano.

Nenhuma tela ainda invoca esses guards na Fase 1, porque nenhuma feature paga tem UI própria ainda — eles existem prontos para quando a Fase 9 (comissões, fidelidade) e a Fase 8 (WhatsApp) forem implementadas.
