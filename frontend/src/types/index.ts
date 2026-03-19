// Rôles Utilisateurs
export type UserRole = 'student' | 'registrar' | 'teacher' | 'admin';

// Statut de la réclamation
export type ClaimStatus =
  | 'SOUMISE'
  | 'RECUE_SCOLARITE'
  | 'REJETEE_SCOLARITE'
  | 'ENVOYEE_DA'
  | 'IMPUTEE_ENSEIGNANT'
  | 'VALIDEE'
  | 'NON_VALIDEE'
  | 'REJETEE_DA';

// Interface Utilisateur
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  filiere?: Filiere;
}

// Interface Réclamation / Demande
export interface Claim {
  id: string;
  nom_prenom: string;
  filiere_niveau: string;
  matiere_id: string;
  matiere?: {
    id: string;
    name: string;
    nom: string;
    code: string;
  };
  enseignant_id?: string;
  enseignant?: {
    id: string;
    name: string;
  };
  enseignant_nom?: string;
  objet: string;
  objectif: string;
  motif: string;
  justification_url?: string;
  statut: ClaimStatus;
  note_actuelle?: number;
  note_demandee?: number;
  note_finale?: number;
  commentaire_scolarite?: string;
  commentaire_enseignant?: string;
  created_at: string;
  updated_at: string;
  student_id: string;
}

// Interface Matière
export interface Subject {
  id: string;
  nom: string;
  code: string;
  enseignant_id: string;
  filiere_id: string;
}

// Interface Filière
export interface Filiere {
  id: string;
  name: string;
  nom: string;
  niveau: string;
}

// Interface Notification
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  claim_id?: string;
  created_at: string;
}

// Interface Statistiques Dashboard
export interface DashboardStats {
  totalClaims: number;
  pendingClaims: number;
  resolvedClaims: number;
  rejectedClaims: number;
}

// Libellés et Couleurs des status
export const STATUS_CONFIG: Record<ClaimStatus, { label: string; variant: 'pending' | 'success' | 'error' | 'info' | 'processing' }> = {
  SOUMISE: { label: 'Soumise', variant: 'info' },
  RECUE_SCOLARITE: { label: 'Reçue Scolarité', variant: 'pending' },
  REJETEE_SCOLARITE: { label: 'Rejetée Scolarité', variant: 'error' },
  ENVOYEE_DA: { label: 'Envoyée au DA', variant: 'processing' },
  IMPUTEE_ENSEIGNANT: { label: 'En cours de traitement', variant: 'processing' },
  VALIDEE: { label: 'Validée', variant: 'success' },
  NON_VALIDEE: { label: 'Non validée', variant: 'error' },
  REJETEE_DA: { label: 'Rejetée par le DA', variant: 'error' },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Étudiant',
  registrar: 'Agent Scolarité',
  teacher: 'Enseignant',
  admin: 'Directeur Académique',
};
