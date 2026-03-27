import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";

// Auth pages
import LoginPage from "@/pages/LoginPage";
import Register from "@/pages/auth/Register";

// Landing
import LandingPage from "@/pages/landing/LandingPage";

// Manager pages
import ManagerDashboard from "@/pages/manager/Dashboard";
import ManagerClients from "@/pages/manager/Clients";
import ManagerClientDetails from "@/pages/manager/ClientDetails";
import AddClientPage from "@/pages/AddClientPage";
import ScanPage from "@/pages/ScanPage";
import PaymentsPage from "@/pages/PaymentsPage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import ManagerNotifications from "@/pages/manager/Notifications";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminBoutiques from "@/pages/admin/Boutiques";
import AdminSettings from "@/pages/admin/Settings";
import AdminUsers from "@/pages/admin/Users";

// Client pages
import ClientDashboard from "@/pages/client/Dashboard";
import ClientHistory from "@/pages/client/History";
import ClientPoints from "@/pages/client/Points";
import ClientProfile from "@/pages/client/Profile";
import ClientPromotions from "@/pages/client/Promotions";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public / Landing */}
    <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
    
    {/* Auth */}
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

    {/* Manager routes */}
    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<ManagerDashboard />} />
      <Route path="/clients" element={<ManagerClients />} />
      <Route path="/clients/new" element={<AddClientPage />} />
      <Route path="/clients/:id" element={<ManagerClientDetails />} />
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/payments" element={<PaymentsPage />} />
      <Route path="/subscriptions" element={<SubscriptionsPage />} />
      <Route path="/alerts" element={<ManagerNotifications />} />
    </Route>

    {/* Admin routes */}
    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/boutiques" element={<AdminBoutiques />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin/users" element={<AdminUsers />} />
    </Route>

    {/* Client routes */}
    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/my-space" element={<ClientDashboard />} />
      <Route path="/my-space/history" element={<ClientHistory />} />
      <Route path="/my-space/points" element={<ClientPoints />} />
      <Route path="/my-space/profile" element={<ClientProfile />} />
      <Route path="/my-space/promotions" element={<ClientPromotions />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
