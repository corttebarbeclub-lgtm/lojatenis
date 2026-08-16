-- Separado em migration própria: ALTER TYPE ADD VALUE não pode ser
-- usado na mesma transação em que o novo valor é referenciado.

alter type inventory_movement_type add value if not exists 'sale';

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('008', '008_sale_movement_type', array['-- applied via management API'])
on conflict (version) do nothing;
