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
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <span className="text-sidebar-primary-foreground font-bold text-lg">G</span>
        </div>
        <span className="text-sidebar-foreground font-display font-bold text-lg">GymFlow</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(item.to)
                ? 'bg-sidebar-accent text-sidebar-primary'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};
