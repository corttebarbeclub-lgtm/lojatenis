# Fechamento do plano Básico (Fase 6)

## Escopo

Completa o que faltava do plano Básico (PDV + estoque + clientes + relatórios básicos + site básico), sem mexer no que já existia das Fases 1-5. Site público é vitrine sem carrinho — carrinho/checkout fica pra Fase 7.

## Dashboard com métricas reais

`/dashboard` trocou o placeholder da Fase 1 por métricas de verdade: vendas hoje, vendas no mês, ticket médio do mês, contagem de itens com estoque baixo. Todas calculadas com queries diretas sobre `sales`/`inventory` — sem tabela de cache de métricas (volume da loja piloto não justifica).

## Relatórios básicos

`/dashboard/relatorios` com seletor de período (hoje / 7 dias / mês) e três relatórios: produtos mais vendidos, formas de pagamento, vendas por vendedor. PostgREST não agrega bem `group by` complexo, então as agregações usam três funções SQL (`report_top_products`, `report_payment_methods`, `report_sales_by_seller`) em vez de tentar montar isso no client.

## Histórico de cliente

`/dashboard/clientes/[id]` mostra total gasto, número de compras, data da última compra e a lista completa de vendas daquele cliente — join direto em `sales`/`sale_items`, sem nova tabela.

## Site público (vitrine)

`/loja/[slug]` (listagem) e `/loja/[slug]/produto/[id]` (detalhe), fora da área autenticada, acessível por qualquer visitante.

**Decisão de segurança:** em vez de adicionar policies de RLS `to anon` diretamente em `products`/`product_variants` (o que abriria a tabela inteira pra qualquer campo que alguém adicionar no futuro, inclusive sensível como custo), o acesso público passa por três funções `security definer` (`get_storefront_tenant`, `get_storefront_products`, `get_storefront_product_detail`) que retornam só os campos necessários pra vitrine — nome, marca, categoria, descrição, imagem, preço, disponibilidade. O tenant é sempre resolvido pelo `slug`, nunca aceita `tenant_id` direto.

**Testado com API REST usando só a `anon key`, sem sessão de usuário:** a resposta contém exatamente os campos esperados, nada sensível.

### Domínio: subdomínio por tenant ainda não é viável

O usuário queria subdomínio por tenant desde já (`tenisdoze.lojatenis.com`), mas o projeto Vercel só tem domínios `.vercel.app` — nenhum domínio próprio comprado ainda. Pesquisado e confirmado: wildcard subdomain no Vercel exige domínio próprio com nameservers apontadas pra Vercel, não há como fazer isso só com `.vercel.app`. Decisão: usar `/loja/[slug]` por enquanto (path, mesmo domínio) — quando houver domínio próprio, a migração para subdomínio real é configuração de DNS/Vercel, não reescrita de código.

## Testado manualmente (Playwright + API direta)

- Fluxo completo: produto → estoque → cliente → venda associada ao cliente → dashboard reflete a venda → relatório mostra o produto vendido e a forma de pagamento → histórico do cliente mostra a compra
- Site público mostra o produto e preço corretamente sem login
- Isolamento entre tenants: produto do tenant A acessado com o slug do tenant B retorna 404 (a função SQL exige `tenant_id` e `slug` combinando); vitrine do tenant B corretamente vazia; slug inexistente também 404
- Chamada direta à API REST com só a `anon key` confirma que a função de vitrine nunca retorna campo sensível
