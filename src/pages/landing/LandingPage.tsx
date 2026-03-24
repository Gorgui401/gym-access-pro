import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="text-center space-y-6 max-w-lg">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Dumbbell className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-extrabold font-display tracking-tight">GymFlow</h1>
        <p className="text-muted-foreground text-lg">La solution complète pour gérer votre salle de sport</p>
        <div className="flex gap-3 justify-center">
          <Button variant="touch" size="lg" asChild>
            <Link to="/login">Se connecter</Link>
          </Button>
          <Button variant="touch-outline" size="lg" asChild>
            <Link to="/register">S'inscrire</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
