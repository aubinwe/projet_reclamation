import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users } from 'lucide-react';
import api from '@/lib/axios';

// Interface pour les matières
interface Matiere {
    id: number;
    name: string;
    filiere?: {
        id: number;
        name: string;
        niveau: string;
    };
}

export default function TeacherNotes() {
    const { user } = useAuth();
    const [matieres, setMatieres] = useState<Matiere[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pour l'instant on va essayer de récupérer via l'API. 
    // Comme on n'a pas fait d'endpoint "mes-matieres" dédié pur, on peut filtrer /matieres 
    // ou utiliser l'astuce du dashboard (filtrer les claims) -> mais ce n'est pas fiable si pas de claim.
    // Mieux: on a créé 'teachers' endpoint dans api.php ? Non, c'était 'TeacherController'.
    // Regardons NoteController::index pour enseignant : "retourne les notes de ses matières".
    // Idéalement on devrait avoir un endpoint GET /matieres/mine.
    // MAIS: dans l'app actuelle, comment l'enseignant voit ses matières ?
    // Dans le dashboard, on a fait "assignedClaims.map ...". Ce n'est pas bon.
    // On va utiliser l'api /matieres et filtrer coté front temporairement ou créer un endpoint.
    // Pour faire vite et bien: ajoutons `iframe` ou `filter` si l'API le permet.
    // ACTUALLY: api.php a `Route::apiResource('matieres', MatiereController::class);`
    // Allons voir MatiereController.

    useEffect(() => {
        const fetchMatieres = async () => {
            try {
                // Option 1: On fetch toutes les matieres et on filtre par user.id (enseignant_id)
                // Ce n'est pas sécurisé ni performant mais suffisant pour le prototype si peu de données.
                const response = await api.get('/matieres');
                const allMatieres = response.data; // Supposons que c'est un tableau

                // Filtrer - IMPORTANT: convertir user.id en number car enseignant_id est un number
                const userId = Number(user?.id);
                const myMatieres = allMatieres.filter((m: any) => {
                    return m.enseignant_id === userId;
                });

                setMatieres(myMatieres);
            } catch (error) {
                console.error('Failed to fetch subjects', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchMatieres();
        }
    }, [user]);

    return (
        <DashboardLayout>
            <div className="animate-fade-in max-w-5xl mx-auto">
                <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour au tableau de bord
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des Notes</h1>
                    <p className="text-muted-foreground">Sélectionnez une matière pour saisir ou consulter les notes des étudiants.</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">Chargement...</div>
                ) : matieres.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-8 text-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">Aucune matière assignée</h3>
                        <p className="text-muted-foreground">Vous n'avez pas encore de matière assignée pour ce semestre.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matieres.map((matiere) => (
                            <Link key={matiere.id} to={`/teacher/notes/${matiere.id}`}>
                                <div className="group bg-card hover:bg-muted/50 border border-border rounded-xl p-6 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                            <BookOpen className="w-5 h-5 text-accent" />
                                        </div>
                                        <span className="text-xs font-medium bg-muted px-2 py-1 rounded text-muted-foreground">
                                            {matiere.filiere ? `${matiere.filiere.name} - ${matiere.filiere.niveau}` : 'Filière inconnue'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                                        {matiere.name}
                                    </h3>

                                    <div className="flex items-center text-sm text-muted-foreground mt-4">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span>Gérer les notes</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
