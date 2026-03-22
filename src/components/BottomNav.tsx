import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, QrCode, CreditCard, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/scan', icon: QrCode, label: 'Scan' },
  { to: '/payments', icon: CreditCard, label: 'Paiements' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
];

export const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn('bottom-nav-item', pathname.startsWith(item.to) && 'active')}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};
