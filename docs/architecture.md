# Arquitetura

Visão consolidada da Fase 0 (decisões de arquitetura) e do que foi de fato implementado na Fase 1.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14.2 (App Router, TypeScript strict) |
| Estilos | Tailwind CSS + shadcn/ui (tema `neutral`) |
| Backend | Server Actions e Route Handlers do próprio Next.js |
| Banco | Supabase (PostgreSQL + Auth + RLS) |
| Validação | Zod |
| Formulários | react-hook-form |
| Notificações | sonner |
| Hospedagem (planejada) | Vercel |
| Imagens | Supabase Storage (transicional — ver [products.md](products.md); troca para ImageKit é isolada via interface `ImageProvider`) |
| PDV offline (a partir da Fase 5) | IndexedDB |

## Por que Server Actions em vez de backend separado

Um serviço backend dedicado seria complexidade sem benefício nesta fase — RLS já garante isolamento no nível de dado, então a "API" vive dentro do próprio Next.js sem abrir brecha de segurança. Se sync offline ou IA exigirem workers em background mais adiante, isso é extensão aditiva, não reescrita.

## Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/{login,signup}/     # rotas públicas de autenticação
│   ├── auth/callback/route.ts     # troca code por sessão (Supabase Auth)
│   ├── dashboard/                 # área logada, protegida pelo middleware
│   └── page.tsx                   # redireciona para /login ou /dashboard
│
├── components/
│   ├── dashboard/                 # shell da área logada (sidebar, header)
│   ├── products/                  # formulário de produto, upload de imagem
│   ├── inventory/                 # dialog de movimentação de estoque
│   ├── pdv/                       # busca, carrinho, checkout, caixa
│   └── ui/                        # shadcn/ui
│
├── lib/
│   ├── tenant/                    # resolução do usuário/tenant autenticado
│   ├── plans/                     # guard de feature flags e limites por plano
│   ├── image/                     # compressão de imagem no navegador
│   ├── providers/                 # ImageProvider (adapter — hoje Supabase Storage)
│   └── validations/                # schemas Zod
│
├── types/database.ts              # tipos espelhando o schema do Supabase
│
└── utils/supabase/{client,server,middleware}.ts
```

## Roadmap de fases

Ver o documento de Fase 0 (arquitetura completa, publicado como artifact) para o roadmap de 12 fases. Resumo do que já está pronto e do que vem a seguir:

- ✅ **Fase 0** — Análise e arquitetura
- ✅ **Fase 1** — Fundação: projeto, auth, tenant, usuários, permissões, layout, dashboard inicial
- ✅ **Fase 2** — Produtos: marcas, categorias, variações (cor×tamanho), fornecedores, upload com compressão (Supabase Storage transicional)
- ✅ **Fase 3** — Estoque: saldo por variação, movimentações (entrada/ajuste/contagem), estoque mínimo com alerta, histórico
- ✅ **Fase 4** — PDV: caixa, venda com múltiplos pagamentos, desconto, cliente/vendedor, sangria/suprimento (trocas/devoluções ficam para fase própria)
- ⬜ **Fase 5** — Offline (IndexedDB, sync, conflitos)
- ⬜ **Fase 6** — Fechamento do plano Básico
- ⬜ **Fase 7** — E-commerce
- ⬜ **Fase 8** — WhatsApp (Evolution API)
- ⬜ **Fase 9** — Fechamento do plano Profissional
- ⬜ **Fase 10** — Multi-filial
- ⬜ **Fase 11** — Premium (CRM, automações, omnichannel)
- ⬜ **Fase 12** — IA Premium (cadastro de produto por WhatsApp)

Nenhuma fase avança sem comando explícito do usuário.
