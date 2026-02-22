const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('PARADISE_API_KEY');
    if (!apiKey) {
      throw new Error('PARADISE_API_KEY is not configured');
    }

    const body = await req.json();
    const { amount, description, reference, customer } = body;

    if (!amount || !description || !reference || !customer) {
      return new Response(JSON.stringify({ error: 'Missing required fields: amount, description, reference, customer' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Paradise API
    const response = await fetch('https://multi.paradisepags.com/api/v1/transaction.php', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount, // in centavos
        description,
        reference,
        source: 'api_externa',
        customer: {
          name: customer.name,
          email: customer.email,
          document: customer.document,
          phone: customer.phone,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Paradise API error:', data);
      return new Response(JSON.stringify({ error: 'Payment creation failed', details: data }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating PIX payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
