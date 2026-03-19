import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClaimCard } from '@/components/claims/ClaimCard';
import { STATUS_CONFIG, ClaimStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, PlusCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';

// Page de liste des réclamations avec filtrage
export default function ClaimsListPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter'); // 'pending' | 'processed'

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
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

  // Filtrage des réclamations
  const getFilteredClaims = () => {
    let filtered = [...claims];

    // Appliquer le filtre de l'URL (pending vs processed)
    if (filterParam === 'pending') {
      const pendingStatuses = ['SOUMISE', 'RECUE_SCOLARITE', 'ENVOYEE_DA', 'IMPUTEE_ENSEIGNANT'];
      filtered = filtered.filter(c => pendingStatuses.includes(c.statut));
    } else if (filterParam === 'processed') {
      const processedStatuses = ['VALIDEE', 'NON_VALIDEE', 'REJETEE_SCOLARITE'];
      filtered = filtered.filter(c => processedStatuses.includes(c.statut));
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.statut === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        (c.nom_prenom || '').toLowerCase().includes(query) ||
        (c.objet || '').toLowerCase().includes(query) ||
        (c.matiere?.name || '').toLowerCase().includes(query) ||
        (c.matiere?.nom || '').toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredClaims = getFilteredClaims();
  // Logique d'affichage selon le rôle
  const showAddButton = user?.role === 'student';
  const showStudentColumn = user?.role !== 'student';

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {user?.role === 'student' ? 'Mes réclamations' :
                user?.role === 'teacher' ? 'Réclamations assignées' :
                  'Toutes les réclamations'}
            </h1>
            <p className="text-muted-foreground">
              {filteredClaims.length} réclamation{filteredClaims.length > 1 ? 's' : ''} trouvée{filteredClaims.length > 1 ? 's' : ''}
            </p>
          </div>
          {showAddButton && (
            <Link to="/claims/new">
              <Button className="bg-gradient-accent hover:opacity-90 text-accent-foreground gap-2">
                <PlusCircle className="w-5 h-5" />
                Nouvelle réclamation
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, objet ou matière..."
              className="pl-10 bg-card"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ClaimStatus | 'all')}
          >
            <SelectTrigger className="w-full sm:w-[200px] bg-card">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Claims List */}
        {filteredClaims.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Aucune réclamation</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Aucune réclamation ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore de réclamation.'}
            </p>
            {showAddButton && !searchQuery && statusFilter === 'all' && (
              <Link to="/claims/new">
                <Button className="bg-gradient-accent hover:opacity-90 text-accent-foreground">
                  Créer une réclamation
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Cards View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredClaims.map((claim, index) => (
                <div
                  key={claim.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ClaimCard claim={claim} showStudent={showStudentColumn} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
