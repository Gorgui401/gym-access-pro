import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { ArrowLeft, Camera, Check, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const SUBSCRIPTION_TYPES = [
  { value: 'mensuel', label: 'Mensuel', days: 30 },
  { value: 'trimestriel', label: 'Trimestriel', days: 90 },
  { value: 'annuel', label: 'Annuel', days: 365 },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: '💵 Cash' },
  { value: 'wave', label: '🟦 Wave' },
  { value: 'orange_money', label: '🟧 Orange Money' },
];

const AddClientPage = () => {
  const { gymId } = useAuth();
  const navigate = useNavigate();

  // Client info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscription
  const [subType, setSubType] = useState('mensuel');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // State
  const [loading, setLoading] = useState(false);
  const [createdQrCode, setCreatedQrCode] = useState<string | null>(null);
  const [createdClientName, setCreatedClientName] = useState('');

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) { toast.error('Salle non trouvée'); return; }
    if (!photoFile) { toast.error('La photo est obligatoire'); return; }
    if (!amount || Number(amount) <= 0) { toast.error('Montant invalide'); return; }

    setLoading(true);
    try {
      // 1. Upload photo
      const ext = photoFile.name.split('.').pop();
      const photoPath = `${gymId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('client-photos')
        .upload(photoPath, photoFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('client-photos')
        .getPublicUrl(photoPath);

      // 2. Create client
      const qrCode = crypto.randomUUID();
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          name,
          phone,
          address,
          gym_id: gymId,
          qr_code: qrCode,
          photo_url: urlData.publicUrl,
        })
        .select('id')
        .single();
      if (clientError) throw clientError;

      // 3. Create subscription
      const subConfig = SUBSCRIPTION_TYPES.find(s => s.value === subType)!;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + subConfig.days);

      const { error: subError } = await supabase.from('subscriptions').insert({
        client_id: client.id,
        type: subType,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'actif',
      });
      if (subError) throw subError;

      // 4. Register payment
      const { error: payError } = await supabase.from('payments').insert({
        client_id: client.id,
        amount: Number(amount),
        method: paymentMethod,
      });
      if (payError) throw payError;

      // 5. Show QR code
      setCreatedQrCode(qrCode);
      setCreatedClientName(name);
      toast.success('Client ajouté avec succès !');
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  // Success screen with QR code
  if (createdQrCode) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 animate-slide-up py-8">
        <div className="rounded-full bg-green-100 p-4">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold font-display text-center">Client ajouté !</h1>
        <p className="text-muted-foreground text-center">{createdClientName}</p>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <QRCodeSVG value={createdQrCode} size={200} />
        </div>
        <p className="text-sm text-muted-foreground">QR Code d'accès à la salle</p>

        <div className="flex gap-3 w-full max-w-xs">
          <Button
            variant="touch-outline"
            className="flex-1"
            onClick={() => {
              setCreatedQrCode(null);
              setCreatedClientName('');
              setName('');
              setPhone('');
              setAddress('');
              setPhotoFile(null);
              setPhotoPreview(null);
              setAmount('');
              setSubType('mensuel');
              setPaymentMethod('cash');
            }}
          >
            Nouveau client
          </Button>
          <Button variant="touch" className="flex-1" onClick={() => navigate('/clients')}>
            Liste clients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold font-display">Nouveau client</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo */}
        <div className="flex flex-col items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-28 h-28 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden bg-muted hover:border-primary transition-colors"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
            ) : (
              <Camera className="h-8 w-8 text-muted-foreground" />
            )}
          </button>
          <span className="text-xs text-muted-foreground">Photo obligatoire *</span>
        </div>

        {/* Client info */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nom complet *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Mamadou Diallo" required className="h-12" />
          </div>
          <div className="space-y-1.5">
            <Label>Téléphone *</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+221 77 000 00 00" required className="h-12" />
          </div>
          <div className="space-y-1.5">
            <Label>Adresse</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Dakar, Sénégal" className="h-12" />
          </div>
        </div>

        {/* Subscription type */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Abonnement</Label>
          <RadioGroup value={subType} onValueChange={setSubType} className="grid grid-cols-3 gap-2">
            {SUBSCRIPTION_TYPES.map(t => (
              <Label
                key={t.value}
                htmlFor={t.value}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  subType === t.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <RadioGroupItem value={t.value} id={t.value} className="sr-only" />
                <span className="font-semibold text-sm">{t.label}</span>
                <span className="text-xs text-muted-foreground">{t.days} jours</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label>Montant (FCFA) *</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="15000"
            required
            className="h-12 text-lg font-semibold"
          />
        </div>

        {/* Payment method */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Paiement</Label>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map(m => (
              <Label
                key={m.value}
                htmlFor={m.value}
                className={`flex items-center justify-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm ${
                  paymentMethod === m.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <RadioGroupItem value={m.value} id={m.value} className="sr-only" />
                {m.label}
              </Label>
            ))}
          </RadioGroup>
        </div>

        <Button type="submit" variant="touch" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Ajout en cours...' : 'Ajouter le client'}
        </Button>
      </form>
    </div>
  );
};

export default AddClientPage;
