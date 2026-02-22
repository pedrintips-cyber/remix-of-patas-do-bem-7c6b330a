import { useApp } from '@/contexts/AppContext';
import CampaignCard from '@/components/CampaignCard';

const CampaignsPage = () => {
  const { campaigns } = useApp();

  return (
    <div className="pb-24">
      <div className="bg-primary px-4 pb-6 pt-8">
        <h1 className="text-2xl font-extrabold text-primary-foreground">Vaquinhas</h1>
        <p className="mt-1 text-sm text-primary-foreground/80">Escolha uma campanha e faça a diferença</p>
      </div>
      <div className="mx-auto max-w-lg px-4 -mt-3">
        <div className="space-y-4">
          {campaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;
