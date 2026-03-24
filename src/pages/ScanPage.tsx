import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { QrCode, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { clientService } from '@/services/clientService';
import { subscriptionService } from '@/services/subscriptionService';
import { checkinService } from '@/services/checkinService';

type ScanResult = {
  client: any;
  subscription: any;
  authorized: boolean;
} | null;

const ScanPage = () => {
  const { gymId } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleScan = useCallback(async (qrCode: string) => {
    if (!gymId) return;
    try {
      const client = await clientService.getByQrCode(qrCode, gymId);
      const sub = await subscriptionService.getActiveByClientId(client.id);
      const authorized = !!sub;
      if (authorized) await checkinService.create({ client_id: client.id, gym_id: gymId });
      setResult({ client, subscription: sub, authorized });
    } catch {
      setResult({ client: null, subscription: null, authorized: false });
      toast.error('Client non trouvé');
    }
  }, [gymId]);

  const startCamera = async () => {
    setScanning(true); setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      toast.error('Impossible d\'accéder à la caméra'); setScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setScanning(false);
  };

  const handleManualScan = () => { if (manualCode.trim()) { handleScan(manualCode.trim()); setManualCode(''); } };

  useEffect(() => { return () => stopCamera(); }, []);

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold font-display">Scanner QR Code</h1>
      {!scanning && !result && (
        <div className="text-center space-y-6 py-8">
          <div className="mx-auto h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center"><QrCode className="h-12 w-12 text-primary" /></div>
          <p className="text-muted-foreground">Scannez le QR code du client pour vérifier son accès</p>
          <Button variant="touch" size="xl" onClick={startCamera} className="w-full">Ouvrir le scanner</Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">ou saisir le code</span></div>
          </div>
          <div className="flex gap-2">
            <input value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Code QR..." className="flex-1 h-12 rounded-xl border bg-card px-4 text-sm" />
            <Button variant="touch" size="lg" onClick={handleManualScan}>Vérifier</Button>
          </div>
        </div>
      )}
      {scanning && (
        <div className="space-y-4">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl aspect-square object-cover" />
          <Button variant="touch-outline" className="w-full" size="lg" onClick={stopCamera}>Arrêter le scan</Button>
        </div>
      )}
      {result && (
        <div className={`text-center p-8 rounded-2xl border-2 space-y-4 ${result.authorized ? 'border-primary bg-primary/5' : 'border-destructive bg-destructive/5'}`}>
          {result.authorized ? (
            <><CheckCircle2 className="h-16 w-16 text-primary mx-auto animate-pulse-success" /><h2 className="text-xl font-bold font-display">Accès autorisé ✅</h2></>
          ) : (
            <><XCircle className="h-16 w-16 text-destructive mx-auto" /><h2 className="text-xl font-bold font-display">{result.client ? 'Abonnement expiré ❌' : 'Client non trouvé ❌'}</h2></>
          )}
          {result.client && (
            <div className="space-y-1">
              <p className="text-lg font-semibold">{result.client.name}</p>
              <p className="text-sm text-muted-foreground">{result.client.phone}</p>
              {result.subscription && <p className="text-sm text-muted-foreground">Expire le {new Date(result.subscription.end_date).toLocaleDateString('fr-FR')}</p>}
            </div>
          )}
          <Button variant="touch" size="lg" className="w-full" onClick={() => setResult(null)}>Nouveau scan</Button>
        </div>
      )}
    </div>
  );
};

export default ScanPage;
