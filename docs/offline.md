# PDV offline-first (Fase 5)

## Escopo confirmado antes de implementar

Offline cobre só **venda** (`create_sale`) e **sangria/suprimento** em caixa já aberto. Abrir e fechar caixa sempre exigem conexão — são eventos raros no dia, a fricção de exigir internet nesses momentos é aceitável, e evita casos de borda complexos (ex: dois dispositivos abrindo caixa offline pra mesma loja). Catálogo offline é um cache completo (~500 variações esperadas para loja piloto), sem paginação ou sync incremental.

## Arquitetura

**IndexedDB** (`src/lib/offline/db.ts`, via `idb`) guarda dois object stores:
- `catalog` — snapshot das variações ativas (nome, cor, tamanho, preço, estoque conhecido), recarregado inteiro toda vez que a página carrega online.
- `queue` — operações pendentes de sincronização (`SALE_CREATED`, `CASH_MOVEMENT_CREATED`), cada uma com um `clientOperationId` (UUID) gerado **no momento da criação**, não no envio.

Quando offline, a busca de produto (`ProductSearch`) usa `searchCatalog()` sobre o cache local em vez de consultar o Supabase. Uma venda offline decrementa o estoque **local** de forma otimista (só para a UI continuar coerente) — a baixa real e definitiva só acontece quando a operação é sincronizada com o servidor.

## Idempotência real (não "melhor esforço")

`sales` e `cash_movements` ganharam a coluna `client_operation_id uuid`, com `unique index (tenant_id, client_operation_id) where client_operation_id is not null`. `create_sale` e `register_cash_movement` foram atualizadas: se já existe uma linha com o mesmo `client_operation_id`, a função retorna o registro existente em vez de criar um novo — nunca duplica, mesmo que a mesma operação seja reenviada (retry de rede durante a própria sincronização).

**Testado e confirmado:** chamar `create_sale` duas vezes com o mesmo `client_operation_id` retorna o mesmíssimo `id` de venda nas duas vezes; `count(*)` no banco confirma exatamente 1 linha.

## Conflito de estoque — nunca resolvido silenciosamente

Cenário da Fase 0: dois caixas offline, o último par em estoque, ambos vendem sem saber um do outro. Quando a sincronização de uma venda offline encontra estoque insuficiente, a Server Action **não descarta a venda nem força a operação** — grava um registro em `sync_conflicts` (payload original + mensagem de erro) e segue processando as próximas operações da fila normalmente. O operador do caixa nem percebe; um badge discreto ("Offline · N pendente(s)" ou link "Pendências de sincronização") fica visível, e a resolução acontece em `/dashboard/pdv/conflitos`, tela separada para o gestor.

**Testado com dois "caixas" reais (dois `BrowserContext` distintos) offline simultaneamente vendendo a mesma última unidade:** uma venda foi criada com sucesso, a outra virou exatamente 1 conflito pendente, o estoque final nunca ficou negativo. A tela de conflitos permite marcar como resolvido com uma nota.

## Indicador de conexão

`useConnectionStatus()` escuta os eventos nativos `online`/`offline` do navegador e dispara `syncQueue()` automaticamente quando a conexão volta. Como fallback (o evento nativo não é 100% confiável em toda troca de rede), há um heartbeat leve a cada 15s que tenta sincronizar se `navigator.onLine` for verdadeiro — sem bater no servidor sem necessidade quando já está tudo sincronizado (a fila vazia torna a chamada barata).

Fechar caixa fica desabilitado (com tooltip explicando o motivo) enquanto offline.

## Achados reais durante os testes

**Bug de RLS (não vulnerabilidade — bloqueava o próprio funcionamento):** a migration inicial criou `sync_conflicts` com policies de `select` e `update`, mas esqueceu `insert`. RLS sem policy de insert nega a escrita silenciosamente — a Server Action tentava gravar o conflito e falhava sem que o código checasse esse erro específico, fazendo a venda offline sumir sem deixar rastro (exatamente o que a Fase 0 disse para nunca deixar acontecer). Corrigido com a policy faltante e o código passou a lançar erro explícito se o insert do conflito falhar por qualquer motivo além de duplicidade.

**Bug de idempotência na própria tabela de conflitos:** descoberto ao investigar o bug acima — `sync_conflicts` não tinha proteção contra duplicação como `sales`/`cash_movements` têm. Um heartbeat de sincronização rodando em paralelo com o evento `online` chegou a gravar o mesmo conflito duas vezes. Corrigido com `unique index (tenant_id, client_operation_id)` e tratamento do código `23505` (violação de unicidade) como sucesso idempotente, não erro.

**Limitação de teste (não do produto):** `context.setOffline()` do Playwright bloqueia rede de fato, mas não dispara os eventos nativos `window.addEventListener('online'/'offline')` — é uma limitação documentada do próprio Playwright. Os testes precisaram disparar `window.dispatchEvent(new Event('online'))` manualmente. No navegador real do usuário, o evento nativo dispara normalmente sozinho.

## Testado manualmente (Playwright, com rede real bloqueada via `context.setOffline`)

- Fluxo completo online → offline → venda offline → volta online → sincronização automática → pendência zerada
- Busca de produto funcionando via cache local quando offline
- Idempotência real confirmada via chamada dupla direta ao RPC
- Conflito de estoque com dois caixas simultâneos: 1 venda + 1 conflito, nunca estoque negativo, nunca duplicação
- Resolução de conflito pela UI com nota
- Isolamento entre tenants nas novas tabelas (`sync_conflicts`): leitura e escrita cross-tenant bloqueadas, sem revelar a existência do registro
