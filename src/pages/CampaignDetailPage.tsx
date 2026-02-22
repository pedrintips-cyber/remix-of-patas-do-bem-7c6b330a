import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Calendar, MessageCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ProgressBar from '@/components/ProgressBar';
import DonationModal from '@/components/DonationModal';
import { toast } from 'sonner';

const quickAmounts = [10, 25, 50, 100, 200];

const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { campaigns, addDonation } = useApp();
  const campaign = campaigns.find(c => c.id === id);

  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState('');
  const [showModal, setShowModal] = useState(false);

  if (!campaign) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-24">
        <div className="text-center">
          <p className="text-muted-foreground">Campanha não encontrada</p>
          <Link to="/vaquinhas" className="mt-2 inline-block text-primary font-semibold">Voltar</Link>
        </div>
      </div>
    );
  }

  const donationAmount = customAmount ? parseInt(customAmount) : selectedAmount;

  const handleDonationSuccess = (name: string, donatedAmount: number) => {
    addDonation({
      name,
      email: '',
      amount: donatedAmount,
      campaignId: campaign.id,
      campaignName: campaign.name,
      type: 'campaign',
    });
    setShowModal(false);
    setCustomAmount('');
    toast.success(`💚 ${name} doou R$${donatedAmount.toFixed(2)}`, { duration: 4000 });
  };

  return (
    <div className="pb-24">
      {/* Image */}
      <div className="relative">
        <img src={campaign.image} alt={campaign.name} className="h-64 sm:h-80 w-full object-cover" />
        <Link
          to="/vaquinhas"
          className="absolute left-4 top-4 rounded-full bg-card/80 p-2 backdrop-blur-sm shadow-sm"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </Link>
        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${
            campaign.status === 'Urgente'
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          {campaign.status}
        </span>
      </div>

      <div className="mx-auto max-w-lg px-4">
        {/* Info */}
        <div className="mt-4 animate-slide-up">
          <h1 className="text-2xl font-extrabold text-foreground">{campaign.name}</h1>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} />
            <span>{campaign.location}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <ProgressBar current={campaign.raised} goal={campaign.goal} height="h-4" />
          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <Users size={14} />
            <span>{campaign.donors} doadores</span>
          </div>
        </div>

        {/* Donation selector */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-foreground mb-3">Escolha o valor</h2>
          <div className="grid grid-cols-5 gap-2">
            {quickAmounts.map(amount => (
              <button
                key={amount}
                onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                className={`rounded-xl border py-3 text-sm font-bold transition-all ${
                  selectedAmount === amount && !customAmount
                    ? 'border-primary bg-primary text-primary-foreground scale-105'
                    : 'border-border bg-card text-foreground hover:border-primary'
                }`}
              >
                R${amount}
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Outro valor (R$)"
            value={customAmount}
            onChange={e => { setCustomAmount(e.target.value); }}
            className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => donationAmount > 0 && setShowModal(true)}
            className="mt-4 w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98] hover:opacity-90 animate-pulse-soft"
          >
            DOAR AGORA 💚
          </button>
        </div>

        {/* Description */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-foreground mb-2">Sobre a campanha</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{campaign.description}</p>
        </div>

        {/* Updates */}
        {campaign.updates.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground mb-3">Atualizações</h2>
            <div className="space-y-3">
              {campaign.updates.map(update => (
                <div key={update.id} className="rounded-xl border border-border bg-accent/50 p-3">
                  <p className="text-sm text-foreground">{update.text}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={10} />
                    <span>{update.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground mb-3">
            <MessageCircle size={18} /> Comentários ({campaign.comments.length})
          </h2>


          <div className="space-y-3">
            {campaign.comments.map(comment => (
              <div key={comment.id} className="rounded-xl border border-border bg-card p-3">
                <p className="text-sm font-semibold text-foreground">{comment.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{comment.text}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{comment.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DonationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        amount={donationAmount}
        campaignId={campaign.id}
        campaignName={campaign.name}
        onSuccess={handleDonationSuccess}
      />
    </div>
  );
};

export default CampaignDetailPage;
