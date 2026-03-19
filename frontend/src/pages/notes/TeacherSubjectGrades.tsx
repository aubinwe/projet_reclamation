import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, User, UserCheck } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface StudentGrade {
    student: {
        id: number;
        name: string;
        email: string;
    };
    note: number | null;
    commentaire: string | null;
    note_id: number | null;
}

export default function TeacherSubjectGrades() {
    const { id } = useParams<{ id: string }>();
    const [students, setStudents] = useState<StudentGrade[]>([]);
    const [matiereName, setMatiereName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const response = await api.get(`/matieres/${id}/grades`);
                setStudents(response.data.grades);
                setMatiereName(response.data.matiere.name);
            } catch (error) {
                console.error('Failed to fetch grades', error);
                toast.error("Erreur lors du chargement des étudiants");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleGradeChange = (studentId: number, value: string) => {
        setStudents(prev => prev.map(s => {
            if (s.student.id === studentId) {
                return { ...s, note: value === '' ? null : Number(value) };
            }
            return s;
        }));
    };

    const handleCommentChange = (studentId: number, value: string) => {
        setStudents(prev => prev.map(s => {
            if (s.student.id === studentId) {
                return { ...s, commentaire: value };
            }
            return s;
        }));
    };

    const saveGrade = async (student: StudentGrade) => {
        if (!id) return;
        try {
            // Validation basique
            if (student.note !== null && (student.note < 0 || student.note > 20)) {
                toast.error("La note doit être comprise entre 0 et 20");
                return;
            }

            await api.post('/notes', {
                user_id: student.student.id,
                matiere_id: id,
                note: student.note,
                commentaire: student.commentaire
            });
            toast.success(`Note enregistrée pour ${student.student.name}`);
        } catch (error) {
            console.error('Failed to save grade', error);
            toast.error("Erreur lors de l'enregistrement");
        }
    };

    const saveAll = async () => {
        setIsSaving(true);
        let successCount = 0;
        // On pourrait faire un Promise.all, mais attention au rate limit.
        // Pour l'instant séquentiel ou API bulk (non implémentée).
        // Faisons un simple Promise.all
        try {
            const promises = students
                .filter(s => s.note !== null) //  On n'envoie que ceux qui ont une note ? Ou tous ? `store` updateOrCreate.
                .map(s => saveGrade(s));

            await Promise.all(promises);
            // toast.success("Toutes les notes ont été sauvegardées"); // saveGrade envoie déjà des toasts, ça ferait beaucoup.
        } catch (error) {
            // Géré individuellement
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="animate-fade-in max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link to="/teacher/notes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour aux matières
                    </Link>
                    <div className="flex gap-2">
                        {/* <Button variant="outline" onClick={() => window.location.reload()}>Annuler</Button> */}
                        <Button onClick={saveAll} disabled={isSaving} className="min-w-[140px]">
                            {isSaving ? 'Enregistrement...' : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Tout Enregistrer
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border">
                        <h1 className="text-2xl font-bold text-foreground">Saisie des notes : {matiereName}</h1>
                        <p className="text-muted-foreground mt-1">Liste des étudiants inscrits dans cette filière.</p>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center">Chargement des étudiants...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Étudiant</th>
                                        <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm w-32">Note (/20)</th>
                                        <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Appréciation</th>
                                        <th className="text-right py-4 px-6 font-medium text-muted-foreground text-sm">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {students.map((item) => (
                                        <tr key={item.student.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{item.student.name}</p>
                                                        <p className="text-xs text-muted-foreground">{item.student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="20"
                                                        step="0.5"
                                                        className={`w-24 ${item.note !== null && item.note < 10 ? 'text-red-500 border-red-200 focus-visible:ring-red-500' : ''}`}
                                                        value={item.note === null ? '' : item.note}
                                                        onChange={(e) => handleGradeChange(item.student.id, e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Input
                                                    type="text"
                                                    placeholder="Très bien, bon travail..."
                                                    className="w-full max-w-md"
                                                    value={item.commentaire || ''}
                                                    onChange={(e) => handleCommentChange(item.student.id, e.target.value)}
                                                />
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-accent hover:text-accent/80 hover:bg-accent/10"
                                                    onClick={() => saveGrade(item)}
                                                >
                                                    <Save className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
