create policy "Enable read access for all users"
on "public"."product_snapshot"
as permissive
for select
to authenticated
using (true);



