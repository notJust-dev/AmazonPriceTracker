import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const { record } = await req.json();
  if (record.status !== "Done") {
    return new Response(JSON.stringify({}), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // init client
  const authHeader = req.headers.get("Authorization")!;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const getProductLastPrices = async (product) => {
    const { data, error } = await supabase
      .from("product_snapshot")
      .select("*")
      .eq("asin", product.asin)
      .order("created_at", { ascending: false })
      .limit(2);
    console.log(error);
    return {
      ...product,
      snapshots: data,
    };
  };

  // Check price drops
  const { data: productSearch, error: productSearchError } = await supabase
    .from("product_search")
    .select("*, products(*)")
    .eq("search_id", record.id);

  if (!productSearch) {
    return;
  }
  const products = await Promise.all(
    productSearch.map((ps) => getProductLastPrices(ps.products)),
  );

  const priceDrops = products.filter(
    (product) =>
      product.snapshots.length === 2 &&
      product.snapshots[0].final_price < product.snapshots[1].final_price,
  );

  // const newProducts = products.filter((product) => product.snapshots.length <= 1);
  // console.log('new: ', JSON.stringify(newProducts, null, 2));
  // console.log("drops: ", JSON.stringify(priceDrops, null, 2));

  if (priceDrops.length > 0) {
    // Notify the user
    const message = `
      The are ${priceDrops.length} price drops in your search!

      ${
      priceDrops.map(
        (product) => `
        ${product.name}
        ${product.url}
        From $${product.snapshots[1].final_price} dropped to $${
          product.snapshots[0].final_price
        }
        __________
      `,
      )
    }
    `;

    console.log(message);
  }

  return new Response(JSON.stringify({}), {
    headers: { "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/check-search-price-drops' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
