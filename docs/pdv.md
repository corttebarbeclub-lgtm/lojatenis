# PDV (Fase 4)

## Escopo desta fase

PDV completo: abertura/fechamento de caixa, venda com carrinho, múltiplos pagamentos, desconto, cliente e vendedor opcionais, sangria e suprimento. **Trocas e devoluções ficam para uma fase própria** — são um fluxo complexo o suficiente (busca venda antiga, devolve/retira estoque, calcula diferença) para merecer escopo e teste isolados. Operação offline é a Fase 5.

## Modelo de dados

`cash_registers` é uma sessão de caixa por loja — só uma aberta por vez (`unique index ... where status = 'open'`). Toda venda e movimentação de caixa fica presa a uma sessão aberta; não existe operação de caixa sem sessão. `cash_movements` registra sangria (`withdrawal`) e suprimento (`reinforcement`).

`sales` / `sale_items` / `payments` formam a venda. Uma venda pode ter múltiplos itens e múltiplos pagamentos (ex: metade dinheiro, metade PIX).

## Regra central: toda escrita passa por função `security definer`

Igual ao padrão do estoque (Fase 3), nenhuma tabela de PDV tem policy de RLS de `insert`/`update` direta — só `select`. Escrita acontece via:

- `open_cash_register` / `close_cash_register` — valida que não há caixa já aberto na loja; no fechamento, calcula o saldo esperado somando pagamentos em dinheiro das vendas + suprimentos - sangrias, e compara com o saldo informado pelo operador.
- `register_cash_movement` — sangria/suprimento, só em caixa aberto.
- `create_sale` — a mais crítica: recebe itens e pagamentos como `jsonb`, calcula subtotal/total no servidor (nunca confia em valores vindos do client), confere que a soma dos pagamentos bate exatamente com o total, dá baixa no estoque item a item via `register_inventory_movement` (que já impede saldo negativo) e insere venda+itens+pagamentos — tudo em uma transação.

## Baixa de estoque por venda

O tipo `sale` foi adicionado ao enum `inventory_movement_type` (migration separada — `ALTER TYPE ADD VALUE` não pode rodar na mesma transação em que o valor é referenciado). `create_sale` chama `register_inventory_movement(variant_id, 'sale', -quantidade, 'Venda {id}')` para cada item — se qualquer item não tiver estoque suficiente, a função de estoque lança exceção e a venda inteira é revertida (nenhuma venda parcial, nenhum item vendido sem os outros).

## UI

`/dashboard/pdv` mostra o formulário de abertura de caixa se não há sessão aberta na loja do usuário, ou a interface de venda (busca de produto + carrinho + checkout) caso contrário. O cabeçalho do caixa aberto tem botões de Suprimento, Sangria e Fechar caixa. O checkout permite desconto, cliente/vendedor opcionais (criáveis em `/dashboard/clientes` e `/dashboard/vendedores`) e múltiplas linhas de pagamento com métodos independentes.

## Testado manualmente (Playwright + API direta)

- Fluxo completo: criar produto → dar entrada no estoque → abrir caixa → buscar produto no PDV → carrinho → checkout com 2 pagamentos (dinheiro + PIX) somando ao total → venda registrada → estoque baixado corretamente → carrinho volta vazio
- Suprimento e sangria registrados corretamente
- Fechamento de caixa: saldo esperado calculado corretamente (abertura + vendas em dinheiro + suprimentos − sangrias), diferença exibida quando o saldo informado diverge
- Isolamento entre tenants: `register_cash_movement` e `create_sale` bloqueados ao tentar operar em caixa de outro tenant (mensagem "Caixa não encontrado", sem revelar que o caixa existe em outro tenant); tentativa de vender um `variant_id` de outro tenant usando caixa próprio bloqueada pelo trigger de consistência já existente da Fase 2/3, sem precisar de código novo
