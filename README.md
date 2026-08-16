# Lojatenis

SaaS multi-tenant para lojas de calçados: PDV, estoque, site, WhatsApp e IA.

Projeto em desenvolvimento por fases — ver [docs/architecture.md](docs/architecture.md) para a visão completa e o roadmap.

## Stack

Next.js 14.2 (App Router, TypeScript strict) · Tailwind CSS + shadcn/ui (tema `neutral`) · Supabase (Postgres + Auth + RLS) · Zod · react-hook-form · sonner

## Comandos

```bash
npm run dev      # dev em localhost:3000
npm run build    # build de produção (rodar sempre antes de commitar)
npm run lint     # ESLint
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com as credenciais do projeto Supabase:

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Status

**Fase 1 — Fundação** concluída: autenticação (email/senha), estrutura multi-tenant, RLS, papéis de usuário (RBAC), planos/feature flags e dashboard inicial.

**Fase 2 — Produtos** concluída: marcas, categorias, fornecedores, produtos com variações (cor×tamanho), upload de imagem com compressão no navegador. Ver [docs/products.md](docs/products.md).

**Fase 3 — Estoque** concluída: saldo por variação, movimentações (entrada/ajuste/contagem), estoque mínimo com alerta, histórico completo. Ver [docs/inventory.md](docs/inventory.md).

**Fase 4 — PDV** concluída: abertura/fechamento de caixa, venda com carrinho e múltiplos pagamentos, desconto, cliente/vendedor, sangria e suprimento. Ver [docs/pdv.md](docs/pdv.md).

**Fase 5 — Offline-first** concluída: venda e sangria/suprimento funcionam sem conexão (IndexedDB + fila), sincronização automática ao voltar online, idempotência real via `client_operation_id`, conflitos de estoque nunca resolvidos silenciosamente. Ver [docs/offline.md](docs/offline.md).

Ver [docs/architecture.md](docs/architecture.md) para o roadmap completo das próximas fases.
