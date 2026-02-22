import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, DollarSign, Link2, MousePointerClick, TrendingUp, Wallet, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface Affiliate {
  id: string;
  balance: number;
  total_earned: number;
  pix_key: string | null;
  pix_key_type: string | null;
}

interface AffiliateLink {
  id: string;
  code: string;
  link_type: string;
  campaign_id: string | null;
  clicks: number;
}

interface Commission {
  id: string;
  amount: number;
  created_at: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

const COMMISSION_RATE = 0.80;

const AffiliatePage = () => {
  const { user } = useAuth();
  const { campaigns } = useApp();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('global');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('cpf');

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      // Get or create affiliate
      let { data: aff } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!aff) {
        const { data: newAff } = await supabase
          .from('affiliates')
          .insert({ user_id: user.id })
          .select()
          .single();
        aff = newAff;
      }

      if (aff) {
        setAffiliate(aff as any);
        setPixKey((aff as any).pix_key || '');
        setPixKeyType((aff as any).pix_key_type || 'cpf');

        const [linksRes, commissionsRes, withdrawalsRes] = await Promise.all([
          supabase.from('affiliate_links').select('*').eq('affiliate_id', (aff as any).id).order('created_at', { ascending: false }),
          supabase.from('affiliate_commissions').select('*').eq('affiliate_id', (aff as any).id).order('created_at', { ascending: false }),
          supabase.from('withdrawal_requests').select('*').eq('affiliate_id', (aff as any).id).order('created_at', { ascending: false }),
        ]);

        setLinks((linksRes.data || []) as any[]);
        setCommissions((commissionsRes.data || []) as any[]);
        setWithdrawals((withdrawalsRes.data || []) as any[]);
      }
    } catch (err) {
      console.error('Affiliate fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const createLink = async () => {
    if (!affiliate) return;
    const code = generateCode();
    const isGlobal = selectedCampaign === 'global';

    await supabase.from('affiliate_links').insert({
      affiliate_id: affiliate.id,
      campaign_id: isGlobal ? null : selectedCampaign,
      code,
      link_type: isGlobal ? 'global' : 'campaign',
    });

    setShowCreateLink(false);
    setSelectedCampaign('global');
    await fetchData();
    toast.success('Link criado!');
  };

  const copyLink = (link: AffiliateLink) => {
    const baseUrl = window.location.origin;
    const url = link.link_type === 'global'
      ? `${baseUrl}/?ref=${link.code}`
      : `${baseUrl}/vaquinhas/${link.campaign_id}?ref=${link.code}`;
    navigator.clipboard.writeText(url);
    setCopied(link.id);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(null), 2000);
  };

  const requestWithdrawal = async () => {
    if (!affiliate || !withdrawAmount || !pixKey) return;
    const amount = parseInt(withdrawAmount);
    if (amount <= 0 || amount > affiliate.balance) {
      toast.error('Valor inválido');
      return;
    }

    await supabase.from('withdrawal_requests').insert({
      affiliate_id: affiliate.id,
      amount,
      pix_key: pixKey,
      pix_key_type: pixKeyType,
    });

    // Update pix key on affiliate
    await supabase.from('affiliates').update({ pix_key: pixKey, pix_key_type: pixKeyType }).eq('id', affiliate.id);

    // Deduct from balance
    await supabase.from('affiliates').update({ balance: affiliate.balance - amount }).eq('id', affiliate.id);

    setShowWithdraw(false);
    setWithdrawAmount('');
    await fetchData();
    toast.success('Saque solicitado! Aguarde aprovação.');
  };

  if (!user) {
    return (
      <div className="pb-24">
        <div className="bg-primary px-4 pb-6 pt-8">
          <Link to="/perfil" className="inline-flex items-center gap-1 text-primary-foreground/70 text-sm mb-2">
            <ArrowLeft size={16} /> Voltar
          </Link>
          <h1 className="text-2xl font-extrabold text-primary-foreground">Painel de Afiliado</h1>
        </div>
        <div className="px-4 mt-6 text-center">
          <p className="text-muted-foreground">Faça login para acessar o painel de afiliados.</p>
          <Link to="/auth" className="mt-4 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Entrar</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-24">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="pb-24">
      <div className="bg-primary px-4 pb-6 pt-8">
        <Link to="/perfil" className="inline-flex items-center gap-1 text-primary-foreground/70 text-sm mb-2">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <h1 className="text-2xl font-extrabold text-primary-foreground">Painel de Afiliado</h1>
        <p className="text-xs text-primary-foreground/70">Ganhe {(COMMISSION_RATE * 100).toFixed(0)}% de comissão por doação</p>
      </div>

      <div className="mx-auto max-w-lg px-4 -mt-3 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <Wallet className="mx-auto mb-1 text-primary" size={20} />
            <p className="text-xl font-extrabold text-foreground">R$ {((affiliate?.balance || 0) / 100).toFixed(2).replace('.', ',')}</p>
            <p className="text-[10px] text-muted-foreground">Saldo disponível</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <TrendingUp className="mx-auto mb-1 text-primary" size={20} />
            <p className="text-xl font-extrabold text-foreground">R$ {((affiliate?.total_earned || 0) / 100).toFixed(2).replace('.', ',')}</p>
            <p className="text-[10px] text-muted-foreground">Total ganho</p>
          </div>
        </div>

        {/* Withdraw button */}
        {(affiliate?.balance || 0) > 0 && (
          <button onClick={() => setShowWithdraw(!showWithdraw)} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground flex items-center justify-center gap-2">
            <DollarSign size={16} /> Solicitar Saque
          </button>
        )}

        {showWithdraw && (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 animate-slide-up">
            <h3 className="text-sm font-bold text-foreground">Solicitar Saque</h3>
            <div>
              <label className="text-xs text-muted-foreground">Valor (R$)</label>
              <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00" className={inputCls + " mt-1"} max={(affiliate?.balance || 0) / 100} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tipo de chave PIX</label>
              <select value={pixKeyType} onChange={e => setPixKeyType(e.target.value)} className={inputCls + " mt-1"}>
                <option value="cpf">CPF</option>
                <option value="phone">Celular</option>
                <option value="email">Email</option>
                <option value="random">Chave aleatória</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Chave PIX</label>
              <input type="text" value={pixKey} onChange={e => setPixKey(e.target.value)} placeholder="Sua chave PIX" className={inputCls + " mt-1"} />
            </div>
            <button onClick={requestWithdrawal} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground">Solicitar</button>
          </div>
        )}

        {/* Create Link */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Link2 size={16} /> Meus Links</h3>
            <button onClick={() => setShowCreateLink(!showCreateLink)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
              + Novo Link
            </button>
          </div>

          {showCreateLink && (
            <div className="mb-4 rounded-xl border border-dashed border-primary/30 p-3 space-y-3 animate-slide-up">
              <label className="text-xs text-muted-foreground">Tipo do link</label>
              <select value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)} className={inputCls}>
                <option value="global">🌐 Site inteiro (global)</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>🐶 {c.name}</option>
                ))}
              </select>
              <button onClick={createLink} className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground">Gerar Link</button>
            </div>
          )}

          {links.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum link criado ainda</p>
          ) : (
            <div className="space-y-2">
              {links.map(link => {
                const campaign = campaigns.find(c => c.id === link.campaign_id);
                return (
                  <div key={link.id} className="flex items-center justify-between rounded-xl border border-border bg-accent/30 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {link.link_type === 'global' ? '🌐 Site inteiro' : `🐶 ${campaign?.name || 'Campanha'}`}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span><MousePointerClick size={10} className="inline" /> {link.clicks} cliques</span>
                      </div>
                    </div>
                    <button onClick={() => copyLink(link)} className="rounded-lg bg-primary/10 p-2 text-primary">
                      {copied === link.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Commissions */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Últimas Comissões</h3>
          {commissions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhuma comissão ainda</p>
          ) : (
            <div className="space-y-2">
              {commissions.slice(0, 10).map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-xl bg-accent/30 p-3">
                  <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                  <span className="text-sm font-bold text-primary">+R$ {(c.amount / 100).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal history */}
        {withdrawals.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Histórico de Saques</h3>
            <div className="space-y-2">
              {withdrawals.map(w => (
                <div key={w.id} className="flex items-center justify-between rounded-xl bg-accent/30 p-3">
                  <div>
                    <span className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString('pt-BR')}</span>
                    <p className="text-sm font-bold text-foreground">R$ {(w.amount / 100).toFixed(2).replace('.', ',')}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    w.status === 'approved' ? 'bg-primary/10 text-primary' :
                    w.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {w.status === 'pending' ? 'Pendente' : w.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliatePage;
