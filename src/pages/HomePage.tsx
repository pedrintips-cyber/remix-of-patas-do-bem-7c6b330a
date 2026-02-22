import { useApp } from '@/contexts/AppContext';
import { Heart, Dog, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import CampaignCard from '@/components/CampaignCard';

const HomePage = () => {
  const { campaigns, donations, siteConfig } = useApp();

  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalDonors = new Set(donations.map(d => d.email).filter(Boolean)).size;
  const totalDogs = campaigns.length;

  const stats = [
    { icon: Heart, label: 'Arrecadado', value: `R$ ${totalRaised.toLocaleString('pt-BR')}` },
    { icon: Dog, label: 'Cães ajudados', value: totalDogs.toString() },
    { icon: Users, label: 'Doadores', value: totalDonors.toString() },
  ];

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img src={siteConfig.heroImage} alt="Cachorro resgatado" className="h-64 sm:h-80 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-3xl font-extrabold text-primary-foreground drop-shadow-lg">
            {siteConfig.heroTitle}
          </h1>
          <p className="mt-1 text-sm font-medium text-primary-foreground/80">
            {siteConfig.heroSubtitle}
          </p>
          <Link
            to="/vaquinhas"
            className="mt-4 inline-block rounded-xl bg-primary px-8 py-3 text-base font-bold text-primary-foreground shadow-lg transition-transform active:scale-95 hover:opacity-90"
          >
            Doar Agora 💚
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-lg px-4">
        <div className="mt-6 grid grid-cols-3 gap-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl bg-accent p-3 text-center animate-fade-in-up">
              <Icon className="mx-auto mb-1 text-primary" size={24} />
              <p className="text-lg font-extrabold text-foreground">{value}</p>
              <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Active campaigns */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Vaquinhas Ativas</h2>
            <Link to="/vaquinhas" className="text-sm font-semibold text-primary">
              Ver todas
            </Link>
          </div>
          <div className="space-y-4">
            {campaigns.slice(0, 3).map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
