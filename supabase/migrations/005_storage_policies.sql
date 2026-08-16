-- Policies do bucket product-images: path é sempre {tenant_id}/products/{product_id}/{filename}.
-- Bucket é público para leitura (URLs de produto no site/PDV não exigem sessão),
-- mas escrita/exclusão exige que o primeiro segmento do path bata com o tenant do usuário.

create policy product_images_read_public on storage.objects
  for select to public
  using (bucket_id = 'product-images');

create policy product_images_insert_own_tenant on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth_tenant_id()::text
  );

create policy product_images_delete_own_tenant on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth_tenant_id()::text
  );

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('005', '005_storage_policies', array['-- applied via management API'])
on conflict (version) do nothing;
