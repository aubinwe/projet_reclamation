import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, User, GraduationCap, FileText } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface GradeItem {
    matiere: {
        id: number;
        name: string;
        code?: string;
    };
    note: number | null;
    commentaire: string | null;
    note_id: number | null;
}

export default function StudentGradesPage() {
    const { id } = useParams<{ id: string }>();
    const [grades, setGrades] = useState<GradeItem[]>([]);
    const [student, setStudent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const response = await api.get(`/users/${id}/grades`);
                setStudent(response.data.student);
                setGrades(response.data.grades);
            } catch (error) {
                console.error('Failed to fetch student grades', error);
                toast.error("Erreur lors du chargement du dossier étudiant");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleGradeChange = (matiereId: number, value: string) => {
        setGrades(prev => prev.map(g => {
            if (g.matiere.id === matiereId) {
                return { ...g, note: value === '' ? null : Number(value) };
            }
            return g;
        }));
    };

    const handleCommentChange = (matiereId: number, value: string) => {
        setGrades(prev => prev.map(g => {
            if (g.matiere.id === matiereId) {
                return { ...g, commentaire: value };
            }
            return g;
        }));
    };

    const saveGrade = async (item: GradeItem) => {
        if (!student) return;
        try {
            if (item.note !== null && (item.note < 0 || item.note > 20)) {
                toast.error("La note doit être comprise entre 0 et 20");
                return;
            }

            await api.post('/notes', {
                user_id: student.id,
                matiere_id: item.matiere.id,
                note: item.note,
                commentaire: item.commentaire
            });
            toast.success(`Note de ${item.matiere.name} enregistrée`);
        } catch (error) {
            console.error('Failed to save grade', error);
            toast.error("Erreur d'enregistrement");
        }
    };

    return (
        <DashboardLayout>
            <div className="animate-fade-in max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link to="/grades" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour à la liste
                    </Link>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">Chargement du dossier...</div>
                ) : student ? (
                    <div className="grid gap-6">
                        {/* Student Header */}
                        <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                        <GraduationCap className="w-4 h-4" />
                                        <span>{student.filiere ? `${student.filiere.name} - ${student.filiere.niveau}` : 'Sans filière'}</span>
                                        <span className="text-border mx-2">|</span>
                                        <span>{student.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                            </div>
                        </div>

                        {/* Grades List */}
                        <div className="bg-card border border-border rounded-xl overflow-hidden">
                            <div className="p-4 bg-muted/30 border-b border-border">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Relevé de notes
                                </h3>
                            </div>
                            <div className="divide-y divide-border">
                                {grades.map((item) => (
                                    <div key={item.matiere.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/10 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground">{item.matiere.name}</p>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <Input
                                                type="number"
                                                placeholder="/20"
                                                min="0"
                                                max="20"
                                                step="0.5"
                                                className={`w-20 font-mono text-center ${item.note !== null && item.note < 10 ? 'text-red-500 font-bold' : ''}`}
                                                value={item.note === null ? '' : item.note}
                                                onChange={(e) => handleGradeChange(item.matiere.id, e.target.value)}
                                            />
                                            <Input
                                                type="text"
                                                placeholder="Commentaire..."
                                                className="w-full sm:w-48 text-sm"
                                                value={item.commentaire || ''}
                                                onChange={(e) => handleCommentChange(item.matiere.id, e.target.value)}
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="shrink-0 text-primary hover:text-primary hover:bg-primary/10"
                                                onClick={() => saveGrade(item)}
                                            >
                                                <Save className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">Étudiant introuvable.</div>
                )}
            </div>
        </DashboardLayout>
    );
}
