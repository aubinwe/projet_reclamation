import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, User, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import api from '@/lib/axios';
import { Link } from 'react-router-dom';

export default function GradesPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // On récupère tous les utilisateurs
                const response = await api.get('/users');
                // On filtre pour ne garder que les étudiants (role name 'student')
                const allUsers = response.data;
                const studentsOnly = allUsers.filter((u: any) =>
                    u.role?.name.toLowerCase() === 'student'
                );
                setStudents(studentsOnly);
            } catch (error) {
                console.error('Failed to fetch students', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.filiere?.name?.toLowerCase().includes(search.toLowerCase())) ||
        (s.filiere?.niveau?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <DashboardLayout>
            <div className="animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Gestion des Notes (Administration)</h1>
                    <p className="text-muted-foreground">
                        Liste des étudiants inscrits. Cliquez sur un étudiant pour gérer son relevé de notes.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl">
                    <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher (nom, email, filière)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-background"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {filtered.length} étudiant(s) trouvé(s)
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Étudiant</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Filière</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10">Chargement...</TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        Aucun étudiant trouvé.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                {student.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>{student.filiere ? `${student.filiere.name} - ${student.filiere.niveau}` : '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <Link to={`/grades/${student.id}`}>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Eye className="w-4 h-4" />
                                                    Voir Notes
                                                </Button>
                                            </Link>
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
