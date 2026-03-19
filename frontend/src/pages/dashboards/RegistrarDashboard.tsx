import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

// Dashboard Scolarité : Supervision globale et dispatching
export default function RegistrarDashboard() {
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

  // Catégorisation des réclamations
  const allClaims = claims;
  const newClaims = allClaims.filter(c => c.statut === 'SOUMISE');
  const inReviewClaims = allClaims.filter(c => c.statut === 'RECUE_SCOLARITE');
  const processedClaims = allClaims.filter(c =>
    ['ENVOYEE_DA', 'IMPUTEE_ENSEIGNANT', 'VALIDEE', 'NON_VALIDEE', 'REJETEE_SCOLARITE'].includes(c.statut)
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Tableau de bord - Scolarité</h1>
          <p className="page-subtitle">Gérez les réclamations de notes des étudiants</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Nouvelles demandes"
            value={newClaims.length}
            icon={AlertCircle}
            variant="warning"
            subtitle="En attente de traitement"
          />
          <StatCard
            title="En cours d'examen"
            value={inReviewClaims.length}
            icon={Clock}
            variant="accent"
          />
          <StatCard
            title="Envoyées au DA"
            value={allClaims.filter(c => c.statut === 'ENVOYEE_DA').length}
            icon={Send}
            variant="default"
          />
          <StatCard
            title="Traitées ce mois"
            value={processedClaims.length}
            icon={CheckCircle}
            variant="success"
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Quick Actions + Recent Claims */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Claims List */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Réclamations à traiter</h2>
              <Link to="/claims" className="text-sm text-accent hover:underline font-medium">
                Voir tout →
              </Link>
            </div>

            <div className="space-y-4">
              {[...newClaims, ...inReviewClaims].slice(0, 5).map((claim, index) => (
                <Link
                  key={claim.id}
                  to={`/claims/${claim.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-foreground truncate">
                        {claim.nom_prenom}
                      </span>
                      <StatusBadge status={claim.statut} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {claim.objet} • {claim.matiere?.name || claim.matiere?.nom || 'Sans matière'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4 shrink-0">
                    Examiner
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <Link to="/claims?status=SOUMISE" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-status-pending-bg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-status-pending" />
                    </div>
                    <span>Nouvelles ({newClaims.length})</span>
                  </Button>
                </Link>
                <Link to="/claims?status=RECUE_SCOLARITE" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-status-info-bg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-status-info" />
                    </div>
                    <span>En examen ({inReviewClaims.length})</span>
                  </Button>
                </Link>
                <Link to="/grades" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span>Gestion des notes</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats by Status */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Répartition</h3>
              <div className="space-y-3">
                {[
                  { label: 'Validées', count: allClaims.filter(c => c.statut === 'VALIDEE').length, color: 'bg-status-success' },
                  { label: 'Rejetées', count: allClaims.filter(c => ['REJETEE_SCOLARITE', 'NON_VALIDEE'].includes(c.statut)).length, color: 'bg-status-error' },
                  { label: 'En cours', count: allClaims.filter(c => ['SOUMISE', 'RECUE_SCOLARITE', 'ENVOYEE_DA', 'IMPUTEE_ENSEIGNANT'].includes(c.statut)).length, color: 'bg-status-processing' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', item.color)} />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="font-semibold text-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
