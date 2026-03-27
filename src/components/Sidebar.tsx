import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, QrCode, CreditCard, Bell, CalendarCheck,
  Building2, Settings, LogOut, ChevronLeft, ChevronRight,
  Dumbbell, UserCog, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

const managerNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/subscriptions', icon: CalendarCheck, label: 'Abonnements' },
  { to: '/scan', icon: QrCode, label: 'Scanner QR' },
  { to: '/payments', icon: CreditCard, label: 'Paiements' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
];

const managerSecondary = [
  { to: '/settings', icon: Settings, label: 'Paramètres' },
];

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/boutiques', icon: Building2, label: 'Salles' },
  { to: '/admin/users', icon: UserCog, label: 'Utilisateurs' },
  { to: '/admin/settings', icon: Shield, label: 'Configuration' },
];

export const Sidebar = ({ expanded, onToggle }: SidebarProps) => {
  const { pathname } = useLocation();
  const { role, signOut, user } = useAuth();

  const primaryNav = role === 'admin' ? adminNav : managerNav;
  const secondaryNav = role === 'admin' ? [] : managerSecondary;

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName[0]?.toUpperCase() || 'U';

  const NavItem = ({ item }: { item: typeof managerNav[0] }) => {
    const active = item.to === '/dashboard' || item.to === '/admin'
      ? pathname === item.to
      : pathname.startsWith(item.to);

    const link = (
      <Link
        to={item.to}
        className={cn(
          'flex items-center gap-3 rounded-xl text-sm font-medium transition-all',
          expanded ? 'px-4 py-3' : 'px-0 py-3 justify-center',
          active
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25'
            : 'text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent'
        )}
      >
        <item.icon className={cn('shrink-0', expanded ? 'h-[18px] w-[18px]' : 'h-5 w-5')} />
        {expanded && <span>{item.label}</span>}
      </Link>
    );

    if (!expanded) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  return (
    <aside
      className={cn(
        'hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40',
        expanded ? 'md:w-[260px]' : 'md:w-[72px]'
      )}
    >
      {/* Logo + Collapse */}
      <div className={cn('flex items-center py-5 border-b border-sidebar-border', expanded ? 'px-5 justify-between' : 'px-0 justify-center')}>
        <Link to="/dashboard" className={cn('flex items-center gap-2.5', !expanded && 'justify-center')}>
          <div className="h-10 w-10 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
            <Dumbbell className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <span className="text-sidebar-foreground font-display font-bold text-base block leading-tight">GymFlow</span>
              <span className="text-sidebar-foreground/40 text-[10px] font-medium tracking-wider uppercase">Pro Dashboard</span>
            </div>
          )}
        </Link>
        {expanded && (
          <button onClick={onToggle} className="h-7 w-7 rounded-lg flex items-center justify-center text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {!expanded && (
        <div className="flex justify-center py-3">
          <button onClick={onToggle} className="h-8 w-8 rounded-lg flex items-center justify-center text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {expanded && (
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/30">Menu</p>
        </div>
      )}

      <nav className={cn('flex-1 space-y-0.5', expanded ? 'px-3' : 'px-2 pt-1')}>
        {primaryNav.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}

        {secondaryNav.length > 0 && (
          <>
            {expanded ? (
              <div className="pt-5 pb-2 px-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/30">Autres</p>
              </div>
            ) : (
              <div className="h-px bg-sidebar-border my-3 mx-1" />
            )}
            {secondaryNav.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom: User + Logout */}
      <div className={cn('border-t border-sidebar-border', expanded ? 'p-4' : 'p-2')}>
        <div className={cn('flex items-center gap-3 mb-3', !expanded && 'justify-center mb-2')}>
          <div className="h-9 w-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-bold text-sm shrink-0">
            {userInitial}
          </div>
          {expanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{userName}</p>
              <p className="text-[11px] text-sidebar-foreground/40 truncate capitalize">{role || 'manager'}</p>
            </div>
          )}
        </div>

        {expanded ? (
          <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/45 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
            <LogOut className="h-[18px] w-[18px]" />
            Déconnexion
          </button>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button onClick={signOut} className="w-full flex items-center justify-center py-2.5 rounded-xl text-sidebar-foreground/45 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">Déconnexion</TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
};
