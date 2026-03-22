import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const AddClientPage = () => {
  const { gymId } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) { toast.error('Salle non trouvée'); return; }
    setLoading(true);

    const qrCode = crypto.randomUUID();

    const { error } = await supabase.from('clients').insert({
      name,
      phone,
      address,
      gym_id: gymId,
      qr_code: qrCode,
    });

    if (error) {
      toast.error('Erreur lors de l\'ajout du client');
    } else {
      toast.success('Client ajouté avec succès !');
      navigate('/clients');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold font-display">Nouveau client</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Nom complet</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mamadou Diallo" required className="h-12" />
        </div>
        <div className="space-y-2">
          <Label>Téléphone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 000 00 00" required className="h-12" />
        </div>
        <div className="space-y-2">
          <Label>Adresse</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dakar, Sénégal" className="h-12" />
        </div>
        <Button type="submit" variant="touch" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Ajout en cours...' : 'Ajouter le client'}
        </Button>
      </form>
    </div>
  );
};

export default AddClientPage;
