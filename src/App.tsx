import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import SocialProofNotifications from "@/components/SocialProofNotifications";
import PageTracker from "@/components/PageTracker";
import HomePage from "@/pages/HomePage";
import CampaignsPage from "@/pages/CampaignsPage";
import CampaignDetailPage from "@/pages/CampaignDetailPage";
import FoodPage from "@/pages/FoodPage";
import DonationsPage from "@/pages/DonationsPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";
import AuthPage from "@/pages/AuthPage";
import HistoricoPage from "@/pages/HistoricoPage";
import AffiliatePage from "@/pages/AffiliatePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <AuthProvider>
            <Sonner position="top-center" />
            <BrowserRouter>
              <div className="mx-auto min-h-screen max-w-2xl bg-background">
                <PageTracker />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/vaquinhas" element={<CampaignsPage />} />
                  <Route path="/vaquinhas/:id" element={<CampaignDetailPage />} />
                  <Route path="/racao" element={<FoodPage />} />
                  <Route path="/doacoes" element={<DonationsPage />} />
                  <Route path="/perfil" element={<ProfilePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/historico" element={<HistoricoPage />} />
                  <Route path="/afiliado" element={<AffiliatePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <BottomNav />
                <SocialProofNotifications />
              </div>
            </BrowserRouter>
          </AuthProvider>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
