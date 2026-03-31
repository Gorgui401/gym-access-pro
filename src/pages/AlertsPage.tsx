import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { subscriptionService } from '@/services/subscriptionService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

const RENEWAL_DURATIONS = [
  { label: '1 mois', months: 1 },
  { label: '3 mois', months: 3 },
  { label: '6 mois', months: 6 },
  { label: '12 mois', months: 12 },
];

const AlertsPage = () => {
  const { gymId } = useAuth();
  const [expiredClients, setExpiredClients] = useState<any[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Renew dialog
  const [renewSub, setRenewSub] = useState<any | null>(null);
  const [renewDuration, setRenewDuration] = useState(1);
  const [renewing, setRenewing] = useState(false);

  const fetchAlerts = async () => {
    if (!gymId) return;
    setLoading(true);
    const [expired, soon] = await Promise.all([
      subscriptionService.getExpired(gymId),
      subscriptionService.getExpiringSoon(gymId),
    ]);
    setExpiredClients(expired);
    setExpiringSoon(soon);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, [gymId]);

  const handleRenew = async () => {
    if (!renewSub) return;
    setRenewing(true);
    const baseDate = new Date(renewSub.end_date) > new Date() ? new Date(renewSub.end_date) : new Date();
    const newEnd = format(addMonths(baseDate, renewDuration), 'yyyy-MM-dd');
    await subscriptionService.renew(renewSub.id, newEnd);
    setRenewing(false);
    setRenewSub(null);
    fetchAlerts();
  };

  const daysLeft = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Expiré depuis ${Math.abs(diff)}j`;
    if (diff === 0) return "Expire aujourd'hui";
    return `${diff}j restants`;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight">Alertes & Relances</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Abonnements nécessitant une action</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4 bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-600">Expirent bientôt</span>
          </div>
          <p className="text-3xl font-bold font-display text-amber-600">{expiringSoon.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Dans les 7 prochains jours</p>
        </div>
        <div className="rounded-xl p-4 bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">Expirés</span>
          </div>
          <p className="text-3xl font-bold font-display text-destructive">{expiredClients.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Clients à relancer</p>
        </div>
      </div>

      {loading && <p className="text-center text-muted-foreground py-8">Chargement...</p>}

      {/* Expiring Soon */}
      {!loading && expiringSoon.length > 0 && (
        <div>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" /> Expirent dans 7 jours
          </h2>
          <div className="bg-card rounded-2xl shadow-sm overflow-hidden divide-y divide-border/50">
            {expiringSoon.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{sub.clients?.name}</p>
                  <p className="text-xs text-muted-foreground">{sub.clients?.phone || 'Pas de téléphone'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge className="bg-amber-500/15 text-amber-600 border-0 font-semibold text-xs">
                      {daysLeft(sub.end_date)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(sub.end_date), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setRenewSub(sub); setRenewDuration(1); }}
                    className="shrink-0"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Renouveler
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expired */}
      {!loading && expiredClients.length > 0 && (
        <div>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Abonnements expirés
          </h2>
          <div className="bg-card rounded-2xl shadow-sm overflow-hidden divide-y divide-border/50">
            {expiredClients.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{sub.clients?.name}</p>
                  <p className="text-xs text-muted-foreground">{sub.clients?.phone || 'Pas de téléphone'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge className="bg-destructive/15 text-destructive border-0 font-semibold text-xs">Expiré</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(sub.end_date), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setRenewSub(sub); setRenewDuration(1); }}
                    className="shrink-0"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Renouveler
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && expiringSoon.length === 0 && expiredClients.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune alerte 🎉</p>
          <p className="text-xs text-muted-foreground mt-1">Tous les abonnements sont à jour</p>
        </div>
      )}

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

export default AlertsPage;
