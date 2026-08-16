-- Bug real encontrado em teste: sync_conflicts não tinha proteção contra
-- duplicação, diferente de sales/cash_movements (que usam unique index em
-- client_operation_id). Se syncQueue() roda duas vezes em sequência rápida
-- (ex: heartbeat de segurança + evento 'online' quase simultâneos), a
-- mesma operação conflitante podia gerar duas linhas de conflito.

create unique index sync_conflicts_client_operation_id_idx
  on sync_conflicts(tenant_id, client_operation_id);

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('013', '013_sync_conflicts_idempotency', array['-- applied via management API'])
on conflict (version) do nothing;
