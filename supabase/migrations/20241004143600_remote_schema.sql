alter table "public"."product_search" drop constraint "product_search_pkey";

drop index if exists "public"."product_search_pkey";

alter table "public"."product_search" drop column "created_at";

alter table "public"."product_search" drop column "id";

alter table "public"."product_search" alter column "asin" set not null;

alter table "public"."product_search" alter column "search_id" set not null;

CREATE UNIQUE INDEX product_search_pkey ON public.product_search USING btree (asin, search_id);

alter table "public"."product_search" add constraint "product_search_pkey" PRIMARY KEY using index "product_search_pkey";

CREATE TRIGGER "StartScrapingForNewSearches" AFTER INSERT ON public.searches FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://ttxvnyflpzstmpdrbtnz.supabase.co/functions/v1/scrape-start', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eHZueWZscHpzdG1wZHJidG56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzQ1OTE0MCwiZXhwIjoyMDQzMDM1MTQwfQ.O108uUKwL6SoRawpDtdfPcli9yn84XAKgWjsQaucTro"}', '{}', '1000');


