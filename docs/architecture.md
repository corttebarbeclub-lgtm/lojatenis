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
| PDV offline | IndexedDB (via `idb`) — ver [offline.md](offline.md) |

## Por que Server Actions em vez de backend separado

Um serviço backend dedicado seria complexidade sem benefício nesta fase — RLS já garante isolamento no nível de dado, então a "API" vive dentro do próprio Next.js sem abrir brecha de segurança. Se sync offline ou IA exigirem workers em background mais adiante, isso é extensão aditiva, não reescrita.

## Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/{login,signup}/     # rotas públicas de autenticação
│   ├── auth/callback/route.ts     # troca code por sessão (Supabase Auth)
│   ├── dashboard/                 # área logada, protegida pelo middleware
│   ├── loja/[slug]/               # site público (vitrine, sem carrinho — anônimo)
│   └── page.tsx                   # redireciona para /login ou /dashboard
│
├── components/
│   ├── dashboard/                 # shell da área logada (sidebar, header)
│   ├── products/                  # formulário de produto, upload de imagem
│   ├── inventory/                 # dialog de movimentação de estoque
│   ├── pdv/                       # busca, carrinho, checkout, caixa
│   ├── reports/                   # seletor de período dos relatórios
│   └── ui/                        # shadcn/ui
│
├── lib/
│   ├── tenant/                    # resolução do usuário/tenant autenticado
│   ├── plans/                     # guard de feature flags e limites por plano
│   ├── image/                     # compressão de imagem no navegador
│   ├── providers/                 # ImageProvider (adapter — hoje Supabase Storage)
│   ├── offline/                   # IndexedDB, fila, sync engine, indicador de conexão
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
- ✅ **Fase 5** — Offline: venda e caixa funcionam sem conexão, idempotência real, conflitos de estoque nunca resolvidos silenciosamente
- ✅ **Fase 6** — Fechamento do plano Básico: dashboard com métricas reais, relatórios, histórico de cliente, site público de vitrine
- ✅ **Fase 7** — E-commerce Varejo (vitrine Centauro-style, filtros, galeria, seletor) + Atacado B2B (preços atacado, qtd mínima, grade de tamanhos)
- ⬜ **Fase 8** — WhatsApp (Evolution API)
- ⬜ **Fase 9** — Fechamento do plano Profissional
- ⬜ **Fase 10** — Multi-filial
- ⬜ **Fase 11** — Premium (CRM, automações, omnichannel)
- ⬜ **Fase 12** — IA Premium (cadastro de produto por WhatsApp)

Nenhuma fase avança sem comando explícito do usuário.

## Nota: extensão de escopo pendente (ERP completo)

O usuário estendeu o escopo original (SaaS PDV+estoque) para um ERP vertical completo para varejo de calçados — compras, financeiro, fiscal (NF-e/NFC-e), e-commerce, marketplaces, logística, CRM avançado, API pública, decisão de priorizar facilidade de uso sobre quantidade de funcionalidades e arquitetura correta sobre velocidade. Decisão tomada: terminar a Fase 5 (já em andamento) normalmente, e só depois redesenhar o roadmap completo incorporando esse escopo — não decidido ainda como as fases 6-12 se reorganizam.
