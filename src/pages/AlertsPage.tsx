import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Bell } from 'lucide-react';

const AlertsPage = () => {
  const { gymId } = useAuth();
  const [expiredClients, setExpiredClients] = useState<any[]>([]);

  useEffect(() => {
    if (!gymId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*, clients!inner(name, phone, gym_id)')
        .eq('clients.gym_id', gymId)
        .eq('status', 'expiré')
        .order('end_date', { ascending: false });
      setExpiredClients(data || []);
    };
    fetch();
  }, [gymId]);

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold font-display">Alertes & Relances</h1>

      <div className="card-stat border-secondary/30 bg-secondary/5">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-secondary" />
          <div>
            <p className="text-sm font-medium">{expiredClients.length} abonnements expirés</p>
            <p className="text-xs text-muted-foreground">Clients à relancer</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {expiredClients.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucune alerte 🎉</p>
        )}
        {expiredClients.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl border bg-card">
            <div>
              <p className="text-sm font-medium">{sub.clients?.name}</p>
              <p className="text-xs text-muted-foreground">{sub.clients?.phone}</p>
            </div>
            <div className="text-right">
              <span className="status-expired">Expiré</span>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(sub.end_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
