import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            toast.error("Lien de réinitialisation invalide ou expiré");
            navigate('/');
        }
    }, [token, email, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                toast.success("Votre mot de passe a été réinitialisé !");
                setTimeout(() => navigate('/'), 3000);
            } else {
                toast.error(data.message || "Erreur lors de la réinitialisation");
            }
        } catch (error) {
            toast.error("Erreur de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
                    <div className="w-16 h-16 bg-status-success-bg rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-status-success" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Mot de passe modifié !</h2>
                    <p className="text-muted-foreground mb-8">
                        Votre mot de passe a été mis à jour avec succès.
                        Redirection vers la page de connexion...
                    </p>
                    <Link to="/">
                        <Button className="w-full bg-gradient-accent">Se connecter maintenant</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-accent mb-4 shadow-glow">
                        <GraduationCap className="w-10 h-10 text-accent-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">IBAM</h1>
                    <p className="text-muted-foreground mt-2">Nouveau mot de passe</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nouveau mot de passe</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-12"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className="pl-10 h-12"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-gradient-accent text-accent-foreground font-bold"
                        >
                            {isLoading ? "Modification..." : "Réinitialiser le mot de passe"}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border">
                        <Link to="/" className="flex items-center justify-center gap-2 text-sm text-accent hover:underline font-medium">
                            <ArrowLeft className="w-4 h-4" />
                            Annuler
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
