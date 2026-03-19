import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';

// Dashboard Admin : Vue d'ensemble et statistiques
export default function AdminDashboard() {
  const [claims, setClaims] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [claimsRes, teachersRes] = await Promise.all([
          api.get('/demandes'),
          api.get('/users/enseignants'),
        ]);
        setClaims(claimsRes.data);
        setTeachers(teachersRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrage et Statistiques
  const allClaims = claims;
  const pendingAssignment = allClaims.filter(c => c.statut === 'ENVOYEE_DA');
  const inProgress = allClaims.filter(c => ['SOUMISE', 'RECUE_SCOLARITE', 'ENVOYEE_DA', 'IMPUTEE_ENSEIGNANT'].includes(c.statut));
  const resolved = allClaims.filter(c => ['VALIDEE', 'NON_VALIDEE', 'REJETEE_SCOLARITE'].includes(c.statut));

  const statusDistribution = [
    { status: 'SOUMISE' as const, count: allClaims.filter(c => c.statut === 'SOUMISE').length },
    { status: 'RECUE_SCOLARITE' as const, count: allClaims.filter(c => c.statut === 'RECUE_SCOLARITE').length },
    { status: 'ENVOYEE_DA' as const, count: allClaims.filter(c => c.statut === 'ENVOYEE_DA').length },
    { status: 'IMPUTEE_ENSEIGNANT' as const, count: allClaims.filter(c => c.statut === 'IMPUTEE_ENSEIGNANT').length },
    { status: 'VALIDEE' as const, count: allClaims.filter(c => c.statut === 'VALIDEE').length },
    { status: 'REJETEE_SCOLARITE' as const, count: allClaims.filter(c => ['REJETEE_SCOLARITE', 'NON_VALIDEE'].includes(c.statut)).length },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Tableau de bord - Direction Académique</h1>
          <p className="page-subtitle">Vue d'ensemble du système de réclamations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total réclamations"
            value={allClaims.length}
            icon={FileText}
            variant="default"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="À imputer"
            value={pendingAssignment.length}
            icon={AlertTriangle}
            variant="warning"
          />
          <StatCard
            title="En cours"
            value={inProgress.length}
            icon={Clock}
            variant="accent"
          />
          <StatCard
            title="Résolues"
            value={resolved.length}
            icon={CheckCircle}
            variant="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Claims to Assign */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Réclamations à imputer
              </h2>
              <Link to="/claims" className="text-sm text-accent hover:underline font-medium">
                Voir tout →
              </Link>
            </div>

            {pendingAssignment.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-status-success-bg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-status-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Toutes imputées</h3>
                <p className="text-sm text-muted-foreground">
                  Aucune réclamation en attente d'imputation
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAssignment.map((claim, index) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-foreground">
                          {claim.nom_prenom}
                        </span>
                        <StatusBadge status={claim.statut} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {claim.objet} • {claim.matiere?.name || claim.matiere?.nom || 'Sans matière'}
                      </p>
                    </div>
                    <Link to={`/claims/${claim.id}`}>
                      <Button size="sm" className="bg-gradient-accent hover:opacity-90 text-accent-foreground">
                        Imputer
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Répartition par statut</h3>
            <div className="space-y-4">
              {statusDistribution.map(({ status, count }) => (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={status} />
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${(count / allClaims.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Teachers Overview */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Enseignants</h2>
            <Link to="/teachers" className="text-sm text-accent hover:underline font-medium">
              Gérer →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teachers.map((teacher, index) => {
              const teacherClaims = allClaims.filter(c => c.enseignant_id === teacher.id);
              const pendingCount = teacherClaims.filter(c => c.statut === 'IMPUTEE_ENSEIGNANT').length;

              return (
                <div
                  key={teacher.id}
                  className="p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {teacher.name.split(' ').slice(-1)[0][0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {teacherClaims.length} réclamation{teacherClaims.length > 1 ? 's' : ''}
                    </span>
                    {pendingCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-status-pending-bg text-status-pending-text text-xs font-medium">
                        {pendingCount} en attente
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
