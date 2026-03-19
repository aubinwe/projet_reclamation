import { Claim } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { Calendar, BookOpen, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClaimCardProps {
  claim: Claim;
  showStudent?: boolean; // Afficher le nom de l'étudiant (utile pour les profs/admin)
}

// Carte affichant un résumé d'une réclamation
export function ClaimCard({ claim, showStudent = false }: ClaimCardProps) {
  return (
    <Link
      to={`/claims/${claim.id}`}
      className="block bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {claim.objet}
          </h3>
          {showStudent && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {claim.nom_prenom}
            </p>
          )}
        </div>
        <StatusBadge status={claim.statut} />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {claim.motif}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {claim.matiere?.name || claim.matiere?.nom || 'Matière'}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}
