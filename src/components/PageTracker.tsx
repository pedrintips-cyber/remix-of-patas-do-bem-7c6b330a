import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const affiliateCode = params.get('ref') || null;

    if (affiliateCode) {
      sessionStorage.setItem('affiliate_code', affiliateCode);
    }

    const campaignMatch = location.pathname.match(/\/vaquinhas\/([0-9a-f-]+)/);
    const campaignId = campaignMatch ? campaignMatch[1] : null;

    supabase.from('page_views').insert({
      page: location.pathname,
      campaign_id: campaignId,
      referrer: document.referrer || null,
      affiliate_code: affiliateCode || sessionStorage.getItem('affiliate_code') || null,
    }).then(() => {});

    // If affiliate link, increment click count
    if (affiliateCode) {
      supabase.rpc('increment_affiliate_clicks' as any, { _code: affiliateCode }).then(() => {});
    }
  }, [location.pathname, location.search]);

  return null;
};

export default PageTracker;
