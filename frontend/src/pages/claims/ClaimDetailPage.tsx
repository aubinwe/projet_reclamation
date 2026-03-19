import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { ClaimWorkflow } from '@/components/claims/ClaimWorkflow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  User,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Send,
  UserCog
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { ClaimStatus } from '@/types';
import api from '@/lib/axios';

// Page de détail d'une réclamation avec gestion du workflow
export default function ClaimDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [claim, setClaim] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [newNote, setNewNote] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [claimRes, teachersRes] = await Promise.all([
          api.get(`/demandes/${id}`),
          api.get('/users/enseignants'),
        ]);
        const claimData = claimRes.data;
        setClaim(claimData);
        setTeachers(teachersRes.data);

        // Pré-sélectionner l'enseignant assigné à la réclamation
        if (claimData.enseignant_id) {
          setSelectedTeacher(claimData.enseignant_id.toString());
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
        toast.error('Impossible de charger les détails de la réclamation');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <span className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!claim) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-2">Réclamation introuvable</h2>
          <p className="text-muted-foreground mb-6">Cette réclamation n'existe pas ou a été supprimée.</p>
          <Link to="/claims">
            <Button variant="outline">Retour à la liste</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Gestion des actions (Validation, Rejet, Imputation...)
  const handleAction = async (action: 'validate' | 'reject' | 'send_da' | 'assign' | 'validate_note') => {
    setIsProcessing(true);
    try {
      let endpoint = '';
      let data = {};

      switch (action) {
        case 'send_da':
          endpoint = `/demandes/${id}/envoyer-au-da`;
          break;
        case 'reject':
          endpoint = `/demandes/${id}/rejeter`;
          data = { commentaire: comment };
          break;
        case 'assign':
          endpoint = `/demandes/${id}/imputer`;
          data = { enseignant_id: selectedTeacher, commentaire: comment };
          break;
        case 'validate_note':
          endpoint = `/demandes/${id}/corriger`;
          data = { nouvelle_note: newNote, commentaire: comment };
          break;
        case 'validate':
          endpoint = `/demandes/${id}/valider`;
          break;
      }

      await api.post(endpoint, data);

      const messages = {
        validate: 'Réclamation validée avec succès',
        reject: 'Réclamation rejetée',
        send_da: 'Réclamation envoyée au Directeur Académique',
        assign: 'Réclamation imputée à l\'enseignant',
        validate_note: 'Note mise à jour avec succès',
      };

      toast.success(messages[action]);
      navigate('/claims');
    } catch (error: any) {
      console.error('Action failed', error);
      toast.error('Une erreur est survenue lors de l\'action.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Vérifie si l'utilisateur peut effectuer une action sur la réclamation
  const canProcess = () => {
    switch (user?.role) {
      case 'registrar':
        return ['SOUMISE', 'RECUE_SCOLARITE'].includes(claim.statut);
      case 'admin':
        return claim.statut === 'ENVOYEE_DA';
      case 'teacher':
        return claim.statut === 'IMPUTEE_ENSEIGNANT';
      default:
        return false;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/claims"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{claim.objet}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={claim.statut} />
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(claim.created_at), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de progression du workflow */}
        <div className="mb-8">
          <ClaimWorkflow currentStatus={claim.statut} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Claim Details */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-5">Détails de la demande</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Objectif</p>
                  <p className="text-foreground">{claim.objectif || 'Non spécifié'}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Motif</p>
                  <p className="text-foreground whitespace-pre-wrap">{claim.motif}</p>
                </div>

                {claim.justification_url && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Justificatif</p>
                    <a
                      href={claim.justification_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Télécharger le justificatif
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-5">Notes</h2>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Note actuelle</p>
                  <p className="text-2xl font-bold text-foreground">{claim.note_actuelle ?? '-'}/20</p>
                </div>
                <div className="text-center p-4 bg-accent-light rounded-lg border border-accent/30">
                  <p className="text-sm text-accent mb-1">Note demandée</p>
                  <p className="text-2xl font-bold text-accent">{claim.note_demandee ?? '-'}/20</p>
                </div>
                <div className="text-center p-4 bg-status-success-bg rounded-lg border border-status-success/30">
                  <p className="text-sm text-status-success-text mb-1">Note finale</p>
                  <p className="text-2xl font-bold text-status-success">{claim.note_finale ?? '-'}/20</p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {(claim.commentaire_scolarite || claim.commentaire_enseignant) && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-5">Commentaires</h2>

                <div className="space-y-4">
                  {claim.commentaire_scolarite && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Scolarité</p>
                      <p className="text-foreground">{claim.commentaire_scolarite}</p>
                    </div>
                  )}
                  {claim.commentaire_enseignant && (
                    <div className="p-4 bg-accent-light rounded-lg">
                      <p className="text-sm font-medium text-accent mb-2">Enseignant</p>
                      <p className="text-foreground">{claim.commentaire_enseignant}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* History / Timeline */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-5 font-outfit">Historique des actions</h2>
              <div className="space-y-6">
                {claim.historiques?.map((item: any, idx: number) => (
                  <div key={item.id} className="relative pl-8 pb-2">
                    {/* Line connection */}
                    {idx !== claim.historiques.length - 1 && (
                      <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-muted" />
                    )}

                    {/* Circle icon */}
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-accent-light border-2 border-accent flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <span className="font-semibold text-sm text-foreground">{item.action}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {format(new Date(item.created_at), 'dd/MM/yy HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1 italic">
                        Par: {item.user?.name || 'Système'}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed italic">
                        "{item.details}"
                      </p>
                    </div>
                  </div>
                ))}
                {(!claim.historiques || claim.historiques.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun historique disponible.</p>
                )}
              </div>
            </div>

            {/* Action Panel */}
            {canProcess() && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-5">Actions</h2>

                {user?.role === 'registrar' && ['SOUMISE', 'RECUE_SCOLARITE'].includes(claim.statut) && (
                  <div className="space-y-4">
                    <div>
                      <Label className="form-label">Commentaire</Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ajoutez un commentaire (optionnel)..."
                        className="bg-background"
                      />
                    </div>
                    <div className="flex gap-3">
                      {claim.statut === 'SOUMISE' && (
                        <Button
                          onClick={() => handleAction('validate')}
                          disabled={isProcessing}
                          variant="outline"
                          className="gap-2 flex-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Réceptionner
                        </Button>
                      )}
                      <Button
                        onClick={() => handleAction('send_da')}
                        disabled={isProcessing}
                        className="bg-gradient-accent hover:opacity-90 text-accent-foreground gap-2 flex-1"
                      >
                        <Send className="w-4 h-4" />
                        Envoyer au DA
                      </Button>
                      <Button
                        onClick={() => handleAction('reject')}
                        disabled={isProcessing}
                        variant="destructive"
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                )}

                {user?.role === 'admin' && claim.statut === 'ENVOYEE_DA' && (
                  <div className="space-y-4">
                    <div>
                      <Label className="form-label">Assigner à un enseignant</Label>
                      <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Sélectionnez un enseignant" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers
                            .filter(t => !claim.enseignant_id || t.id.toString() === claim.enseignant_id.toString())
                            .map((t) => (
                              <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="form-label">Instructions / Commentaire</Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Instructions pour l'enseignant..."
                        className="bg-background"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAction('assign')}
                        disabled={isProcessing || !selectedTeacher}
                        className="bg-gradient-accent hover:opacity-90 text-accent-foreground gap-2 flex-1"
                      >
                        <UserCog className="w-4 h-4" />
                        Imputer la réclamation
                      </Button>
                      <Button
                        onClick={() => handleAction('reject')}
                        disabled={isProcessing}
                        variant="destructive"
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                )}

                {user?.role === 'teacher' && claim.statut === 'IMPUTEE_ENSEIGNANT' && (
                  <div className="space-y-4">
                    <div>
                      <Label className="form-label">Nouvelle note</Label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Entrez la nouvelle note"
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label className="form-label">Justification</Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Expliquez votre décision..."
                        className="bg-background"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAction('validate_note')}
                        disabled={isProcessing}
                        className="bg-status-success hover:bg-status-success/90 text-white gap-2 flex-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Valider
                      </Button>
                      <Button
                        onClick={() => handleAction('reject')}
                        disabled={isProcessing}
                        variant="destructive"
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Student Info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Étudiant
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nom complet</p>
                  <p className="font-medium text-foreground">{claim.nom_prenom}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Filière</p>
                  <p className="font-medium text-foreground">{claim.filiere_niveau}</p>
                </div>
              </div>
            </div>

            {/* Subject Info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                Matière
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nom</p>
                  <p className="font-medium text-foreground">{claim.matiere?.name || claim.matiere?.nom || 'Non spécifiée'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Enseignant</p>
                  <p className="font-medium text-foreground">{claim.enseignant?.name || claim.enseignant_nom || 'Non spécifié'}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Chronologie
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Créée le</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(claim.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mise à jour</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(claim.updated_at), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
