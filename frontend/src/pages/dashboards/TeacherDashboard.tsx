import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, Clock, CheckCircle, BookOpen, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';

// Dashboard Enseignant : Gestion des réclamations assignées
export default function TeacherDashboard() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await api.get('/demandes');
        setClaims(response.data);
      } catch (error) {
        console.error('Failed to fetch claims', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const assignedClaims = claims;
  // Extraction des matières uniques enseignées
  const mySubjects = Array.from(new Set(assignedClaims.map(c => c.matiere_id))).map(id => {
    const claim = assignedClaims.find(c => c.matiere_id === id);
    return { id, nom: claim?.matiere?.nom || 'Matière', code: claim?.matiere?.code || '' };
  });
  const pendingClaims = assignedClaims.filter(c => c.statut === 'IMPUTEE_ENSEIGNANT');
  const processedClaims = assignedClaims.filter(c => ['VALIDEE', 'NON_VALIDEE'].includes(c.statut));

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Bonjour, {user?.name} 👋</h1>
          <p className="page-subtitle">Consultez et traitez les réclamations qui vous sont assignées</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Mes matières"
            value={mySubjects.length}
            icon={BookOpen}
            variant="accent"
          />
          <StatCard
            title="À traiter"
            value={pendingClaims.length}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Traitées"
            value={processedClaims.length}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Total reçues"
            value={assignedClaims.length}
            icon={FileText}
            variant="default"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Claims */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Réclamations en attente
              </h2>
              <Link to="/claims" className="text-sm text-accent hover:underline font-medium">
                Voir tout →
              </Link>
            </div>

            {pendingClaims.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-status-success-bg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-status-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Tout est traité !</h3>
                <p className="text-muted-foreground">
                  Aucune réclamation n'est en attente de votre révision.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingClaims.map((claim, index) => (
                  <Link
                    key={claim.id}
                    to={`/claims/${claim.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">
                          {claim.nom_prenom}
                        </span>
                        <StatusBadge status={claim.statut} />
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">
                        {claim.objet} • {claim.matiere_nom}
                      </p>
                      <div className="flex items-center gap-4 mt-2 ml-11 text-xs text-muted-foreground">
                        <span>Note actuelle: <strong className="text-foreground">{claim.note_actuelle}/20</strong></span>
                        <span>→</span>
                        <span>Demandée: <strong className="text-accent">{claim.note_demandee}/20</strong></span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4 shrink-0">
                      Examiner
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My Subjects */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Mes matières</h3>
            <div className="space-y-3">
              {mySubjects.map((subject) => {
                const claimsForSubject = assignedClaims.filter(c => c.matiere_id === subject.id);
                const pendingForSubject = claimsForSubject.filter(c => c.statut === 'IMPUTEE_ENSEIGNANT');

                return (
                  <div
                    key={subject.id}
                    className="p-4 rounded-lg border border-border bg-muted/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{subject.nom}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {subject.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {claimsForSubject.length} réclamation{claimsForSubject.length > 1 ? 's' : ''}
                      </span>
                      {pendingForSubject.length > 0 && (
                        <span className="text-status-pending font-medium">
                          {pendingForSubject.length} en attente
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
