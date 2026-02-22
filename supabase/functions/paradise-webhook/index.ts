import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { transaction_id, external_id, status, amount, customer } = body;

    console.log('Webhook received:', { transaction_id, external_id, status, amount });

    if (status === 'approved') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      const amountInReais = Math.round(amount / 100);
      
      // Parse reference: campaign-{campaignId}-{timestamp}
      let campaignId: string | null = null;
      if (external_id?.startsWith('campaign-')) {
        const parts = external_id.replace('campaign-', '').split('-');
        // UUID is 5 groups: 8-4-4-4-12
        if (parts.length >= 5) {
          campaignId = parts.slice(0, 5).join('-');
        }
      }

      // Get affiliate code from reference metadata if present
      const affiliateCode = body.metadata?.affiliate_code || null;

      const { data: donation, error } = await supabase.from('donations').insert({
        name: customer?.name || 'Anônimo',
        email: customer?.email || null,
        phone: customer?.phone || null,
        amount: amountInReais,
        campaign_id: campaignId,
        campaign_name: 'Doação PIX',
        type: 'campaign',
        order_bump: false,
        affiliate_code: affiliateCode,
      }).select('id').single();

      if (error) {
        console.error('Error inserting donation:', error);
      } else {
        console.log('Donation recorded successfully for transaction:', transaction_id);

        // Update campaign raised/donors
        if (campaignId) {
          const { data: campaign } = await supabase.from('campaigns').select('raised, donors').eq('id', campaignId).single();
          if (campaign) {
            await supabase.from('campaigns').update({
              raised: campaign.raised + amountInReais,
              donors: campaign.donors + 1,
            }).eq('id', campaignId);
          }
        }

        // Process affiliate commission (80%)
        if (affiliateCode && donation) {
          const { data: link } = await supabase.from('affiliate_links').select('id, affiliate_id').eq('code', affiliateCode).single();
          if (link) {
            const commissionAmount = Math.round(amountInReais * 0.80 * 100); // in centavos

            await supabase.from('affiliate_commissions').insert({
              affiliate_id: link.affiliate_id,
              affiliate_link_id: link.id,
              donation_id: donation.id,
              amount: commissionAmount,
            });

            // Update affiliate balance and total_earned
            const { data: aff } = await supabase.from('affiliates').select('balance, total_earned').eq('id', link.affiliate_id).single();
            if (aff) {
              await supabase.from('affiliates').update({
                balance: aff.balance + commissionAmount,
                total_earned: aff.total_earned + commissionAmount,
              }).eq('id', link.affiliate_id);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
