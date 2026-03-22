import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/StatCard';
import { Users, CreditCard, AlertTriangle, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const { gymId } = useAuth();
  const [stats, setStats] = useState({ clients: 0, activeSubscriptions: 0, expiredSubscriptions: 0, monthlyRevenue: 0 });
  const [recentClients, setRecentClients] = useState<any[]>([]);

  useEffect(() => {
    if (!gymId) return;
    
    const fetchStats = async () => {
      const { count: clientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gymId);

      const { count: activeCount } = await supabase
        .from('subscriptions')
        .select('*, clients!inner(gym_id)', { count: 'exact', head: true })
        .eq('clients.gym_id', gymId)
        .eq('status', 'actif');

      const { count: expiredCount } = await supabase
        .from('subscriptions')
        .select('*, clients!inner(gym_id)', { count: 'exact', head: true })
        .eq('clients.gym_id', gymId)
        .eq('status', 'expiré');

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, clients!inner(gym_id)')
        .eq('clients.gym_id', gymId)
        .gte('date', startOfMonth);

      const revenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setStats({
        clients: clientCount || 0,
        activeSubscriptions: activeCount || 0,
        expiredSubscriptions: expiredCount || 0,
        monthlyRevenue: revenue,
      });

      const { data: recent } = await supabase
        .from('clients')
        .select('*')
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentClients(recent || []);
    };

    fetchStats();
  }, [gymId]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold font-display">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Vue d'ensemble de votre salle</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard title="Clients" value={stats.clients} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Abonnements actifs" value={stats.activeSubscriptions} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Expirés" value={stats.expiredSubscriptions} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard title="Revenus du mois" value={`${stats.monthlyRevenue.toLocaleString()} F`} icon={<CreditCard className="h-5 w-5" />} />
      </div>

      <div>
        <h2 className="text-lg font-semibold font-display mb-3">Clients récents</h2>
        <div className="space-y-2">
          {recentClients.length === 0 && (
            <p className="text-muted-foreground text-sm py-8 text-center">Aucun client pour le moment</p>
          )}
          {recentClients.map((client) => (
            <div key={client.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {client.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
