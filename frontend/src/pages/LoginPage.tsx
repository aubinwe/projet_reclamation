import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole, ROLE_LABELS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, ArrowRight, Mail, Lock, UserCircle, Shield, BookOpen, ClipboardCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ROLE_ICONS: Record<UserRole, any> = {
  student: User,
  teacher: BookOpen,
  registrar: ClipboardCheck,
  admin: Shield,
};

const ROLE_HINTS: Record<UserRole, string> = {
  student: "votre.nom@ibam.edu",
  teacher: "nom.professeur@ibam.edu",
  registrar: "service.scolarite@ibam.edu",
  admin: "admin@ibam.edu",
};

const ROLE_OPTIONS: { role: UserRole }[] = [
  { role: 'student' },
  { role: 'registrar' },
  { role: 'teacher' },
  { role: 'admin' },
];

export default function LoginPage() {
  // Gestion de l'état du formulaire et du rôle sélectionné
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Tentative de connexion avec le rôle sélectionné
      await login(email, password, selectedRole);
      toast.success(`Bienvenue, ${ROLE_LABELS[selectedRole]}`);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error("Identifiants incorrects ou rôle invalide");
    } finally {
      setIsLoading(false);
    }
  };

  const RoleIcon = ROLE_ICONS[selectedRole];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">

      {/* Login Form */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border-2 border-accent">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold">IBAM</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Connexion</h2>
          <p className="text-muted-foreground">
            Accédez à votre espace sécurisé
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="space-y-2">
            <Label htmlFor="role" className="text-foreground font-medium">Votre Profil</Label>
            <div className="relative group">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10 group-focus-within:text-accent transition-colors" />
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)} required>
                <SelectTrigger className="pl-10 h-12 bg-card border-border shadow-sm">
                  <SelectValue placeholder="Sélectionnez votre profil" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.role} value={option.role}>
                      {ROLE_LABELS[option.role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder={ROLE_HINTS[selectedRole]}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-card border-border transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-foreground font-medium">Mot de passe</Label>
              <Link to="/forgot-password" className="text-xs text-accent hover:underline">Oublié ?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-card border-border transition-all"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-accent hover:opacity-90 text-accent-foreground font-bold shadow-lg shadow-accent/20 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authentification...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Se connecter en tant que {ROLE_LABELS[selectedRole]}
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-8 space-y-4 animate-in fade-in duration-1000">
          <p>
            Nouveau à l'IBAM ?{' '}
            <Link to="/register" className="text-accent hover:underline font-bold">
              Créer un compte
            </Link>
          </p>
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs">
              Besoin d'aide ? <Link to="/faq" className="text-accent hover:underline">FAQ</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
