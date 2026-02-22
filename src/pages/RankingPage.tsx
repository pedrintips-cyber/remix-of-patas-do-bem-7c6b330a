import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RankedDonor {
  user_id: string;
  display_name: string;
  total_donated: number;
  donation_count: number;
}

const RankingPage = () => {
  const [donors, setDonors] = useState<RankedDonor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      // Get donations that have a user_id (registered users only)
      const { data: donations } = await supabase
        .from('donations')
        .select('user_id, amount, name')
        .not('user_id', 'is', null);

      if (!donations || donations.length === 0) {
        setLoading(false);
        return;
      }

      // Get profiles for these users
      const userIds = [...new Set(donations.map(d => d.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      // Aggregate by user
      const aggregated: Record<string, RankedDonor> = {};
      donations.forEach(d => {
        if (!d.user_id) return;
        if (!aggregated[d.user_id]) {
          const profile = profiles?.find(p => p.user_id === d.user_id);
          aggregated[d.user_id] = {
            user_id: d.user_id,
            display_name: profile?.display_name || d.name || 'Anônimo',
            total_donated: 0,
            donation_count: 0,
          };
        }
        aggregated[d.user_id].total_donated += d.amount;
        aggregated[d.user_id].donation_count += 1;
      });

      const sorted = Object.values(aggregated).sort((a, b) => b.total_donated - a.total_donated);
      setDonors(sorted);
      setLoading(false);
    };

    fetchRanking();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown size={22} className="text-yellow-500" />;
    if (index === 1) return <Medal size={22} className="text-gray-400" />;
    if (index === 2) return <Medal size={22} className="text-amber-600" />;
    return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">{index + 1}</span>;
  };

  return (
    <div className="pb-24">
      <div className="bg-primary px-4 pb-6 pt-8">
        <div className="flex items-center gap-2">
          <Trophy size={24} className="text-primary-foreground" />
          <div>
            <h1 className="text-2xl font-extrabold text-primary-foreground">Ranking</h1>
            <p className="text-xs text-primary-foreground/70">Top doadores com conta</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 -mt-3">
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Carregando ranking...</p>
          </div>
        ) : donors.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center animate-slide-up">
            <Trophy size={40} className="mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum doador com conta ainda.</p>
            <p className="text-xs text-muted-foreground mt-1">Crie sua conta e doe para aparecer no ranking!</p>
          </div>
        ) : (
          <div className="space-y-2 animate-slide-up">
            {/* Top 3 podium */}
            {donors.length >= 1 && (
              <div className="rounded-2xl border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 p-5 mb-4">
                <div className="flex items-center gap-4">
                  <Crown size={32} className="text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-lg font-extrabold text-foreground">{donors[0].display_name}</p>
                    <p className="text-xs text-muted-foreground">{donors[0].donation_count} doações</p>
                  </div>
                  <p className="text-xl font-extrabold text-primary">R$ {donors[0].total_donated.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            )}

            {/* Rest of ranking */}
            {donors.slice(1).map((donor, i) => (
              <div key={donor.user_id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                {getRankIcon(i + 1)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{donor.display_name}</p>
                  <p className="text-[10px] text-muted-foreground">{donor.donation_count} doações</p>
                </div>
                <p className="text-sm font-bold text-primary">R$ {donor.total_donated.toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingPage;
