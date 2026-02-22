import { useState } from 'react';
import { Heart, Utensils, Clock } from 'lucide-react';
import { useFakeNotifications } from '@/hooks/useFakeNotifications';

type Filter = 'all' | 'campaign' | 'food';

const HistoricoPage = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const donations = useFakeNotifications();

  const filtered = filter === 'all' ? donations : donations.filter(d => d.type === filter);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'campaign', label: 'Vaquinhas' },
    { key: 'food', label: 'Ração' },
  ];

  return (
    <div className="pb-24">
      <div className="bg-primary px-4 pb-6 pt-8">
        <div className="flex items-center gap-2">
          <Clock size={24} className="text-primary-foreground" />
          <div>
            <h1 className="text-2xl font-extrabold text-primary-foreground">Histórico</h1>
            <p className="text-xs text-primary-foreground/70">Doações em tempo real</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 -mt-3">
        <div className="flex gap-2 mb-4">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                filter === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground border border-border hover:border-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((donation) => (
            <div key={donation.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  donation.type === 'food' ? 'bg-warning/20' : 'bg-accent'
                }`}>
                  {donation.type === 'food' ? (
                    <Utensils size={16} className="text-warning" />
                  ) : (
                    <Heart size={16} className="text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{donation.name}</p>
                  <p className="text-[10px] text-muted-foreground">{donation.campaignName} · {donation.time}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-primary">R${donation.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoricoPage;
