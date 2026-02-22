import { useState, useEffect, useCallback } from 'react';
import { Heart, Utensils, Clock } from 'lucide-react';

type Filter = 'all' | 'campaign' | 'food';

interface FakeDonation {
  id: string;
  name: string;
  amount: number;
  type: 'campaign' | 'food';
  campaignName: string;
  time: string;
}

const names = ['Marcela', 'Matheus', 'Ana', 'João', 'Beatriz', 'Carlos', 'Fernanda', 'Lucas', 'Juliana', 'Rafael', 'Camila', 'Gustavo', 'Larissa', 'Diego', 'Patrícia'];
const campaignNames = ['Resgate do Rex', 'Cirurgia da Luna', 'Abrigo Esperança', 'Castração Solidária', 'Lar dos Peludos'];
const amounts = [2, 5, 10, 15, 20, 25, 30, 50, 100];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFakeDonation(): FakeDonation {
  const type = Math.random() > 0.3 ? 'campaign' : 'food';
  return {
    id: crypto.randomUUID(),
    name: randomItem(names),
    amount: randomItem(amounts),
    type,
    campaignName: type === 'food' ? 'Ração' : randomItem(campaignNames),
    time: 'agora',
  };
}

function generateInitialDonations(count: number): FakeDonation[] {
  const timeLabels = ['1 min', '2 min', '3 min', '5 min', '8 min', '10 min', '12 min', '15 min', '20 min', '25 min', '30 min', '45 min', '1h', '1h30', '2h', '3h', '5h', '8h', '12h', '1 dia', '2 dias'];
  const donations: FakeDonation[] = [];
  for (let i = 0; i < count; i++) {
    const d = generateFakeDonation();
    d.time = timeLabels[Math.min(i, timeLabels.length - 1)];
    donations.push(d);
  }
  return donations;
}

const HistoricoPage = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const [donations, setDonations] = useState<FakeDonation[]>(() => generateInitialDonations(15));

  // Sync with SocialProofNotifications interval (every 8s, first at 3s)
  useEffect(() => {
    const addNew = () => {
      const d = generateFakeDonation();
      setDonations(prev => [d, ...prev].slice(0, 50));
    };

    const interval = setInterval(addNew, 8000);
    const initial = setTimeout(addNew, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, []);

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
        {/* Filters */}
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

        {/* List */}
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
                  <p className="text-[10px] text-muted-foreground">{donation.campaignName} · {donation.time} atrás</p>
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
