import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole, ROLE_LABELS, Filiere } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, BookOpen, ClipboardCheck, Shield, ArrowRight, Mail, Lock, UserCircle, Book, Info, GraduationCap as LevelIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/axios';

const ROLE_DETAILS: Record<UserRole, { icon: any; description: string; placeholder: string; emailHint: string }> = {
    student: {
        icon: GraduationCap,
        description: "Accédez à vos notes et soumettez vos réclamations en quelques clics.",
        placeholder: "ex: Abdoul Traoré",
        emailHint: "votre.nom@ibam.edu"
    },
    teacher: {
        icon: BookOpen,
        description: "Gérez vos matières, consultez les réclamations et validez les corrections.",
        placeholder: "Pr. Nom Prénom",
        emailHint: "nom.professeur@ibam.edu"
    },
    registrar: {
        icon: ClipboardCheck,
        description: "Vérifiez la conformité des demandes et gérez le flux administratif.",
        placeholder: "ex: Marie Sawadogo",
        emailHint: "service.scolarite@ibam.edu"
    },
    admin: {
        icon: Shield,
        description: "Superviser l'ensemble du système et gérer les utilisateurs.",
        placeholder: "ex: Administrateur Système",
        emailHint: "admin@ibam.edu"
    }
};

const ROLE_OPTIONS: { role: UserRole }[] = [
    { role: 'student' },
    { role: 'registrar' },
    { role: 'teacher' },
    { role: 'admin' },
];

export default function RegisterPage() {
    // États pour les champs du formulaire
    const [selectedRole, setSelectedRole] = useState<UserRole>('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Séparation Filière et Niveau pour l'UI
    const [selectedFiliereName, setSelectedFiliereName] = useState<string>('');
    const [selectedNiveau, setSelectedNiveau] = useState<string>('');

    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [availableFiliereNames, setAvailableFiliereNames] = useState<string[]>([]);
    const [availableNiveaux, setAvailableNiveaux] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const filieresRes = await api.get('/filieres');
                const data: Filiere[] = filieresRes.data;
                setFilieres(data);

                // Extraction des noms uniques et niveaux uniques
                const getFiliereName = (f: any) => f.name || f.nom || '';
                const names = Array.from(new Set(
                    data.map(getFiliereName).filter(Boolean).map(n => n.trim())
                )).sort();

                const levels = Array.from(new Set(
                    data.map(f => f.niveau).filter(Boolean).map(l => l.trim())
                )).sort();

                setAvailableFiliereNames(names);
                setAvailableNiveaux(levels);
            } catch (error) {
                console.error('Failed to fetch data:', error);

                // Données de secours complètes
                const mockFNames = [
                    'Informatique',
                    'Comptabilité Contrôle Audit',
                    'Assistanat de Direction',
                    'Marketing et Innovation Digital',
                    'Assurance Banque Finance'
                ];
                const mockLevels = ['Licence 1', 'Licence 2', 'Licence 3'];

                const mockFilieres: Filiere[] = [];
                let idCounter = 1;
                mockFNames.forEach(name => {
                    mockLevels.forEach(level => {
                        mockFilieres.push({
                            id: (idCounter++).toString(),
                            name: name,
                            nom: name,
                            niveau: level
                        });
                    });
                });

                setFilieres(mockFilieres);
                setAvailableFiliereNames(mockFNames);
                setAvailableNiveaux(mockLevels);
            }
        };
        fetchData();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validation des mots de passe
        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        let filiereId: number | undefined;
        if (selectedRole === 'student') {
            if (!selectedFiliereName || !selectedNiveau) {
                toast.error("Veuillez sélectionner votre filière et votre niveau");
                return;
            }

            const matchingFiliere = filieres.find(f =>
                (f.name?.trim() === selectedFiliereName.trim() || f.nom?.trim() === selectedFiliereName.trim()) &&
                f.niveau?.trim() === selectedNiveau.trim()
            );

            if (!matchingFiliere) {
                toast.error("Combinaison filière/niveau introuvable");
                return;
            }
            filiereId = typeof matchingFiliere.id === 'string' ? parseInt(matchingFiliere.id) : matchingFiliere.id;
        }

        setIsLoading(true);
        try {
            await register(email, password, name, selectedRole, filiereId);
            toast.success("Compte créé avec succès !");
            navigate('/dashboard');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Erreur lors de la création du compte";
            if (error.response?.data?.errors) {
                const validationErrors = Object.values(error.response.data.errors).flat().join(", ");
                toast.error(validationErrors);
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const details = ROLE_DETAILS[selectedRole];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            {/* Register Form */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 my-8 overflow-y-auto max-h-[95vh] border-2 border-accent">
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-3xl font-bold text-foreground mb-2">Inscription</h2>
                    <p className="text-muted-foreground">Créez votre accès IBAM</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {/* Profile Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-foreground text-sm font-semibold">Quel est votre profil ?</Label>
                        <div className="relative">
                            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)} required>
                                <SelectTrigger className="pl-10 h-12 bg-card border-border shadow-sm focus:ring-accent transition-all">
                                    <SelectValue placeholder="Sélectionnez votre profil" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLE_OPTIONS.map((option) => (
                                        <SelectItem key={option.role} value={option.role} className="cursor-pointer">
                                            <span className="flex items-center gap-2">
                                                {ROLE_LABELS[option.role]}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Adaptive Info Section */}
                    <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 flex gap-3 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                            <details.icon className="w-5 h-5 text-accent" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-accent uppercase tracking-wider">Profil {ROLE_LABELS[selectedRole]}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{details.description}</p>
                        </div>
                    </div>

                    {/* Common Fields */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground text-sm font-medium">Nom complet</Label>
                        <div className="relative group">
                            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                            <Input
                                id="name"
                                type="text"
                                placeholder={details.placeholder}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-10 h-11 bg-card border-border transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground text-sm font-medium">Adresse Email Professionnelle</Label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                            <Input
                                id="email"
                                type="email"
                                placeholder={details.emailHint}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-11 bg-card border-border transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Student Specific Fields */}
                    {selectedRole === 'student' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="space-y-2">
                                <Label htmlFor="filiere" className="text-foreground text-sm font-medium">Filière</Label>
                                <div className="relative group">
                                    <Book className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 group-focus-within:text-accent" />
                                    <Select value={selectedFiliereName} onValueChange={setSelectedFiliereName} required>
                                        <SelectTrigger className="pl-10 h-11 bg-card border-border shadow-sm">
                                            <SelectValue placeholder="Filière..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableFiliereNames.map((name) => (
                                                <SelectItem key={name} value={name}>
                                                    {name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="niveau" className="text-foreground text-sm font-medium">Niveau</Label>
                                <div className="relative group">
                                    <LevelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 group-focus-within:text-accent" />
                                    <Select value={selectedNiveau} onValueChange={setSelectedNiveau} required>
                                        <SelectTrigger className="pl-10 h-11 bg-card border-border shadow-sm">
                                            <SelectValue placeholder="Niveau..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableNiveaux.map((level) => (
                                                <SelectItem key={level} value={level}>
                                                    {level}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Passwords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground text-sm font-medium">Mot de passe</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-11 bg-card border-border"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-foreground text-sm font-medium">Confirmation</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 h-11 bg-card border-border"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded-lg border border-dashed flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-accent" />
                        Mot de passe : 8 caractères minimum.
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-accent hover:opacity-90 text-accent-foreground font-bold shadow-lg shadow-accent/20 mt-4 transition-all active:scale-95"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Création du compte...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2 w-full">
                                S'inscrire ({ROLE_LABELS[selectedRole]})
                                <ArrowRight className="w-5 h-5 animate-pulse" />
                            </span>
                        )}
                    </Button>
                </form>

                <div className="text-center mt-8 pb-4 animate-in fade-in duration-1000">
                    <p className="text-sm text-muted-foreground">
                        Déjà membre ?{' '}
                        <Link to="/" className="text-accent hover:underline font-semibold transition-colors">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
