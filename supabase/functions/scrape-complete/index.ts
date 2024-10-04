// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

console.log("Hello from Functions!");

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  const reqJson = await req.json();

  const authHeader = req.headers.get("Authorization")!;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      global: {
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
      },
    },
  );

  const updated_at = new Date().toISOString();
  // save all products
  const products = reqJson.map((p) => ({
    asin: p.asin,
    updated_at,
    name: p.name,
    image: p.image,
    url: p.url,
    final_price: p.final_price,
    currency: p.currency,
  }));

  const { error: productsError } = await supabase.from("products").upsert(
    products,
  );
  console.log(productsError);

  // save product snapshot
  const productSnapshots = reqJson.map((p) => ({
    asin: p.asin,
    final_price: p.final_price,
  }));
  const { error: productSnapshotsError } = await supabase
    .from("product_snapshot")
    .insert(productSnapshots);
  console.log(productSnapshotsError);

  // link products with search ids.
  const productSearchLinks = products.map((p) => ({
    asin: p.asin,
    search_id: id,
  }));

  const { error: product_searchError } = await supabase
    .from("product_search")
    .upsert(productSearchLinks);
  console.log(product_searchError);

  // update search status
  const { error: searchesError } = await supabase
    .from("searches")
    .update({
      status: "Done",
      last_scraped_at: updated_at,
    })
    .eq("id", id);

  console.log(searchesError);

  const data = {
    message: `Hello!`,
  };

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/scrape-complete' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
