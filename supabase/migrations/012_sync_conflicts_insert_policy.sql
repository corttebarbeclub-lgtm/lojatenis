-- Bug real encontrado em teste: 011_offline_sync.sql criou RLS em
-- sync_conflicts com policies de select e update, mas esqueceu insert.
-- RLS sem policy de insert nega toda escrita silenciosamente — a Server
-- Action tentava gravar o conflito e falhava sem erro visível, porque o
-- código não checava o retorno desse insert específico.

create policy sync_conflicts_insert_own_tenant on sync_conflicts
  for insert to authenticated
  with check (tenant_id = auth_tenant_id());

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('012', '012_sync_conflicts_insert_policy', array['-- applied via management API'])
on conflict (version) do nothing;
