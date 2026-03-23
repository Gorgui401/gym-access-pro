import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, { name });
        toast.success('Compte créé ! Vérifiez votre email pour confirmer.');
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Dumbbell className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight">GymFlow</h1>
          <p className="text-muted-foreground text-sm">Gérez votre salle de sport simplement</p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 rounded-xl border-0 bg-muted"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-0 bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 rounded-xl border-0 bg-muted"
              />
            </div>
            <Button type="submit" variant="touch" className="w-full shadow-md shadow-primary/20" size="lg" disabled={isLoading}>
              {isLoading ? (isSignUp ? 'Création...' : 'Connexion...') : (isSignUp ? 'Créer un compte' : 'Se connecter')}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? 'Déjà un compte ?' : "Pas encore de compte ?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-accent font-semibold hover:underline"
          >
            {isSignUp ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
