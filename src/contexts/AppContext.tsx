import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import heroDog from '@/assets/hero-dog.jpg';

export interface Campaign {
  id: string;
  name: string;
  image: string;
  location: string;
  status: 'Ativa' | 'Urgente';
  goal: number;
  raised: number;
  donors: number;
  description: string;
  updates: CampaignUpdate[];
  comments: Comment[];
}

export interface CampaignUpdate {
  id: string;
  text: string;
  date: string;
  image?: string;
}

export interface Comment {
  id: string;
  name: string;
  text: string;
  date: string;
}

export interface Donation {
  id: string;
  name: string;
  email: string;
  amount: number;
  campaignId: string | null;
  campaignName: string;
  type: 'campaign' | 'food';
  date: string;
}

export interface FoodData {
  goalKg: number;
  raisedKg: number;
  donors: number;
  pricePerKg: number;
}

export interface SiteConfig {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
}

export interface UserProfile {
  name: string;
  email: string;
}

interface AppState {
  campaigns: Campaign[];
  donations: Donation[];
  food: FoodData;
  profile: UserProfile;
  siteConfig: SiteConfig;
  loading: boolean;
  addDonation: (donation: Omit<Donation, 'id' | 'date'>) => void;
  addFoodDonation: (kg: number, name: string, email: string) => void;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'donors' | 'raised' | 'updates' | 'comments'>) => void;
  updateCampaign: (id: string, data: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  addCampaignUpdate: (campaignId: string, update: Omit<CampaignUpdate, 'id'>) => void;
  setProfile: (profile: UserProfile) => void;
  updateFoodSettings: (settings: Partial<FoodData>) => void;
  updateSiteConfig: (config: Partial<SiteConfig>) => void;
  refreshData: () => Promise<void>;
}

// Pre-generated fake comments for new campaigns
const fakeCommentPool = [
  { name: 'Maria Silva', text: 'Força! 💚 Que Deus abençoe!' },
  { name: 'Pedro Santos', text: 'Doei com o coração. Melhoras!' },
  { name: 'Ana Oliveira', text: 'Que linda causa! Já contribuí ❤️' },
  { name: 'Lucas Ferreira', text: 'Fico feliz em ajudar! 🐶' },
  { name: 'Juliana Costa', text: 'Todo animal merece amor e cuidado!' },
  { name: 'Carlos Mendes', text: 'Parabéns pelo trabalho incrível!' },
  { name: 'Fernanda Lima', text: 'Que Deus proteja todos eles 🙏' },
  { name: 'Rafael Souza', text: 'Contribuição feita! Vamos ajudar!' },
  { name: 'Camila Rocha', text: 'Chorei lendo a história. Doei!' },
  { name: 'Gustavo Alves', text: 'Compartilhei com todos os amigos!' },
  { name: 'Beatriz Nunes', text: 'Vocês são incríveis! 💕' },
  { name: 'Diego Martins', text: 'Sempre apoiarei essa causa!' },
];

function generateFakeComments() {
  const count = 3 + Math.floor(Math.random() * 4);
  const shuffled = [...fakeCommentPool].sort(() => Math.random() - 0.5);
  const daysAgo = [1, 2, 3, 5, 7, 10, 14];
  return shuffled.slice(0, count).map((c, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysAgo[i] || i + 1));
    return { name: c.name, text: c.text, date: d.toISOString().split('T')[0] };
  });
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [food, setFood] = useState<FoodData>({ goalKg: 500, raisedKg: 0, donors: 0, pricePerKg: 10 });
  const [profile, setProfile] = useState<UserProfile>({ name: 'Visitante', email: '' });
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    heroImage: heroDog,
    heroTitle: 'Juntos salvamos vidas 🐶',
    heroSubtitle: 'Patas do Bem – ONG de resgate animal',
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      // Fetch campaigns with updates and comments
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsData) {
        const campaignsWithRelations: Campaign[] = await Promise.all(
          campaignsData.map(async (c: any) => {
            const { data: updates } = await supabase
              .from('campaign_updates')
              .select('*')
              .eq('campaign_id', c.id)
              .order('created_at', { ascending: true });

            const { data: comments } = await supabase
              .from('campaign_comments')
              .select('*')
              .eq('campaign_id', c.id)
              .order('created_at', { ascending: true });

            return {
              id: c.id,
              name: c.name,
              image: c.image,
              location: c.location,
              status: c.status as 'Ativa' | 'Urgente',
              goal: c.goal,
              raised: c.raised,
              donors: c.donors,
              description: c.description,
              updates: (updates || []).map((u: any) => ({ id: u.id, text: u.text, date: u.date, image: u.image })),
              comments: (comments || []).map((cm: any) => ({ id: cm.id, name: cm.name, text: cm.text, date: cm.date })),
            };
          })
        );
        setCampaigns(campaignsWithRelations);
      }

      // Fetch donations
      const { data: donationsData } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (donationsData) {
        setDonations(donationsData.map((d: any) => ({
          id: d.id,
          name: d.name,
          email: d.email || '',
          amount: d.amount,
          campaignId: d.campaign_id,
          campaignName: d.campaign_name || '',
          type: d.type as 'campaign' | 'food',
          date: d.created_at.split('T')[0],
        })));
      }

      // Fetch food settings
      const { data: foodData } = await supabase
        .from('food_settings')
        .select('*')
        .limit(1)
        .single();

      if (foodData) {
        setFood({
          goalKg: (foodData as any).goal_kg,
          raisedKg: (foodData as any).raised_kg,
          donors: (foodData as any).donors,
          pricePerKg: (foodData as any).price_per_kg,
        });
      }

      // Fetch site config
      const { data: siteData } = await supabase
        .from('site_config')
        .select('*')
        .limit(1)
        .single();

      if (siteData) {
        setSiteConfig({
          heroImage: (siteData as any).hero_image || heroDog,
          heroTitle: (siteData as any).hero_title,
          heroSubtitle: (siteData as any).hero_subtitle,
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addDonation = useCallback(async (donation: Omit<Donation, 'id' | 'date'>) => {
    const { error } = await supabase.from('donations').insert({
      name: donation.name,
      email: donation.email || null,
      amount: donation.amount,
      campaign_id: donation.campaignId,
      campaign_name: donation.campaignName,
      type: donation.type,
    });

    if (!error) {
      // If campaign donation, update campaign raised/donors
      if (donation.campaignId) {
        const campaign = campaigns.find(c => c.id === donation.campaignId);
        if (campaign) {
          await supabase.from('campaigns').update({
            raised: campaign.raised + donation.amount,
            donors: campaign.donors + 1,
          }).eq('id', donation.campaignId);
        }
      }
      await fetchAll();
    }
  }, [campaigns, fetchAll]);

  const addFoodDonation = useCallback(async (kg: number, name: string, email: string) => {
    const amount = kg * food.pricePerKg;

    await supabase.from('donations').insert({
      name,
      email: email || null,
      amount,
      campaign_id: null,
      campaign_name: 'Ração',
      type: 'food',
    });

    await supabase.from('food_settings').update({
      raised_kg: food.raisedKg + kg,
      donors: food.donors + 1,
    }).eq('id', (await supabase.from('food_settings').select('id').limit(1).single()).data?.id);

    await fetchAll();
  }, [food, fetchAll]);

  const addCampaign = useCallback(async (campaign: Omit<Campaign, 'id' | 'donors' | 'raised' | 'updates' | 'comments'>) => {
    // Seed with fake progress (15-20% of goal)
    const seedPercent = 0.15 + Math.random() * 0.05;
    const seedRaised = Math.round(campaign.goal * seedPercent);
    const seedDonors = Math.floor(seedRaised / 15) + Math.floor(Math.random() * 10) + 5;

    const { data, error } = await supabase.from('campaigns').insert({
      name: campaign.name,
      image: campaign.image,
      location: campaign.location,
      status: campaign.status,
      goal: campaign.goal,
      raised: seedRaised,
      donors: seedDonors,
      description: campaign.description,
    }).select('id').single();

    if (!error && data) {
      // Insert fake comments
      const fakeComments = generateFakeComments();
      const commentsToInsert = fakeComments.map(c => ({
        campaign_id: data.id,
        name: c.name,
        text: c.text,
        date: c.date,
      }));
      await supabase.from('campaign_comments').insert(commentsToInsert);
      await fetchAll();
    }
  }, [fetchAll]);

  const updateCampaign = useCallback(async (id: string, data: Partial<Campaign>) => {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.goal !== undefined) updateData.goal = data.goal;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.raised !== undefined) updateData.raised = data.raised;
    if (data.donors !== undefined) updateData.donors = data.donors;

    if (Object.keys(updateData).length > 0) {
      await supabase.from('campaigns').update(updateData).eq('id', id);
      await fetchAll();
    }
  }, [fetchAll]);

  const deleteCampaign = useCallback(async (id: string) => {
    await supabase.from('campaigns').delete().eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  const addCampaignUpdate = useCallback(async (campaignId: string, update: Omit<CampaignUpdate, 'id'>) => {
    await supabase.from('campaign_updates').insert({
      campaign_id: campaignId,
      text: update.text,
      date: update.date,
      image: update.image || null,
    });
    await fetchAll();
  }, [fetchAll]);

  const updateFoodSettings = useCallback(async (settings: Partial<FoodData>) => {
    const updateData: any = {};
    if (settings.goalKg !== undefined) updateData.goal_kg = settings.goalKg;
    if (settings.pricePerKg !== undefined) updateData.price_per_kg = settings.pricePerKg;
    if (settings.raisedKg !== undefined) updateData.raised_kg = settings.raisedKg;
    if (settings.donors !== undefined) updateData.donors = settings.donors;

    const { data: current } = await supabase.from('food_settings').select('id').limit(1).single();
    if (current) {
      await supabase.from('food_settings').update(updateData).eq('id', current.id);
      await fetchAll();
    }
  }, [fetchAll]);

  const updateSiteConfig = useCallback(async (config: Partial<SiteConfig>) => {
    const updateData: any = {};
    if (config.heroTitle !== undefined) updateData.hero_title = config.heroTitle;
    if (config.heroSubtitle !== undefined) updateData.hero_subtitle = config.heroSubtitle;
    if (config.heroImage !== undefined) updateData.hero_image = config.heroImage;

    const { data: current } = await supabase.from('site_config').select('id').limit(1).single();
    if (current) {
      await supabase.from('site_config').update(updateData).eq('id', current.id);
      await fetchAll();
    }
  }, [fetchAll]);

  return (
    <AppContext.Provider value={{
      campaigns, donations, food, profile, siteConfig, loading,
      addDonation, addFoodDonation, addCampaign, updateCampaign, deleteCampaign,
      addCampaignUpdate, setProfile, updateFoodSettings, updateSiteConfig,
      refreshData: fetchAll,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
