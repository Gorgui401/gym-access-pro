import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

const ClientsPage = () => {
  const { gymId } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gymId) return;
    const fetchClients = async () => {
      let query = supabase.from('clients').select('*, subscriptions(status, end_date)').eq('gym_id', gymId).order('created_at', { ascending: false });
      if (search) query = query.ilike('name', `%${search}%`);
      const { data } = await query;
      setClients(data || []);
      setLoading(false);
    };
    fetchClients();
  }, [gymId, search]);

  const getStatus = (client: any) => {
    const active = client.subscriptions?.find((s: any) => s.status === 'actif');
    return active ? 'actif' : 'expiré';
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Clients</h1>
        <Button variant="touch" size="lg" asChild>
          <Link to="/clients/new"><Plus className="h-5 w-5 mr-1" />Ajouter</Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      <div className="space-y-2">
        {loading && <p className="text-center text-muted-foreground py-8">Chargement...</p>}
        {!loading && clients.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucun client trouvé</p>
        )}
        {clients.map((client) => {
          const status = getStatus(client);
          return (
            <Link
              key={client.id}
              to={`/clients/${client.id}`}
              className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow"
            >
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {client.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.phone}</p>
              </div>
              <span className={status === 'actif' ? 'status-active' : 'status-expired'}>
                {status === 'actif' ? '✅ Actif' : '❌ Expiré'}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ClientsPage;
