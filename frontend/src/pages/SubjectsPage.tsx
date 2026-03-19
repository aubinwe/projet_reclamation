import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookOpen, Users, Clock, Plus, Loader2, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/context/AuthContext';

interface Subject {
    id: number;
    name: string;
    filiere: {
        name: string;
        nom: string;
        niveau: string;
    };
}

interface Filiere {
    id: number;
    name: string;
    niveau: string;
}

export default function SubjectsPage() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [selectedFiliereName, setSelectedFiliereName] = useState('');
    const [selectedNiveau, setSelectedNiveau] = useState('');
    const [selectedFiliereId, setSelectedFiliereId] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Admin sees everything, teacher sees their subjects by default
            const subjectsUrl = user?.role === 'admin' ? '/matieres' : '/matieres?my';
            const [subjectsRes, filieresRes] = await Promise.all([
                api.get(subjectsUrl),
                api.get('/filieres')
            ]);
            setSubjects(subjectsRes.data);
            setFilieres(filieresRes.data);
        } catch (error) {
            toast.error("Erreur lors de la récupération des données");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    // Derived data for form
    const getFiliereName = (f: any) => f.name || f.nom || '';

    const uniqueFiliereNames = useMemo(() => {
        return Array.from(new Set(
            filieres
                .map(getFiliereName)
                .filter(Boolean)
                .map(name => name.trim())
        )).sort();
    }, [filieres]);

    const availableNiveaux = useMemo(() => {
        if (!selectedFiliereName) return [];
        return Array.from(new Set(
            filieres
                .filter(f => getFiliereName(f).trim() === selectedFiliereName.trim())
                .map(f => f.niveau)
                .filter(Boolean)
        )).sort();
    }, [filieres, selectedFiliereName]);

    const finalFiliere = useMemo(() => {
        if (!selectedFiliereName || !selectedNiveau) return null;
        return filieres.find(f =>
            getFiliereName(f).trim() === selectedFiliereName.trim() &&
            f.niveau === selectedNiveau
        );
    }, [filieres, selectedFiliereName, selectedNiveau]);

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !finalFiliere) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        setIsSaving(true);
        try {
            const response = await api.post('/matieres', {
                name: newName,
                filiere_id: finalFiliere.id,
            });

            toast.success("Matière ajoutée avec succès !");
            setSubjects([response.data, ...subjects]);
            setIsDialogOpen(false);
            setNewName('');
            setSelectedFiliereName('');
            setSelectedNiveau('');
        } catch (error) {
            toast.error("Erreur lors de l'ajout de la matière");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSubject = async (id: number) => {
        if (!confirm("Supprimer cette matière ?")) return;
        try {
            await api.delete(`/matieres/${id}`);
            setSubjects(subjects.filter(s => s.id !== id));
            toast.success("Matière supprimée");
        } catch (error) {
            toast.error("Impossible de supprimer cette matière");
        }
    };

    return (
        <DashboardLayout>
            <div className="animate-fade-in pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">
                            {user?.role === 'admin' ? "Gestion des Matières" : "Mes Matières"}
                        </h1>
                        <p className="text-muted-foreground">
                            {user?.role === 'admin'
                                ? "Administration globale de toutes les matières de l'institut."
                                : "Consultez et gérez les matières qui vous sont assignées."}
                        </p>
                    </div>

                    {(user?.role === 'teacher' || user?.role === 'admin') && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-accent gap-2">
                                    <Plus className="w-4 h-4" />
                                    Ajouter une matière
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <form onSubmit={handleAddSubject}>
                                    <DialogHeader>
                                        <DialogTitle>Nouvelle Matière</DialogTitle>
                                        <DialogDescription>
                                            Enregistrez une nouvelle matière dans le système.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label>1. Filière</Label>
                                            <Select value={selectedFiliereName} onValueChange={(val) => {
                                                setSelectedFiliereName(val);
                                                setSelectedNiveau('');
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choisir une filière..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {uniqueFiliereNames.length > 0 ? (
                                                        uniqueFiliereNames.map(name => (
                                                            <SelectItem key={name} value={name}>{name}</SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="none" disabled>Aucune filière disponible</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>2. Niveau</Label>
                                            <Select
                                                value={selectedNiveau}
                                                onValueChange={setSelectedNiveau}
                                                disabled={!selectedFiliereName || uniqueFiliereNames.length === 0}
                                            >
                                                <SelectTrigger className={!selectedFiliereName ? "opacity-50 cursor-not-allowed" : ""}>
                                                    <SelectValue placeholder={selectedFiliereName ? "Choisir un niveau..." : "Sélectionnez d'abord une filière"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableNiveaux.length > 0 ? (
                                                        availableNiveaux.map(niveau => (
                                                            <SelectItem key={niveau} value={niveau}>{niveau}</SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="none" disabled>
                                                            {selectedFiliereName ? "Aucun niveau trouvé pour cette filière" : "Sélectionnez une filière"}
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name">3. Nom de la matière</Label>
                                            <Input
                                                id="name"
                                                placeholder="ex: Algorithmique Avancée"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                disabled={!selectedNiveau}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={isSaving || !newName} className="w-full">
                                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Créer la matière"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                                <div className="w-12 h-12 bg-muted rounded-lg mb-4" />
                                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                            </div>
                        ))}
                    </div>
                ) : subjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject) => (
                            <div key={subject.id} className="relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all group border-l-4 border-l-transparent hover:border-l-accent">
                                {user?.role === 'admin' && (
                                    <button
                                        onClick={() => handleDeleteSubject(subject.id)}
                                        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-muted rounded-full text-muted-foreground border border-border">
                                        {subject.filiere?.niveau || 'N/A'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-accent transition-colors">
                                    {subject.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    {subject.filiere?.name || subject.filiere?.nom || 'Filière non définie'}
                                </p>

                                <div className="flex items-center gap-4 pt-4 border-t border-border mt-auto">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Users className="w-4 h-4" />
                                        <span>Gpe standard</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>2024-2025</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-xl p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Aucune matière trouvée</h3>
                        <p className="text-muted-foreground">
                            {user?.role === 'admin' ? "Aucune matière n'est enregistrée pour le moment." : "Vous n'avez pas encore de matières assignées."}
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}


