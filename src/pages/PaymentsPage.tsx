import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard } from 'lucide-react';

const PaymentsPage = () => {
  const { gymId } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!gymId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('payments')
        .select('*, clients!inner(name, gym_id)')
        .eq('clients.gym_id', gymId)
        .order('date', { ascending: false })
        .limit(50);
      setPayments(data || []);
    };
    fetch();
  }, [gymId]);

  const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold font-display">Paiements</h1>

      <div className="card-stat">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total affiché</p>
            <p className="text-xl font-bold font-display">{total.toLocaleString()} F CFA</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {payments.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun paiement</p>}
        {payments.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border bg-card">
            <div>
              <p className="text-sm font-medium">{p.clients?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{p.method} · {new Date(p.date).toLocaleDateString('fr-FR')}</p>
            </div>
            <span className="font-bold font-display text-sm">{p.amount?.toLocaleString()} F</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentsPage;
