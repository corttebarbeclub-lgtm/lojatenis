# Permissões (RBAC)

Sete papéis fixos (enum `user_role` no banco): `owner`, `admin`, `manager`, `cashier`, `seller`, `stock`, `finance`.

## Fase 1

O primeiro usuário de um tenant (quem se cadastra) sempre recebe `owner`. Ainda não existe UI para convidar outros usuários ou trocar papéis — isso entra quando a Fase 9 (multi-usuário, parte do plano Profissional) for implementada.

O schema e o RLS já suportam múltiplos usuários por tenant com papéis distintos: testado manualmente (dois usuários no mesmo tenant, papéis `owner` e `seller`, ambos leem os dados um do outro dentro do tenant, nenhum vê dados de outro tenant).

## O que falta (fases futuras)

- Validação de permissão por **ação** (não só por tenant) — ex: `seller` não deveria conseguir alterar preço de produto. Isso é RBAC de verdade e entra junto com as telas que essas ações pertencem (produtos na Fase 2, PDV na Fase 4, etc.), não faz sentido implementar guards para ações que ainda não existem.
- Tela de gestão de usuários (convite, troca de papel, desativação).
