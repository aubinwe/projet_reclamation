import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserCog, PlusCircle, Mail, BookOpen, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface Filiere {
    id: number;
    name: string;
    niveau: string;
}

interface Teacher {
    id: number;
    name: string;
    email: string;
    matieres: Array<{
        id: number;
        name: string;
        filiere: {
            name: string;
            niveau: string;
        }
    }>;
}

interface Matiere {
    id: number;
    name: string;
    filiere: {
        name: string;
        niveau: string;
    }
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [matieres, setMatieres] = useState<Matiere[]>([]);
    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingTeacher, setIsAddingTeacher] = useState(false);
    const [isAssigningMatiere, setIsAssigningMatiere] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    // Form states
    const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: 'password' });
    const [selectedFiliereName, setSelectedFiliereName] = useState<string>('');
    const [selectedNiveau, setSelectedNiveau] = useState<string>('');
    const [selectedMatiereId, setSelectedMatiereId] = useState<string>('');

    // Derived data for selects
    const getFiliereName = (f: any) => f.name || f.nom || '';

    const uniqueFilieres = Array.from(new Set(
        filieres
            .map(getFiliereName)
            .filter(Boolean)
            .map(name => name.trim())
    )).sort();

    const availableNiveaux = Array.from(new Set(
        filieres
            .filter(f => !selectedFiliereName || getFiliereName(f).trim() === selectedFiliereName.trim())
            .map(f => f.niveau)
            .filter(Boolean)
    )).sort();
    const filteredMatieres = matieres.filter(m =>
        (!selectedFiliereName || getFiliereName(m.filiere) === selectedFiliereName) &&
        (!selectedNiveau || m.filiere.niveau === selectedNiveau) &&
        (!selectedTeacher?.matieres.some(tm => tm.id === m.id))
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teachersRes, matieresRes, filieresRes] = await Promise.all([
                api.get('/teachers'),
                api.get('/matieres'),
                api.get('/filieres')
            ]);
            setTeachers(teachersRes.data);
            setMatieres(matieresRes.data);
            setFilieres(filieresRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error("Erreur de chargement des données");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/teachers', newTeacher);
            setTeachers([...teachers, res.data]);
            setIsAddingTeacher(false);
            setNewTeacher({ name: '', email: '', password: 'password' });
            toast.success("Enseignant ajouté avec succès");
        } catch (error) {
            toast.error("Erreur lors de l'ajout de l'enseignant");
        }
    };

    const handleAssignMatiere = async () => {
        if (!selectedTeacher || !selectedMatiereId) return;
        try {
            const res = await api.post(`/teachers/${selectedTeacher.id}/assign-matiere`, {
                matiere_id: selectedMatiereId
            });
            setTeachers(teachers.map(t => t.id === selectedTeacher.id ? res.data.teacher : t));
            setIsAssigningMatiere(false);
            setSelectedMatiereId('');
            toast.success(res.data.message);
        } catch (error) {
            toast.error("Erreur d'affectation");
        }
    };

    const handleUnassignMatiere = async (teacherId: number, matiereId: number) => {
        try {
            const res = await api.post(`/teachers/${teacherId}/unassign-matiere`, {
                matiere_id: matiereId
            });
            setTeachers(teachers.map(t => t.id === teacherId ? res.data.teacher : t));
            toast.success(res.data.message);
        } catch (error) {
            toast.error("Erreur de désaffectation");
        }
    };

    return (
        <DashboardLayout>
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Gestion des Enseignants</h1>
                        <p className="text-muted-foreground">Liste et affectation des enseignants aux matières.</p>
                    </div>

                    <Dialog open={isAddingTeacher} onOpenChange={setIsAddingTeacher}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-accent text-accent-foreground gap-2">
                                <PlusCircle className="w-4 h-4" />
                                Ajouter un Enseignant
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nouvel Enseignant</DialogTitle>
                                <DialogDescription>
                                    Remplissez les informations ci-dessous pour créer un nouveau compte professeur.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddTeacher} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Nom complet</Label>
                                    <Input
                                        value={newTeacher.name}
                                        onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                                        placeholder="ex: Dr. Karim Konfé"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email professionnel</Label>
                                    <Input
                                        type="email"
                                        value={newTeacher.email}
                                        onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
                                        placeholder="karim.konfe@ibam.edu"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mot de passe par défaut</Label>
                                    <Input
                                        type="password"
                                        value={newTeacher.password}
                                        onChange={e => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">L'enseignant pourra le modifier par la suite.</p>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddingTeacher(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-accent text-accent-foreground">Créer le compte</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-48 rounded-xl bg-card border border-border animate-pulse" />
                        ))}
                    </div>
                ) : teachers.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                            <UserCog className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Aucun enseignant</h3>
                        <p className="text-muted-foreground">Commencez par ajouter un enseignant à la plateforme.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {teachers.map(teacher => (
                            <div key={teacher.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                            <UserCog className="w-6 h-6 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground">{teacher.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="w-3 h-3" />
                                                {teacher.email}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-accent"
                                        onClick={() => {
                                            setSelectedTeacher(teacher);
                                            setIsAssigningMatiere(true);
                                        }}
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <BookOpen className="w-3 h-3" />
                                        Matières Assignées ({teacher.matieres.length})
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {teacher.matieres.length > 0 ? (
                                            teacher.matieres.map(matiere => (
                                                <Badge
                                                    key={matiere.id}
                                                    variant="secondary"
                                                    className="bg-accent/5 text-accent border-accent/20 flex items-center gap-1 group/badge py-1 px-2"
                                                >
                                                    {matiere.name}
                                                    <span className="text-[10px] opacity-60 ml-1">({matiere.filiere.name} - {matiere.filiere.niveau})</span>
                                                    <button
                                                        onClick={() => handleUnassignMatiere(teacher.id, matiere.id)}
                                                        className="ml-1 text-accent/40 hover:text-destructive transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">Aucune matière affectée.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Dialog for assigning subject */}
            <Dialog
                open={isAssigningMatiere}
                onOpenChange={(open) => {
                    setIsAssigningMatiere(open);
                    if (!open) {
                        setSelectedFiliereName('');
                        setSelectedNiveau('');
                        setSelectedMatiereId('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Affecter une matière à {selectedTeacher?.name}</DialogTitle>
                        <DialogDescription>
                            Choisissez la filière, le niveau et la matière à assigner à cet enseignant.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>1. Filière</Label>
                            <Select
                                value={selectedFiliereName}
                                onValueChange={(val) => {
                                    setSelectedFiliereName(val);
                                    setSelectedNiveau('');
                                    setSelectedMatiereId('');
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir une filière..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueFilieres.map(f => (
                                        <SelectItem key={f} value={f}>{f}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedFiliereName && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label>2. Niveau</Label>
                                <Select
                                    value={selectedNiveau}
                                    onValueChange={(val) => {
                                        setSelectedNiveau(val);
                                        setSelectedMatiereId('');
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un niveau..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableNiveaux.map(n => (
                                            <SelectItem key={n} value={n}>{n}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {selectedNiveau && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label>3. Matière</Label>
                                <Select
                                    value={selectedMatiereId}
                                    onValueChange={setSelectedMatiereId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir une matière..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredMatieres.length > 0 ? (
                                            filteredMatieres.map(m => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-xs text-muted-foreground text-center italic">
                                                Aucune matière disponible
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssigningMatiere(false)}>Annuler</Button>
                        <Button
                            className="bg-accent text-accent-foreground"
                            disabled={!selectedMatiereId}
                            onClick={handleAssignMatiere}
                        >
                            Confirmer l'affectation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
