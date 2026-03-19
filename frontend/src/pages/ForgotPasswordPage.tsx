import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSubmitted(true);
                toast.success(data.message);
            } else {
                // Afficher le message d'erreur spécifique du backend (ex: SMTP error)
                toast.error(data.message || "Une erreur est survenue", {
                    description: data.detail || undefined,
                    duration: 5000
                });
            }
        } catch (error) {
            toast.error("Impossible de contacter le serveur");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-accent mb-4 shadow-glow">
                        <GraduationCap className="w-10 h-10 text-accent-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Récupération</h1>
                    <p className="text-muted-foreground mt-2">Institut Burkinabé des Arts et Métiers</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                    {!isSubmitted ? (
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-foreground mb-2">Mot de passe oublié ?</h2>
                                <p className="text-sm text-muted-foreground">
                                    Entrez votre adresse email et nous vous enverrons des instructions pour réinitialiser votre mot de passe.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email professionnel / étudiant</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="votre.nom@ibam.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
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
                                    {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-status-success-bg rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-status-success" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">Email envoyé !</h2>
                            <p className="text-muted-foreground mb-8">
                                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
                                Veuillez vérifier votre boîte de réception ainsi que vos spams.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Renvoyer l'email
                            </Button>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-border">
                        <Link to="/" className="flex items-center justify-center gap-2 text-sm text-accent hover:underline font-medium">
                            <ArrowLeft className="w-4 h-4" />
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
