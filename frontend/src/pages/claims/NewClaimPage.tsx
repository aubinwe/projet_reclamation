import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Send, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';

// Page de création d'une nouvelle réclamation
export default function NewClaimPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom_prenom: user?.name || '',
    filiere_niveau: user?.filiere ? `${user.filiere.name || user.filiere.nom} - ${user.filiere.niveau}` : '',
    matiere_id: '',
    enseignant_id: '',
    enseignant_nom: '',
    objet: '',
    objectif: '',
    motif: '',
    note_actuelle: '',
    note_demandee: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matieres, setMatieres] = useState<any[]>([]);

  // Filtrer les matières visibles selon la filière de l'étudiant
  const visibleMatieres = user?.filiere
    ? matieres.filter((m) => {
      const filiere = m?.filiere;
      const filiereId = filiere?.id?.toString?.() ?? filiere?.id?.toString?.();
      const userFiliereId = user.filiere?.id;
      if (filiereId && userFiliereId && filiereId === userFiliereId) return true;

      const filiereName = (filiere?.name || filiere?.nom || '').toString().trim();
      const userFiliereName = (user.filiere?.nom || '').toString().trim();
      const filiereNiveau = (filiere?.niveau || '').toString().trim();
      const userFiliereNiveau = (user.filiere?.niveau || '').toString().trim();

      return !!filiereName && !!userFiliereName && filiereName === userFiliereName && filiereNiveau === userFiliereNiveau;
    })
    : matieres;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/matieres');
        setMatieres(response.data);
      } catch (error) {
        console.error('Failed to fetch matieres', error);
      }
    };
    fetchData();
  }, []);

  const handleMatiereChange = (value: string) => {
    const selected = visibleMatieres.find((m) => m.id?.toString() === value);
    const enseignant = selected?.enseignant;

    setFormData((prev) => ({
      ...prev,
      matiere_id: value,
      enseignant_id: enseignant?.id ? enseignant.id.toString() : '',
      enseignant_nom: enseignant?.name || '',
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.filiere_niveau || !formData.matiere_id || !formData.objet || !formData.motif) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier si un enseignant est assigné à la matière
    const selectedMatiere = visibleMatieres.find((m) => m.id?.toString() === formData.matiere_id);
    if (selectedMatiere && !selectedMatiere.enseignant) {
      toast.error("Aucun enseignant n'est assigné à cette matière. Veuillez contacter l'administration.");
      return;
    }

    const noteActuelle = formData.note_actuelle === '' ? null : Number(formData.note_actuelle);
    const noteDemandee = formData.note_demandee === '' ? null : Number(formData.note_demandee);
    if (
      (noteActuelle !== null && (Number.isNaN(noteActuelle) || noteActuelle < 0 || noteActuelle > 20)) ||
      (noteDemandee !== null && (Number.isNaN(noteDemandee) || noteDemandee < 0 || noteDemandee > 20))
    ) {
      toast.error('Les notes doivent être comprises entre 0 et 20');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (file) {
        data.append('justification', file);
      }

      await api.post('/demandes', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Réclamation soumise avec succès !', {
        description: 'Votre demande est maintenant en attente de traitement par la scolarité.',
      });
      navigate('/claims');
    } catch (error: any) {
      console.error('Submission failed', error);
      toast.error('Une erreur est survenue lors de la soumission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Nouvelle réclamation
          </h1>
          <p className="text-muted-foreground">
            Remplissez le formulaire ci-dessous pour soumettre votre demande de révision de note.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-status-info-bg border border-status-info/30 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-status-info mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-status-info-text mb-1">Avant de soumettre</p>
            <p className="text-sm text-status-info-text/80">
              Assurez-vous d'avoir tous les justificatifs nécessaires. Une fois soumise,
              votre demande sera examinée par le service de la scolarité.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section Informations Personnelles */}
          <div className="form-section">
            <h2 className="text-lg font-semibold text-foreground mb-5">
              Informations personnelles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="nom_prenom" className="form-label">
                  Nom complet <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nom_prenom"
                  value={formData.nom_prenom}
                  onChange={(e) => setFormData({ ...formData, nom_prenom: e.target.value })}
                  placeholder="Votre nom et prénom"
                  className="bg-background"
                />
              </div>

              <div>
                <Label htmlFor="filiere_niveau" className="form-label">
                  Filière et niveau <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="filiere_niveau"
                  value={formData.filiere_niveau}
                  onChange={(e) => setFormData({ ...formData, filiere_niveau: e.target.value })}
                  placeholder="Ex: Informatique - Licence 2"
                  className="bg-background"
                />
              </div>
            </div>
          </div>

          {/* Section Matière */}
          <div className="form-section">
            <h2 className="text-lg font-semibold text-foreground mb-5">
              Matière concernée
            </h2>

            <div className="space-y-5">
              <div>
                <Label htmlFor="matiere" className="form-label">
                  Matière <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.matiere_id}
                  onValueChange={handleMatiereChange}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Sélectionnez la matière" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleMatieres.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name || s.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="enseignant_nom" className="form-label">
                  Enseignant responsable
                </Label>
                <Select
                  value={formData.enseignant_id}
                  onValueChange={(value) => {
                    const selectedMatiere = visibleMatieres.find((m) => m.id?.toString() === formData.matiere_id);
                    const enseignant = selectedMatiere?.enseignant;
                    if (enseignant && enseignant.id?.toString() === value) {
                      setFormData((prev) => ({
                        ...prev,
                        enseignant_id: value,
                        enseignant_nom: enseignant.name || '',
                      }));
                    }
                  }}
                  disabled={!formData.matiere_id || !visibleMatieres.find((m) => m.id?.toString() === formData.matiere_id)?.enseignant}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={formData.matiere_id ? "Enseignant assigné" : "Sélectionnez d'abord la matière"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const selectedMatiere = visibleMatieres.find((m) => m.id?.toString() === formData.matiere_id);
                      const enseignant = selectedMatiere?.enseignant;
                      return enseignant ? (
                        <SelectItem key={enseignant.id} value={enseignant.id.toString()}>
                          {enseignant.name}
                        </SelectItem>
                      ) : null;
                    })()}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="note_actuelle" className="form-label">
                    Note actuelle
                  </Label>
                  <Input
                    id="note_actuelle"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={formData.note_actuelle}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setFormData({ ...formData, note_actuelle: '' });
                        return;
                      }
                      const n = Number(raw);
                      if (Number.isNaN(n)) return;
                      const clamped = Math.min(20, Math.max(0, n));
                      if (clamped !== n) {
                        toast.error('La note ne doit pas être supérieure à 20');
                      }
                      setFormData({ ...formData, note_actuelle: clamped.toString() });
                    }}
                    placeholder="Ex: 12"
                    className="bg-background"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    La note qui figure actuellement sur votre bulletin
                  </p>
                </div>

                <div>
                  <Label htmlFor="note_demandee" className="form-label">
                    Note demandée
                  </Label>
                  <Input
                    id="note_demandee"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={formData.note_demandee}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setFormData({ ...formData, note_demandee: '' });
                        return;
                      }
                      const n = Number(raw);
                      if (Number.isNaN(n)) return;
                      const clamped = Math.min(20, Math.max(0, n));
                      if (clamped !== n) {
                        toast.error('La note ne doit pas être supérieure à 20');
                      }
                      setFormData({ ...formData, note_demandee: clamped.toString() });
                    }}
                    placeholder="Ex: 15"
                    className="bg-background"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Indiquez la note que vous estimez mériter (ex: 15)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Détails */}
          <div className="form-section">
            <h2 className="text-lg font-semibold text-foreground mb-5">
              Détails de la réclamation
            </h2>

            <div className="space-y-5">
              <div>
                <Label htmlFor="objet" className="form-label">
                  Objet <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="objet"
                  value={formData.objet}
                  onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                  placeholder="Ex: Erreur de calcul de la note finale"
                  className="bg-background"
                />
              </div>

              <div>
                <Label htmlFor="objectif" className="form-label">
                  Objectif
                </Label>
                <Input
                  id="objectif"
                  value={formData.objectif}
                  onChange={(e) => setFormData({ ...formData, objectif: e.target.value })}
                  placeholder="Ex: Correction de la note de 12 à 14"
                  className="bg-background"
                />
              </div>

              <div>
                <Label htmlFor="motif" className="form-label">
                  Motif détaillé <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="motif"
                  value={formData.motif}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  placeholder="Décrivez en détail les raisons de votre réclamation..."
                  className="bg-background min-h-[120px]"
                />
              </div>

              <div>
                <Label className="form-label">
                  Justificatif (PDF ou image)
                </Label>
                <div className="mt-1.5">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      {file ? (
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-accent">Cliquez pour télécharger</span> ou glissez-déposez
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG (max. 5MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-accent hover:opacity-90 text-accent-foreground gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Soumettre la réclamation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
