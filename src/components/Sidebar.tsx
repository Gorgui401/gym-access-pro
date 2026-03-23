import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, QrCode, CreditCard, Bell, Building2, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const managerNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/scan', icon: QrCode, label: 'Scanner QR' },
  { to: '/payments', icon: CreditCard, label: 'Paiements' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
];

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard Admin' },
  { to: '/admin/gyms', icon: Building2, label: 'Salles' },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
];

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { role, signOut } = useAuth();
  const nav = role === 'admin' ? adminNav : managerNav;

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-sidebar border-r-0">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="h-10 w-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
          <span className="text-sidebar-primary-foreground font-extrabold text-lg">G</span>
        </div>
        <div>
          <span className="text-sidebar-foreground font-display font-bold text-lg block leading-tight">GymFlow</span>
          <span className="text-sidebar-foreground/50 text-[10px] font-medium tracking-wider uppercase">Admin Dashboard</span>
        </div>
      </div>

      <div className="px-5 mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3">Menu principal</p>
      </div>

      <nav className="flex-1 px-4 space-y-0.5">
        {nav.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/30'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-5">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};
