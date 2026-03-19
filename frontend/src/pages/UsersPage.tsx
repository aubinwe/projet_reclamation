import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users, PlusCircle, Trash2, Mail, Shield, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function UsersPage() {
    const [usersList, setUsersList] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [filieres, setFilieres] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: 'password',
        role_id: '',
        filiere_id: '',
    });

    // État temporaire pour la sélection UX (Filière Name -> Niveau)
    const [selectedFiliereName, setSelectedFiliereName] = useState<string>('');

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsersList(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Failed to fetch roles', error);
        }
    };

    const fetchFilieres = async () => {
        try {
            const response = await api.get('/filieres');
            setFilieres(response.data);
        } catch (error) {
            console.error('Failed to fetch filieres', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchFilieres();
    }, []);

    // Dériver les noms uniques de filières pour le premier dropdown
    const uniqueFiliereNames = Array.from(new Set(filieres.map(f => f.name)));

    // Filtrer les niveaux disponibles pour la filière sélectionnée
    const availableNiveaux = filieres.filter(f => f.name === selectedFiliereName);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.role_id) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const selectedRole = roles.find(r => r.id.toString() === formData.role_id);
        if (selectedRole?.name === 'student' && !formData.filiere_id) {
            toast.error('Veuillez sélectionner une filière et un niveau pour l\'étudiant');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/users', formData);
            toast.success('Utilisateur créé avec succès');
            setIsOpen(false);
            setFormData({ name: '', email: '', password: 'password', role_id: '', filiere_id: '' });
            setSelectedFiliereName('');
            fetchUsers();
        } catch (error: any) {
            console.error('Failed to create user', error);
            toast.error(error.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            await api.delete(`/users/${id}`);
            toast.success('Utilisateur supprimé');
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const getRoleBadge = (roleName: string) => {
        switch (roleName) {
            case 'admin': return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-200">DA</Badge>;
            case 'registrar': return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200">Scolarité</Badge>;
            case 'teacher': return <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-200">Enseignant</Badge>;
            case 'student': return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">Étudiant</Badge>;
            default: return <Badge variant="outline">{roleName}</Badge>;
        }
    };

    const isStudentRoleSelected = () => {
        const selectedRole = roles.find(r => r.id.toString() === formData.role_id);
        return selectedRole?.name === 'student';
    };

    return (
        <DashboardLayout>
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Gestion des Utilisateurs</h1>
                        <p className="text-muted-foreground">Administrez les comptes et les accès du système.</p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-accent text-accent-foreground gap-2">
                                <PlusCircle className="w-4 h-4" />
                                Nouvel Utilisateur
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Créer un compte</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom complet</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="ex: Jean Dupont"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email professionnel</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="ex: j.dupont@ibam.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Rôle</Label>
                                    <Select
                                        value={formData.role_id}
                                        onValueChange={(val) => {
                                            setFormData({ ...formData, role_id: val, filiere_id: '' });
                                            setSelectedFiliereName('');
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisir un rôle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                    {role.name === 'admin' ? 'Directeur Académique' :
                                                        role.name === 'registrar' ? 'Agent Scolarité' :
                                                            role.name === 'teacher' ? 'Enseignant' : 'Étudiant'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {isStudentRoleSelected() && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="filiere">Filière</Label>
                                            <Select
                                                value={selectedFiliereName}
                                                onValueChange={(val) => {
                                                    setSelectedFiliereName(val);
                                                    setFormData(prev => ({ ...prev, filiere_id: '' })); // Reset niveau when filiere changes
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {uniqueFiliereNames.map((name) => (
                                                        <SelectItem key={name} value={name}>
                                                            {name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="niveau">Niveau</Label>
                                            <Select
                                                value={formData.filiere_id}
                                                onValueChange={(val) => setFormData({ ...formData, filiere_id: val })}
                                                disabled={!selectedFiliereName}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Niveau" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableNiveaux.map((filiere) => (
                                                        <SelectItem key={filiere.id} value={filiere.id.toString()}>
                                                            {filiere.niveau}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="password">Mot de passe temporaire</Label>
                                    <Input
                                        id="password"
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">L'utilisateur pourra le changer plus tard.</p>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-accent text-accent-foreground">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                                        Créer le compte
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-card border border-border rounded-xl">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Créé le</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : usersList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        Aucun utilisateur trouvé.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                usersList.map((userItem) => (
                                    <TableRow key={userItem.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <div>{userItem.name}</div>
                                                    {userItem.filiere && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {userItem.filiere.name} - {userItem.filiere.niveau}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getRoleBadge(userItem.role?.name)}</TableCell>
                                        <TableCell className="text-muted-foreground">{userItem.email}</TableCell>
                                        <TableCell className="text-sm">
                                            {new Date(userItem.created_at).toLocaleDateString('fr-FR')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(userItem.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}
