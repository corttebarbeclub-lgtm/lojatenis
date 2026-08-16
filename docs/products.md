# Catálogo de produtos (Fase 2)

## Modelo de dados

`products` guarda o que é comum ao modelo (nome, marca, categoria, fornecedor, gênero, referência, NCM). `product_variants` guarda cada combinação vendável de cor+tamanho, com seu próprio SKU, código de barras, custo e preço (`unique (product_id, color, size)`). `product_images` guarda as fotos, com posição e flag de imagem principal.

Marcas, categorias e fornecedores são entidades simples por tenant (`unique (tenant_id, name)`), criáveis inline durante o cadastro de produto sem sair da tela.

Nenhuma tabela de estoque real existe ainda — isso é Fase 3. A Fase 2 cobre só o cadastro do produto e suas variações.

## Salvar produto (delete-all + reinsert de variações)

Mesmo padrão usado para planos alimentares no Nutritk: ao editar um produto, `updateProduct` deleta todas as `product_variants` existentes e reinsere a lista completa vinda do formulário. Simples e correto porque não há ainda nenhuma referência de estoque presa ao `id` da variante (isso muda na Fase 3, quando o delete-all vai precisar ser revisitado).

## Imagens — Supabase Storage temporário

**Decisão registrada:** a conta ImageKit ainda não existe (criação é manual, sem Management API). Enquanto isso, o upload usa Supabase Storage por trás da interface `ImageProvider` (`src/lib/providers/image-provider.ts`). Trocar para ImageKit no futuro é uma nova implementação dessa interface — nenhum código de produtos precisa mudar.

Bucket `product-images` (público, 5MB de limite por arquivo, só JPEG/PNG/WebP). Path: `{tenant_id}/products/{product_id}/{uuid}-{nome-original}`. Policies de RLS do Storage replicam a mesma regra de tenant: leitura pública (URLs de produto não exigem sessão), escrita e exclusão restritas a quem tem `tenant_id` batendo com o primeiro segmento do path.

### Compressão (`src/lib/image/compress.ts`)

Roda no navegador antes do upload: `createImageBitmap` + `canvas`, redimensiona para no máximo 1600×1600 (nunca faz upscale), converte para WebP a 82% de qualidade. Testado com imagem real de 2000×2000 (~2.4MB) → 1600×1600 WebP (~42KB), 98%+ de economia — dentro do range 80–95% esperado pela Fase 0.

## Achado de segurança corrigido durante os testes

RLS por si só garante `tenant_id = auth_tenant_id()` em cada linha, mas isso não impede um usuário do tenant B de inserir uma `product_variant` com `tenant_id = B` e `product_id` apontando para um produto do tenant A — a policy nunca compara contra a tabela pai. Confirmado via teste manual (dois tenants reais, API REST direta): a inserção cruzada passava.

Corrigido em `006_tenant_consistency_guard.sql`: trigger `before insert or update` em `product_variants` e `product_images` que busca o `tenant_id` do `products` referenciado e rejeita se não bater com o `tenant_id` da linha sendo inserida. Reexecutado o mesmo ataque após a correção — bloqueado com "Produto referenciado não existe" (mensagem que não revela se o produto existe em outro tenant). Fluxo legítimo (mesmo tenant) confirmado intacto depois da correção.

Esse é um padrão a repetir em qualquer tabela futura que referencie outra tabela de domínio por FK dentro do mesmo tenant (ex: `sale_items` → `products`, Fase 4) — RLS na tabela filha não é suficiente sozinho quando existe uma referência a outra tabela tenant-scoped.

## Testado manualmente (Playwright, ponta a ponta)

- Criar produto com múltiplas variações (cor×tamanho, preço, custo, SKU, código de barras)
- Criar marca/categoria/fornecedor inline durante o cadastro, sem perder o restante do formulário
- Editar produto (nome e preços) e confirmar persistência
- Upload de imagem com compressão, toast de economia visível, redimensionamento e formato corretos
- Definir imagem principal, remover imagem (banco + Storage físico)
- Excluir produto (cascade de variações e imagens, banco + Storage físico)
- Isolamento entre tenants: leitura (`404` na UI, array vazio na API), escrita (bloqueada por RLS), e a vulnerabilidade de variante cruzada acima
