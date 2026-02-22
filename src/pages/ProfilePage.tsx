import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Heart, LogOut, LogIn, Trophy, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

const ProfilePage = () => {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { donations } = useApp();
  const navigate = useNavigate();

  const userDonations = user
    ? donations.filter(d => d.email === user.email)
    : [];
  const totalDonated = userDonations.reduce((sum, d) => sum + d.amount, 0);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-24">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pb-24">
        <div className="bg-primary px-4 pb-6 pt-8">
          <h1 className="text-2xl font-extrabold text-primary-foreground">Perfil</h1>
        </div>
        <div className="mx-auto max-w-lg px-4 -mt-3">
          <div className="rounded-2xl border border-border bg-card p-8 text-center animate-slide-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent mx-auto mb-4">
              <User size={28} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Entre na sua conta</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Crie uma conta para acompanhar suas doações e aparecer no ranking!
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-bold text-primary-foreground"
            >
              <LogIn size={18} /> Entrar ou Criar Conta
            </Link>
            <p className="text-[10px] text-muted-foreground mt-4">
              Você pode doar sem conta, mas não aparecerá no ranking
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="pb-24">
      <div className="bg-primary px-4 pb-6 pt-8">
        <h1 className="text-2xl font-extrabold text-primary-foreground">Perfil</h1>
      </div>

      <div className="mx-auto max-w-lg px-4 -mt-3">
        {/* Profile Card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <User size={28} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-foreground">{profile?.display_name || 'Usuário'}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail size={12} />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-accent p-4 text-center">
            <Heart className="mx-auto mb-1 text-primary" size={20} />
            <p className="text-xl font-extrabold text-foreground">R${totalDonated}</p>
            <p className="text-[10px] text-muted-foreground">Total doado</p>
          </div>
          <div className="rounded-2xl bg-accent p-4 text-center">
            <Heart className="mx-auto mb-1 text-primary" size={20} />
            <p className="text-xl font-extrabold text-foreground">{userDonations.length}</p>
            <p className="text-[10px] text-muted-foreground">Doações feitas</p>
          </div>
        </div>

        {/* Ranking link */}
        <Link
          to="/ranking"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary transition-colors"
        >
          <Trophy size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Ranking de Doadores</p>
            <p className="text-[10px] text-muted-foreground">Veja sua posição entre os maiores doadores</p>
          </div>
        </Link>

        {/* Affiliate link */}
        <Link
          to="/afiliado"
          className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary transition-colors"
        >
          <Users size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Painel de Afiliado</p>
            <p className="text-[10px] text-muted-foreground">Ganhe 80% de comissão divulgando campanhas</p>
          </div>
        </Link>

        {/* Donation history */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-foreground mb-3">Minhas Doações</h2>
          {userDonations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma doação ainda. Que tal começar?</p>
          ) : (
            <div className="space-y-2">
              {userDonations.map(d => (
                <div key={d.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{d.campaignName}</p>
                    <p className="text-[10px] text-muted-foreground">{d.date}</p>
                  </div>
                  <p className="text-sm font-bold text-primary">R${d.amount}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut size={16} /> Sair da Conta
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
