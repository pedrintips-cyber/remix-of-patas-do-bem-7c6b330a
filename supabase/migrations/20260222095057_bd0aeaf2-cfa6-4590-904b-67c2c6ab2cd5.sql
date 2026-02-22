
-- Function to increment affiliate link clicks
CREATE OR REPLACE FUNCTION public.increment_affiliate_clicks(_code text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.affiliate_links SET clicks = clicks + 1 WHERE code = _code;
$$;
