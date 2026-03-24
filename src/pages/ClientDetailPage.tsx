import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, MapPin, Calendar } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { clientService } from '@/services/clientService';
import { subscriptionService } from '@/services/subscriptionService';

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [c, subs] = await Promise.all([
        clientService.getById(id),
        subscriptionService.getByClientId(id),
      ]);
      setClient(c);
      setSubscriptions(subs);
    };
    fetch();
  }, [id]);

  if (!client) return <p className="text-center py-8 text-muted-foreground">Chargement...</p>;

  const activeSub = subscriptions.find(s => s.status === 'actif');

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold font-display">Fiche client</h1>
      </div>

      <div className="text-center space-y-3">
        <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold font-display">
          {client.name?.[0]?.toUpperCase()}
        </div>
        <h2 className="text-xl font-bold font-display">{client.name}</h2>
        <div className={activeSub ? 'status-active' : 'status-expired'}>
          {activeSub ? '✅ Abonnement actif' : '❌ Pas d\'abonnement actif'}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl border bg-card">
          <Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{client.phone}</span>
        </div>
        {client.address && (
          <div className="flex items-center gap-3 p-3 rounded-xl border bg-card">
            <MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{client.address}</span>
          </div>
        )}
      </div>

      {client.qr_code && (
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl border bg-card">
          <p className="text-sm font-medium text-muted-foreground">QR Code d'accès</p>
          <QRCodeSVG value={client.qr_code} size={180} />
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold font-display mb-3">Historique abonnements</h3>
        {subscriptions.length === 0 && <p className="text-sm text-muted-foreground">Aucun abonnement</p>}
        {subscriptions.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl border bg-card mb-2">
            <div>
              <p className="text-sm font-medium capitalize">{sub.type}</p>
              <p className="text-xs text-muted-foreground">
                <Calendar className="inline h-3 w-3 mr-1" />
                {new Date(sub.start_date).toLocaleDateString('fr-FR')} → {new Date(sub.end_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <span className={sub.status === 'actif' ? 'status-active' : 'status-expired'}>{sub.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientDetailPage;
