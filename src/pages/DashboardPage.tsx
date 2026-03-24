import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/StatCard';
import { Users, CreditCard, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clientService } from '@/services/clientService';
import { subscriptionService } from '@/services/subscriptionService';
import { paymentService } from '@/services/paymentService';

const DashboardPage = () => {
  const { gymId } = useAuth();
  const [stats, setStats] = useState({ clients: 0, activeSubscriptions: 0, expiredSubscriptions: 0, monthlyRevenue: 0 });
  const [recentClients, setRecentClients] = useState<any[]>([]);

  useEffect(() => {
    if (!gymId) return;
    
    const fetchStats = async () => {
      const [clientCount, activeCount, expiredCount, revenue, recent] = await Promise.all([
        clientService.count(gymId),
        subscriptionService.countByStatus(gymId, 'actif'),
        subscriptionService.countByStatus(gymId, 'expiré'),
        paymentService.getMonthlyRevenue(gymId),
        clientService.getRecent(gymId, 5),
      ]);

      setStats({ clients: clientCount, activeSubscriptions: activeCount, expiredSubscriptions: expiredCount, monthlyRevenue: revenue });
      setRecentClients(recent);
    };

    fetchStats();
  }, [gymId]);

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble de votre salle</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard title="Clients" value={stats.clients} icon={<Users className="h-5 w-5" />} iconBg="bg-accent/10" iconColor="text-accent" />
        <StatCard title="Actifs" value={stats.activeSubscriptions} icon={<TrendingUp className="h-5 w-5" />} iconBg="bg-[hsl(var(--success)/0.12)]" iconColor="text-[hsl(var(--success))]" />
        <StatCard title="Expirés" value={stats.expiredSubscriptions} icon={<AlertTriangle className="h-5 w-5" />} iconBg="bg-[hsl(var(--warning)/0.12)]" iconColor="text-[hsl(var(--warning))]" />
        <StatCard title="Revenus" value={`${stats.monthlyRevenue.toLocaleString()} F`} icon={<CreditCard className="h-5 w-5" />} iconBg="bg-primary/10" iconColor="text-primary" />
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold font-display">Clients récents</h2>
          <Link to="/clients" className="text-accent text-sm font-semibold flex items-center gap-1 hover:underline">
            Voir tout <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {recentClients.length === 0 && (
            <p className="text-muted-foreground text-sm py-8 text-center">Aucun client pour le moment</p>
          )}
          {recentClients.map((client) => (
            <Link key={client.id} to={`/clients/${client.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
              {client.photo_url ? (
                <img src={client.photo_url} alt={client.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                  {client.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.phone}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
