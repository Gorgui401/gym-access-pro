import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import gymBg from '@/assets/gym-auth-bg.jpg';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(var(--auth-bg))' }}>
      {/* Left: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-3xl m-4">
        <img src={gymBg} alt="Salle de sport" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-10 text-white">
          <h2 className="text-3xl font-bold font-display leading-tight mb-2">
            Gérez votre salle de sport,<br />simplement et efficacement.
          </h2>
          <p className="text-sm text-white/60 font-body">
            GymFlow — Votre plateforme de gestion fitness.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 lg:px-16">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-display text-white">GymFlow</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white">Connexion</h1>
            <p className="text-sm" style={{ color: 'hsl(var(--auth-muted))' }}>
              Accédez à votre espace de gestion.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border border-white/10 bg-transparent text-white placeholder:text-white/30 focus-visible:ring-primary"
                style={{ background: 'hsl(var(--auth-input))' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white text-sm">Mot de passe *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl border border-white/10 bg-transparent text-white placeholder:text-white/30 pr-12 focus-visible:ring-primary"
                  style={{ background: 'hsl(var(--auth-input))' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/30"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <p className="text-center text-sm" style={{ color: 'hsl(var(--auth-muted))' }}>
            Pas encore de compte ?{' '}
            <button type="button" onClick={() => navigate('/register')} className="text-primary font-semibold hover:underline">
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
