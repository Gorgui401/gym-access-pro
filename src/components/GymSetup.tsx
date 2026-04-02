import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gymService } from '@/services/gymService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Link2, Plus, Dumbbell, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GymSetupProps {
  onComplete: () => void;
}

const GymSetup = ({ onComplete }: GymSetupProps) => {
  const { user } = useAuth();
  const [tab, setTab] = useState('create');

  // Create form
  const [gymName, setGymName] = useState('');
  const [gymAddress, setGymAddress] = useState('');
  const [gymPhone, setGymPhone] = useState('');
  const [creating, setCreating] = useState(false);

  // Join form
  const [gymCode, setGymCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !gymName.trim()) return;

    setCreating(true);
    try {
      const gym = await gymService.create({
        name: gymName.trim(),
        address: gymAddress.trim() || undefined,
        phone: gymPhone.trim() || undefined,
      });
      await gymService.linkProfileToGym(user.id, gym.id);
      toast.success('Salle créée avec succès !');
      onComplete();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !gymCode.trim()) return;

    setJoining(true);
    try {
      const gym = await gymService.findByCode(gymCode.trim());
      if (!gym) {
        toast.error('Aucune salle trouvée avec cet identifiant');
        return;
      }
      await gymService.linkProfileToGym(user.id, gym.id);
      toast.success(`Vous avez rejoint "${gym.name}" !`);
      onComplete();
    } catch (err: any) {
      toast.error(err.message || 'Salle introuvable');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-slide-up">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold font-display tracking-tight">
            Bienvenue sur GymFlow
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Pour commencer à gérer vos clients, vous devez d'abord configurer votre salle de sport.
          </p>
        </div>

        {/* Alert */}
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            Aucune salle n'est associée à votre compte. Créez-en une ou rejoignez une salle existante pour continuer.
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Card>
          <Tabs value={tab} onValueChange={setTab}>
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer une salle
                </TabsTrigger>
                <TabsTrigger value="join" className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Rejoindre
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="create">
              <form onSubmit={handleCreate}>
                <CardContent className="space-y-4">
                  <CardDescription>
                    Créez votre salle et commencez à ajouter des clients immédiatement.
                  </CardDescription>
                  <div className="space-y-1.5">
                    <Label>Nom de la salle *</Label>
                    <Input
                      value={gymName}
                      onChange={(e) => setGymName(e.target.value)}
                      placeholder="Ex: Fitness Club Dakar"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Adresse</Label>
                    <Input
                      value={gymAddress}
                      onChange={(e) => setGymAddress(e.target.value)}
                      placeholder="Ex: Almadies, Dakar"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Téléphone</Label>
                    <Input
                      value={gymPhone}
                      onChange={(e) => setGymPhone(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className="h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4" />
                        Créer ma salle
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>

            <TabsContent value="join">
              <form onSubmit={handleJoin}>
                <CardContent className="space-y-4">
                  <CardDescription>
                    Entrez l'identifiant de la salle fourni par l'administrateur pour la rejoindre.
                  </CardDescription>
                  <div className="space-y-1.5">
                    <Label>Identifiant de la salle *</Label>
                    <Input
                      value={gymCode}
                      onChange={(e) => setGymCode(e.target.value)}
                      placeholder="Ex: a1b2c3d4-..."
                      required
                      className="h-12 font-mono text-sm"
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={joining}>
                    {joining ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Recherche...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" />
                        Rejoindre la salle
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default GymSetup;
