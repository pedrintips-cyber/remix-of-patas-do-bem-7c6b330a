
-- ═══ PAGE VIEWS / ANALYTICS ═══
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  referrer text,
  affiliate_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view page views" ON public.page_views FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE INDEX idx_page_views_created ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_campaign ON public.page_views(campaign_id);

-- ═══ AFFILIATES ═══
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  pix_key text,
  pix_key_type text CHECK (pix_key_type IN ('cpf', 'phone', 'email', 'random')),
  balance integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affiliate" ON public.affiliates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own affiliate" ON public.affiliates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own affiliate" ON public.affiliates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all affiliates" ON public.affiliates FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON public.affiliates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══ AFFILIATE LINKS ═══
CREATE TABLE public.affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  link_type text NOT NULL DEFAULT 'campaign' CHECK (link_type IN ('campaign', 'global')),
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affiliate links" ON public.affiliate_links FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.affiliates WHERE id = affiliate_links.affiliate_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own affiliate links" ON public.affiliate_links FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.affiliates WHERE id = affiliate_links.affiliate_id AND user_id = auth.uid())
);
CREATE POLICY "Anyone can read affiliate links by code" ON public.affiliate_links FOR SELECT USING (true);
CREATE POLICY "Admins can view all affiliate links" ON public.affiliate_links FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE INDEX idx_affiliate_links_code ON public.affiliate_links(code);

-- ═══ AFFILIATE COMMISSIONS ═══
CREATE TABLE public.affiliate_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  affiliate_link_id uuid NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  donation_id uuid NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commissions" ON public.affiliate_commissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.affiliates WHERE id = affiliate_commissions.affiliate_id AND user_id = auth.uid())
);
CREATE POLICY "Anyone can insert commissions" ON public.affiliate_commissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all commissions" ON public.affiliate_commissions FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ═══ WITHDRAWAL REQUESTS ═══
CREATE TABLE public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  pix_key text NOT NULL,
  pix_key_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals" ON public.withdrawal_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.affiliates WHERE id = withdrawal_requests.affiliate_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own withdrawals" ON public.withdrawal_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.affiliates WHERE id = withdrawal_requests.affiliate_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all withdrawals" ON public.withdrawal_requests FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update withdrawals" ON public.withdrawal_requests FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON public.withdrawal_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add affiliate_code to donations to track which affiliate referred the donation
ALTER TABLE public.donations ADD COLUMN affiliate_code text;
ALTER TABLE public.donations ADD COLUMN phone text;
