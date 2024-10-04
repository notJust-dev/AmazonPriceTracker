CREATE TRIGGER "InvokeCheckSearchPriceDropsOnUpdatedSearch" AFTER UPDATE ON public.searches FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://ttxvnyflpzstmpdrbtnz.supabase.co/functions/v1/check-search-price-drops', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eHZueWZscHpzdG1wZHJidG56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzQ1OTE0MCwiZXhwIjoyMDQzMDM1MTQwfQ.O108uUKwL6SoRawpDtdfPcli9yn84XAKgWjsQaucTro"}', '{}', '1000');


