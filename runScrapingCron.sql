select
  cron.schedule(
    'invoke-scraper-every-3-minute',
    '*/3 * * * *',
    $$
    select
      net.http_post(
          url:='https://<SUPABASE_PROJECT_ID>.supabase.co/functions/v1/scrape-tracked-searches',
          headers:=jsonb_build_object('Content-Type','application/json', 'Authorization', 'Bearer <SUPABASE_SECRET_TOKEN>'),
          timeout_milliseconds:=5000
      ) as request_id;
    $$
  );