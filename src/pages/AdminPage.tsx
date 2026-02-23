import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Menu, X, LayoutDashboard, Heart, Utensils, Settings, Plus, Edit2, Trash2, Save, Image, Lock, Users, Eye, UserCheck, Link2, DollarSign, Check, XCircle, TrendingUp, Clock, CheckCircle2, AlertTriangle, BarChart3, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import dog1 from '@/assets/dog1.jpg';

type AdminTab = 'dashboard' | 'campaigns' | 'ration' | 'site' | 'customers' | 'affiliates';

const CHART_COLORS = ['hsl(145, 63%, 42%)', 'hsl(40, 90%, 55%)', 'hsl(220, 70%, 55%)', 'hsl(0, 84%, 60%)', 'hsl(280, 60%, 55%)'];

const AdminPage = () => {
  const { user, loading, isAdmin, signIn } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminLogin onLogin={signIn} />;
  }

  return <AdminDashboard />;
};

/* ─── ADMIN LOGIN ─── */
const AdminLogin = ({ onLogin }: { onLogin: (email: string, password: string) => Promise<{ error: string | null }> }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await onLogin(email, password);
    if (error) toast.error('Credenciais inválidas');
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-3">
            <Lock size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Painel Admin</h1>
          <p className="text-sm text-muted-foreground">Acesso restrito</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Login</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@email.com" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
};

/* ─── ADMIN DASHBOARD ─── */
const AdminDashboard = () => {
  const { campaigns, donations, food, siteConfig, addCampaign, updateCampaign, deleteCampaign, addCampaignUpdate, updateFoodSettings, updateSiteConfig } = useApp();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const switchTab = (tab: AdminTab) => { setActiveTab(tab); setSidebarOpen(false); };

  const menuItems = [
    { key: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'campaigns' as AdminTab, label: 'Vaquinhas', icon: Heart },
    { key: 'ration' as AdminTab, label: 'Ração', icon: Utensils },
    { key: 'customers' as AdminTab, label: 'Clientes', icon: UserCheck },
    { key: 'affiliates' as AdminTab, label: 'Afiliados', icon: Link2 },
    { key: 'site' as AdminTab, label: 'Configurar Site', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-primary px-4 pb-4 pt-6">
        <div className="mx-auto max-w-4xl flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="rounded-full bg-primary-foreground/20 p-2"><Menu size={20} className="text-primary-foreground" /></button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-primary-foreground">Painel Admin</h1>
            <p className="text-xs text-primary-foreground/70">{menuItems.find(m => m.key === activeTab)?.label}</p>
          </div>
          <button onClick={() => signOut()} className="rounded-full bg-primary-foreground/20 px-3 py-1.5 text-xs font-bold text-primary-foreground">Sair</button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-64 bg-card shadow-2xl animate-slide-up flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-bold text-foreground">Menu Admin</span>
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 hover:bg-muted"><X size={20} className="text-muted-foreground" /></button>
            </div>
            <nav className="flex-1 p-2">
              {menuItems.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => switchTab(key)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${activeTab === key ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>
                  <Icon size={18} />{label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 mt-4">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'campaigns' && <CampaignsTab />}
        {activeTab === 'ration' && <RationTab />}
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'affiliates' && <AffiliatesTab />}
        {activeTab === 'site' && <SiteConfigTab />}
      </div>
    </div>
  );
};

/* ─── DASHBOARD ─── */
const DashboardTab = () => {
  const { campaigns, donations, food } = useApp();
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [allDonations, setAllDonations] = useState<any[]>([]);
  const [viewsLoading, setViewsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('page_views').select('*').order('created_at', { ascending: false }).limit(1000),
      supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(1000),
    ]).then(([pvRes, donRes]) => {
      setPageViews(pvRes.data || []);
      setAllDonations(donRes.data || []);
      setViewsLoading(false);
    });
  }, []);

  // Separate paid vs pending
  const paidDonations = allDonations.filter(d => d.payment_status === 'paid');
  const pendingDonations = allDonations.filter(d => d.payment_status === 'pending');

  const totalPaid = paidDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalPending = pendingDonations.reduce((sum, d) => sum + d.amount, 0);
  
  // Unique visitors (deduplicated by page - already deduped by session in PageTracker)
  const uniquePages = new Set(pageViews.map(v => v.page));
  const totalViews = pageViews.length;

  const pieData = campaigns.filter(c => c.raised > 0).map(c => ({ name: c.name, value: c.raised }));
  const barData = campaigns.map(c => ({ name: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name, arrecadado: c.raised, meta: c.goal, doadores: c.donors }));
  const topCampaign = [...campaigns].sort((a, b) => b.donors - a.donors)[0];

  // Group page views by day
  const viewsByDay: Record<string, number> = {};
  pageViews.forEach(v => {
    const day = v.created_at?.split('T')[0];
    if (day) viewsByDay[day] = (viewsByDay[day] || 0) + 1;
  });
  const viewsChartData = Object.entries(viewsByDay).sort().slice(-14).map(([day, count]) => ({ day: day.slice(5), visitas: count }));

  // Donations by day (paid only)
  const donationsByDay: Record<string, number> = {};
  paidDonations.forEach(d => {
    const day = d.created_at?.split('T')[0];
    if (day) donationsByDay[day] = (donationsByDay[day] || 0) + d.amount;
  });
  const donationsChartData = Object.entries(donationsByDay).sort().slice(-14).map(([day, total]) => ({ day: day.slice(5), valor: total }));

  // Today stats
  const today = new Date().toISOString().split('T')[0];
  const todayPaid = paidDonations.filter(d => d.created_at?.startsWith(today));
  const todayRevenue = todayPaid.reduce((sum, d) => sum + d.amount, 0);
  const todayViews = pageViews.filter(v => v.created_at?.startsWith(today)).length;

  // Conversion rate
  const conversionRate = totalViews > 0 ? ((paidDonations.length / totalViews) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Main stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} className="text-primary" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Vendas Pagas</p>
          </div>
          <p className="text-xl font-extrabold text-foreground">R$ {totalPaid.toLocaleString('pt-BR')}</p>
          <p className="text-[10px] text-primary font-bold">{paidDonations.length} doações</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-yellow-500" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Pendentes</p>
          </div>
          <p className="text-xl font-extrabold text-foreground">R$ {totalPending.toLocaleString('pt-BR')}</p>
          <p className="text-[10px] text-yellow-500 font-bold">{pendingDonations.length} aguardando</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye size={14} className="text-blue-500" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Visitas</p>
          </div>
          <p className="text-xl font-extrabold text-foreground">{totalViews}</p>
          <p className="text-[10px] text-blue-500 font-bold">{uniquePages.size} páginas</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-purple-500" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Conversão</p>
          </div>
          <p className="text-xl font-extrabold text-foreground">{conversionRate}%</p>
          <p className="text-[10px] text-purple-500 font-bold">{campaigns.length} vaquinhas</p>
        </div>
      </div>

      {/* Today highlight */}
      <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={16} className="text-primary" />
          <p className="text-sm font-bold text-foreground">Hoje</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Receita</p>
            <p className="text-base font-extrabold text-primary">R$ {todayRevenue.toLocaleString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Doações</p>
            <p className="text-base font-extrabold text-foreground">{todayPaid.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Visitas</p>
            <p className="text-base font-extrabold text-foreground">{todayViews}</p>
          </div>
        </div>
      </div>

      {topCampaign && (
        <div className="rounded-2xl border border-border bg-accent/50 p-4">
          <p className="text-xs text-muted-foreground mb-1">🏆 Vaquinha mais popular</p>
          <p className="text-lg font-bold text-foreground">{topCampaign.name}</p>
          <p className="text-sm text-muted-foreground">{topCampaign.donors} doadores · R${topCampaign.raised} arrecadados</p>
        </div>
      )}

      {/* Pending donations list */}
      {pendingDonations.length > 0 && (
        <div className="rounded-2xl border-2 border-yellow-400/30 bg-yellow-50/30 dark:bg-yellow-950/10 p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-500" /> Vendas Pendentes ({pendingDonations.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pendingDonations.slice(0, 10).map(d => (
              <div key={d.id} className="flex items-center justify-between rounded-xl bg-card border border-border p-3">
                <div>
                  <p className="text-xs font-bold text-foreground">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString('pt-BR')} · {d.campaign_name || 'Doação'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-600">R$ {d.amount}</p>
                  <p className="text-[10px] text-yellow-500 font-semibold">Pendente</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue chart (paid only) */}
      {donationsChartData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Receita Paga (14 dias)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={donationsChartData}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(145, 63%, 42%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(145, 63%, 42%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `R$ ${v}`} />
              <Area type="monotone" dataKey="valor" stroke="hsl(145, 63%, 42%)" strokeWidth={2} fill="url(#colorValor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Views chart */}
      {viewsChartData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Eye size={16} className="text-blue-500" /> Visitas (14 dias)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={viewsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="visitas" stroke="hsl(220, 70%, 55%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {pieData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Distribuição por Campanha</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name.slice(0, 8)}… ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `R$${v}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {barData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Arrecadado vs Meta</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `R$${v}`} />
              <Bar dataKey="arrecadado" fill="hsl(145, 63%, 42%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meta" fill="hsl(220, 13%, 91%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

/* ─── CUSTOMERS TAB ─── */
const CustomersTab = () => {
  const [allDonations, setAllDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('donations').select('*').eq('payment_status', 'paid').order('created_at', { ascending: false })
      .then(({ data }) => { setAllDonations(data || []); setLoading(false); });
  }, []);

  // Group donations by name+email to build customer list
  const customerMap = new Map<string, { name: string; email: string; phone: string; totalDonated: number; donationCount: number; lastDonation: string }>();
  
  allDonations.forEach(d => {
    const key = d.email || d.name;
    const existing = customerMap.get(key);
    if (existing) {
      existing.totalDonated += d.amount;
      existing.donationCount += 1;
      if (d.created_at > existing.lastDonation) existing.lastDonation = d.created_at;
    } else {
      customerMap.set(key, {
        name: d.name,
        email: d.email || '',
        phone: d.phone || '',
        totalDonated: d.amount,
        donationCount: 1,
        lastDonation: d.created_at,
      });
    }
  });

  const customers = Array.from(customerMap.values()).sort((a, b) => b.totalDonated - a.totalDonated);

  if (loading) return <p className="text-center text-muted-foreground py-8">Carregando...</p>;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2"><UserCheck size={18} /> Clientes ({customers.length})</h2>
        <p className="text-xs text-muted-foreground mb-4">Somente doadores com pagamento confirmado</p>
      </div>

      {customers.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">Nenhum cliente ainda</p>
      ) : (
        <div className="space-y-2">
          {customers.map((c, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">{c.name}</p>
                  {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">R$ {c.totalDonated.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-muted-foreground">{c.donationCount} doações</p>
                </div>
              </div>
              {c.phone && (
                <a href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  💬 WhatsApp
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── AFFILIATES TAB ─── */
const AffiliatesTab = () => {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [affRes, wdRes] = await Promise.all([
      supabase.from('affiliates').select('*'),
      supabase.from('withdrawal_requests').select('*').order('created_at', { ascending: false }),
    ]);
    setAffiliates(affRes.data || []);
    setWithdrawals(wdRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleWithdrawal = async (id: string, status: 'approved' | 'rejected') => {
    const withdrawal = withdrawals.find(w => w.id === id);
    await supabase.from('withdrawal_requests').update({ status }).eq('id', id);
    
    if (status === 'rejected' && withdrawal) {
      const aff = affiliates.find(a => a.id === withdrawal.affiliate_id);
      if (aff) {
        await supabase.from('affiliates').update({ balance: aff.balance + withdrawal.amount }).eq('id', aff.id);
      }
    }
    
    toast.success(status === 'approved' ? 'Saque aprovado!' : 'Saque rejeitado!');
    await fetchData();
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Carregando...</p>;

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2"><Link2 size={18} /> Afiliados ({affiliates.length})</h2>
        <p className="text-xs text-muted-foreground">Gerencie afiliados e saques</p>
      </div>

      {pendingWithdrawals.length > 0 && (
        <div className="rounded-2xl border-2 border-primary bg-primary/5 p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <DollarSign size={16} className="text-primary" /> Saques Pendentes ({pendingWithdrawals.length})
          </h3>
          <div className="space-y-2">
            {pendingWithdrawals.map(w => (
              <div key={w.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">R$ {(w.amount / 100).toFixed(2).replace('.', ',')}</p>
                    <p className="text-[10px] text-muted-foreground">PIX {w.pix_key_type}: {w.pix_key}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(w.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleWithdrawal(w.id, 'approved')} className="rounded-lg bg-primary p-2 text-primary-foreground"><Check size={14} /></button>
                    <button onClick={() => handleWithdrawal(w.id, 'rejected')} className="rounded-lg bg-destructive p-2 text-destructive-foreground"><XCircle size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {affiliates.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">Nenhum afiliado ainda</p>
      ) : (
        <div className="space-y-2">
          {affiliates.map(a => (
            <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-bold text-foreground">Afiliado ID: {a.id.slice(0, 8)}...</p>
              <p className="text-xs text-muted-foreground">Saldo: R$ {(a.balance / 100).toFixed(2).replace('.', ',')} · Total: R$ {(a.total_earned / 100).toFixed(2).replace('.', ',')}</p>
              {a.pix_key && <p className="text-xs text-muted-foreground">PIX: {a.pix_key}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── CAMPAIGNS CRUD ─── */
const CampaignsTab = () => {
  const { campaigns, addCampaign, updateCampaign, deleteCampaign, addCampaignUpdate } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', location: '', goal: '', description: '', status: 'Ativa' as 'Ativa' | 'Urgente', image: '' });
  const [editForm, setEditForm] = useState<Partial<{ name: string; location: string; goal: string; description: string; status: 'Ativa' | 'Urgente'; image: string }>>({});
  const [updateText, setUpdateText] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addCampaign({ name: form.name, image: form.image || dog1, location: form.location, status: form.status, goal: parseInt(form.goal), description: form.description });
    setForm({ name: '', location: '', goal: '', description: '', status: 'Ativa', image: '' });
    setShowCreate(false);
    toast.success('Campanha criada!');
  };

  const startEdit = (c: typeof campaigns[0]) => {
    setEditingId(c.id);
    setEditForm({ name: c.name, location: c.location, goal: c.goal.toString(), description: c.description, status: c.status, image: c.image });
  };

  const handleSaveEdit = (id: string) => {
    updateCampaign(id, { name: editForm.name, location: editForm.location, goal: parseInt(editForm.goal || '0'), description: editForm.description, status: editForm.status, ...(editForm.image ? { image: editForm.image } : {}) });
    setEditingId(null);
    toast.success('Campanha atualizada!');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      deleteCampaign(id);
      toast.success('Campanha excluída!');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'create' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (target === 'create') setForm(prev => ({ ...prev, image: dataUrl }));
      else setEditForm(prev => ({ ...prev, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddUpdate = (id: string) => {
    addCampaignUpdate(id, { text: updateText, date: new Date().toISOString().split('T')[0] });
    setUpdateText('');
    setShowUpdateForm(null);
    toast.success('Atualização adicionada!');
  };

  const inputCls = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-4 animate-slide-up">
      <button onClick={() => setShowCreate(!showCreate)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground">
        <Plus size={18} /> Nova Campanha
      </button>

      {showCreate && (
        <form onSubmit={handleCreate} className="space-y-3 rounded-2xl border border-border bg-card p-4 animate-slide-up">
          <input type="text" placeholder="Nome da campanha" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} required />
          <input type="text" placeholder="Localização" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className={inputCls} required />
          <input type="number" placeholder="Meta (R$)" value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} className={inputCls} required />
          <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as 'Ativa' | 'Urgente' }))} className={inputCls}>
            <option value="Ativa">Ativa</option>
            <option value="Urgente">Urgente</option>
          </select>
          <textarea placeholder="Descrição" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className={inputCls + " resize-none"} required />
          <div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"><Image size={16} /> Foto da campanha</label>
            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'create')} className="mt-1 text-sm text-muted-foreground" />
            {form.image && <img src={form.image} alt="Preview" className="mt-2 h-24 w-full rounded-xl object-cover" />}
          </div>
          <button type="submit" className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground">Criar Campanha</button>
        </form>
      )}

      {campaigns.map(c => (
        <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex gap-3 p-4">
            <img src={c.image} alt={c.name} className="h-16 w-16 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground truncate">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.location}</p>
                  <p className="text-xs text-muted-foreground">R${c.raised} / R${c.goal} · {c.donors} doadores</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.status === 'Urgente' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>{c.status}</span>
              </div>
            </div>
          </div>
          <div className="flex border-t border-border">
            <button onClick={() => editingId === c.id ? setEditingId(null) : startEdit(c)} className="flex flex-1 items-center justify-center gap-1 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"><Edit2 size={13} /> Editar</button>
            <button onClick={() => setShowUpdateForm(showUpdateForm === c.id ? null : c.id)} className="flex flex-1 items-center justify-center gap-1 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors border-x border-border"><Plus size={13} /> Atualização</button>
            <button onClick={() => handleDelete(c.id, c.name)} className="flex flex-1 items-center justify-center gap-1 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/5 transition-colors"><Trash2 size={13} /> Excluir</button>
          </div>
          {editingId === c.id && (
            <div className="border-t border-border p-4 space-y-3 animate-slide-up">
              <input type="text" value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Nome" />
              <input type="text" value={editForm.location || ''} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} className={inputCls} placeholder="Localização" />
              <input type="number" value={editForm.goal || ''} onChange={e => setEditForm(p => ({ ...p, goal: e.target.value }))} className={inputCls} placeholder="Meta (R$)" />
              <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as 'Ativa' | 'Urgente' }))} className={inputCls}>
                <option value="Ativa">Ativa</option>
                <option value="Urgente">Urgente</option>
              </select>
              <textarea value={editForm.description || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} className={inputCls + " resize-none"} placeholder="Descrição" />
              <div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"><Image size={16} /> Trocar foto</label>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'edit')} className="mt-1 text-sm text-muted-foreground" />
                {editForm.image && <img src={editForm.image} alt="Preview" className="mt-2 h-24 w-full rounded-xl object-cover" />}
              </div>
              <button onClick={() => handleSaveEdit(c.id)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"><Save size={16} /> Salvar Alterações</button>
            </div>
          )}
          {showUpdateForm === c.id && (
            <div className="border-t border-border p-4 space-y-2 animate-slide-up">
              <textarea placeholder="Texto da atualização..." value={updateText} onChange={e => setUpdateText(e.target.value)} rows={2} className={inputCls + " resize-none"} />
              <button onClick={() => handleAddUpdate(c.id)} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Adicionar</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ─── RATION SETTINGS ─── */
const RationTab = () => {
  const { food, updateFoodSettings } = useApp();
  const [goalKg, setGoalKg] = useState(food.goalKg.toString());
  const [pricePerKg, setPricePerKg] = useState(food.pricePerKg.toString());

  const handleSave = () => {
    updateFoodSettings({ goalKg: parseInt(goalKg), pricePerKg: parseInt(pricePerKg) });
    toast.success('Configurações de ração salvas!');
  };

  const inputCls = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="animate-slide-up">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Configurações de Ração</h2>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Meta mensal (kg)</label>
          <input type="number" value={goalKg} onChange={e => setGoalKg(e.target.value)} className={inputCls + " mt-1"} />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Preço por kg (R$)</label>
          <input type="number" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} className={inputCls + " mt-1"} />
        </div>
        <div className="rounded-xl bg-accent/50 p-3">
          <p className="text-xs text-muted-foreground">Status atual</p>
          <p className="text-sm font-bold text-foreground">{food.raisedKg}kg / {food.goalKg}kg · {food.donors} doadores</p>
        </div>
        <button onClick={handleSave} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"><Save size={16} /> Salvar</button>
      </div>
    </div>
  );
};

/* ─── SITE CONFIG ─── */
const SiteConfigTab = () => {
  const { siteConfig, updateSiteConfig } = useApp();
  const [heroTitle, setHeroTitle] = useState(siteConfig.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(siteConfig.heroSubtitle);
  const [previewImage, setPreviewImage] = useState(siteConfig.heroImage);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPreviewImage(ev.target?.result as string); };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateSiteConfig({ heroTitle, heroSubtitle, heroImage: previewImage });
    toast.success('Configurações do site salvas!');
  };

  const inputCls = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="animate-slide-up">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Configurar Site</h2>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Banner Principal</label>
          <img src={previewImage} alt="Banner preview" className="mt-2 h-40 w-full rounded-xl object-cover" />
          <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-2 text-sm text-muted-foreground" />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Título do Banner</label>
          <input type="text" value={heroTitle} onChange={e => setHeroTitle(e.target.value)} className={inputCls + " mt-1"} />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Subtítulo</label>
          <input type="text" value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} className={inputCls + " mt-1"} />
        </div>
        <button onClick={handleSave} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"><Save size={16} /> Salvar Configurações</button>
      </div>
    </div>
  );
};

export default AdminPage;
