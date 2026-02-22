
-- Campaigns table
CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image text NOT NULL,
  location text NOT NULL,
  status text NOT NULL DEFAULT 'Ativa',
  goal integer NOT NULL,
  raised integer NOT NULL DEFAULT 0,
  donors integer NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Admins can insert campaigns" ON public.campaigns FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update campaigns" ON public.campaigns FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete campaigns" ON public.campaigns FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Campaign updates
CREATE TABLE public.campaign_updates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  text text NOT NULL,
  date text NOT NULL,
  image text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaign updates" ON public.campaign_updates FOR SELECT USING (true);
CREATE POLICY "Admins can insert campaign updates" ON public.campaign_updates FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete campaign updates" ON public.campaign_updates FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Campaign comments (pre-generated, admin-managed)
CREATE TABLE public.campaign_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name text NOT NULL,
  text text NOT NULL,
  date text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaign comments" ON public.campaign_comments FOR SELECT USING (true);
CREATE POLICY "Admins can insert campaign comments" ON public.campaign_comments FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete campaign comments" ON public.campaign_comments FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Food settings (single row)
CREATE TABLE public.food_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_kg integer NOT NULL DEFAULT 500,
  raised_kg integer NOT NULL DEFAULT 0,
  donors integer NOT NULL DEFAULT 0,
  price_per_kg integer NOT NULL DEFAULT 10,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.food_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view food settings" ON public.food_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update food settings" ON public.food_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Insert default food settings
INSERT INTO public.food_settings (goal_kg, raised_kg, donors, price_per_kg) VALUES (500, 0, 0, 10);

-- Site config (single row)
CREATE TABLE public.site_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_image text NOT NULL DEFAULT '',
  hero_title text NOT NULL DEFAULT 'Juntos salvamos vidas 🐶',
  hero_subtitle text NOT NULL DEFAULT 'Patas do Bem – ONG de resgate animal',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site config" ON public.site_config FOR SELECT USING (true);
CREATE POLICY "Admins can update site config" ON public.site_config FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Insert default site config
INSERT INTO public.site_config (hero_title, hero_subtitle, hero_image) VALUES ('Juntos salvamos vidas 🐶', 'Patas do Bem – ONG de resgate animal', '');

-- Update trigger for campaigns
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_food_settings_updated_at BEFORE UPDATE ON public.food_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Also update donations table: campaign_id should reference campaigns table
-- But since existing campaign_id is text and new campaigns use uuid, we'll keep it as text for now
