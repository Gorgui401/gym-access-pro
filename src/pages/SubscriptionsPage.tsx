import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService } from '@/services/subscriptionService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, RefreshCw, Eye, CalendarDays, User, CreditCard, X } from 'lucide-react';
import { format, addMonths, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const RENEWAL_DURATIONS = [
  { label: '1 mois', months: 1 },
  { label: '3 mois', months: 3 },
  { label: '6 mois', months: 6 },
  { label: '12 mois', months: 12 },
];

const SubscriptionsPage = () => {
  const { gymId } = useAuth();
  const [subs, setSubs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'tous' | 'actif' | 'expiré'>('tous');

  // Detail dialog
  const [detailSub, setDetailSub] = useState<any | null>(null);

  // Renew dialog
  const [renewSub, setRenewSub] = useState<any | null>(null);
  const [renewDuration, setRenewDuration] = useState(1);
  const [renewing, setRenewing] = useState(false);

  const fetchSubs = async () => {
    if (!gymId) return;
    setLoading(true);
    const data = await subscriptionService.getAllByGym(gymId, search || undefined);
    setSubs(data);
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, [gymId, search]);

  const filtered = filter === 'tous' ? subs : subs.filter(s => s.status === filter);

  const counts = {
    tous: subs.length,
    actif: subs.filter(s => s.status === 'actif').length,
    expiré: subs.filter(s => s.status === 'expiré').length,
  };

  const handleRenew = async () => {
    if (!renewSub) return;
    setRenewing(true);
    const baseDate = new Date(renewSub.end_date) > new Date() ? new Date(renewSub.end_date) : new Date();
    const newEnd = format(addMonths(baseDate, renewDuration), 'yyyy-MM-dd');
    await subscriptionService.renew(renewSub.id, newEnd);
    setRenewing(false);
    setRenewSub(null);
    fetchSubs();
  };

  const statusBadge = (status: string) => {
    if (status === 'actif') return <Badge className="bg-emerald-500/15 text-emerald-600 border-0 font-semibold">Actif</Badge>;
    return <Badge className="bg-red-500/15 text-red-500 border-0 font-semibold">Expiré</Badge>;
  };

  const daysLeft = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return <span className="text-xs text-red-500 font-medium">Expiré depuis {Math.abs(diff)}j</span>;
    if (diff <= 7) return <span className="text-xs text-amber-500 font-medium">{diff}j restants</span>;
    return <span className="text-xs text-muted-foreground">{diff}j restants</span>;
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight">Abonnements</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{subs.length} abonnement{subs.length > 1 ? 's' : ''} au total</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {(['tous', 'actif', 'expiré'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl p-3 text-center transition-all border ${
              filter === f
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                : 'bg-card border-border hover:border-primary/30'
            }`}
          >
            <p className="text-2xl font-bold font-display">{counts[f]}</p>
            <p className="text-xs font-medium capitalize mt-0.5 opacity-80">{f}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom de client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-11 h-12 rounded-xl bg-card border-0 shadow-sm"
        />
      </div>

      {/* List */}
      <div className="bg-card rounded-2xl shadow-sm overflow-hidden divide-y divide-border/50">
        {loading && <p className="text-center text-muted-foreground py-8">Chargement...</p>}
        {!loading && filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun abonnement trouvé</p>}
        {filtered.map(sub => (
          <div key={sub.id} className="flex items-center gap-3 px-4 py-3.5">
            {/* Avatar */}
            {sub.clients?.photo_url ? (
              <img src={sub.clients.photo_url} alt="" className="h-11 w-11 rounded-full object-cover shrink-0" />
            ) : (
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                {sub.clients?.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{sub.clients?.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground capitalize">{sub.type}</span>
                <span className="text-muted-foreground/30">·</span>
                {daysLeft(sub.end_date)}
              </div>
            </div>

            {/* Status */}
            <div className="shrink-0">{statusBadge(sub.status)}</div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => setDetailSub(sub)} className="h-9 w-9">
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setRenewSub(sub); setRenewDuration(1); }}
                className="h-9 w-9 text-primary hover:text-primary"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailSub} onOpenChange={() => setDetailSub(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Détails de l'abonnement</DialogTitle>
          </DialogHeader>
          {detailSub && (
            <div className="space-y-4">
              {/* Client info */}
              <div className="flex items-center gap-3">
                {detailSub.clients?.photo_url ? (
                  <img src={detailSub.clients.photo_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {detailSub.clients?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-base">{detailSub.clients?.name}</p>
                  <p className="text-sm text-muted-foreground">{detailSub.clients?.phone || 'Pas de téléphone'}</p>
                </div>
                <div className="ml-auto">{statusBadge(detailSub.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" />Type</p>
                  <p className="font-semibold text-sm mt-1 capitalize">{detailSub.type}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Durée</p>
                  <p className="font-semibold text-sm mt-1">{daysLeft(detailSub.end_date)}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Début</p>
                  <p className="font-semibold text-sm mt-1">{format(new Date(detailSub.start_date), 'dd MMM yyyy', { locale: fr })}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Fin</p>
                  <p className="font-semibold text-sm mt-1">{format(new Date(detailSub.end_date), 'dd MMM yyyy', { locale: fr })}</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Créé le</p>
                <p className="font-semibold text-sm mt-1">{format(new Date(detailSub.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailSub(null)}>Fermer</Button>
            <Button onClick={() => { setRenewSub(detailSub); setRenewDuration(1); setDetailSub(null); }}>
              <RefreshCw className="h-4 w-4 mr-1" /> Renouveler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renew Dialog */}
      <Dialog open={!!renewSub} onOpenChange={() => setRenewSub(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Renouveler l'abonnement</DialogTitle>
          </DialogHeader>
          {renewSub && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Client : <span className="font-semibold text-foreground">{renewSub.clients?.name}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Expire le : <span className="font-semibold text-foreground">{format(new Date(renewSub.end_date), 'dd MMM yyyy', { locale: fr })}</span>
              </p>
              <div>
                <p className="text-sm font-medium mb-2">Durée de renouvellement</p>
                <div className="grid grid-cols-2 gap-2">
                  {RENEWAL_DURATIONS.map(d => (
                    <button
                      key={d.months}
                      onClick={() => setRenewDuration(d.months)}
                      className={`rounded-xl p-3 text-sm font-semibold border transition-all ${
                        renewDuration === d.months
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border hover:border-primary/40'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Nouvelle date de fin</p>
                <p className="font-bold text-sm mt-1">
                  {format(
                    addMonths(
                      new Date(renewSub.end_date) > new Date() ? new Date(renewSub.end_date) : new Date(),
                      renewDuration
                    ),
                    'dd MMM yyyy',
                    { locale: fr }
                  )}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewSub(null)}>Annuler</Button>
            <Button onClick={handleRenew} disabled={renewing}>
              {renewing ? 'Renouvellement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsPage;
