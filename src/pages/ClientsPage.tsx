import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { clientService } from '@/services/clientService';

const ClientsPage = () => {
  const { gymId } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gymId) return;
    const fetchClients = async () => {
      const data = await clientService.getAll(gymId, search || undefined);
      setClients(data);
      setLoading(false);
    };
    fetchClients();
  }, [gymId, search]);

  const getStatus = (client: any) => {
    const active = client.subscriptions?.find((s: any) => s.status === 'actif');
    return active ? 'actif' : 'expiré';
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight">Clients</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{clients.length} client{clients.length > 1 ? 's' : ''}</p>
        </div>
        <Button variant="touch" size="lg" asChild className="shadow-md shadow-primary/20">
          <Link to="/clients/new"><Plus className="h-5 w-5 mr-1" />Ajouter</Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un client..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-12 rounded-xl bg-card border-0 shadow-sm" />
      </div>

      <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
        {loading && <p className="text-center text-muted-foreground py-8">Chargement...</p>}
        {!loading && clients.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun client trouvé</p>}
        {clients.map((client, i) => {
          const status = getStatus(client);
          return (
            <Link key={client.id} to={`/clients/${client.id}`} className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors ${i < clients.length - 1 ? 'border-b border-border/50' : ''}`}>
              {client.photo_url ? (
                <img src={client.photo_url} alt={client.name} className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <div className="h-11 w-11 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">{client.name?.[0]?.toUpperCase() || '?'}</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.phone}</p>
              </div>
              <span className={status === 'actif' ? 'status-active' : 'status-expired'}>{status === 'actif' ? 'Actif' : 'Expiré'}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ClientsPage;
