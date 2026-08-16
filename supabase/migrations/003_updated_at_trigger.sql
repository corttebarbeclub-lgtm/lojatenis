-- Função genérica de trigger para manter updated_at em qualquer tabela.

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('003', '003_updated_at_trigger', array['-- applied via management API'])
on conflict (version) do nothing;
