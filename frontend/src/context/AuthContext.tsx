import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types';
import api from '@/lib/axios';

interface AuthContextType {
  user: User | null;
  /** Connexion de l'utilisateur */
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  /** Inscription d'un nouvel utilisateur */
  register: (email: string, password: string, name: string, role: UserRole, filiereId?: number) => Promise<void>;
  /** Déconnexion */
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_IDS: Record<UserRole, number> = {
  student: 1,
  registrar: 2,
  teacher: 3,
  admin: 4,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Vérifie si un jeton est présent et valide l'utilisateur auprès de l'API.
   */
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/user');
      setUser(mapBackendUserToFrontend(response.data));
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const mapBackendUserToFrontend = (backendUser: any): User => ({
    id: backendUser.id.toString(),
    email: backendUser.email,
    name: backendUser.name,
    role: backendUser.role.name as UserRole,
    filiere: backendUser.filiere ? {
      id: backendUser.filiere.id.toString(),
      name: backendUser.filiere.name || backendUser.filiere.nom, // Fix TS lint: use 'name' to match type, fallback to 'nom'
      nom: backendUser.filiere.nom || backendUser.filiere.name,
      niveau: backendUser.filiere.niveau,
    } : undefined,
  });

  /**
   * Connecte l'utilisateur et stocke le token.
   */
  const login = async (email: string, password: string, role: UserRole) => {
    try {
      // Note : Nous n'avons pas strictement besoin d'envoyer le rôle pour la connexion si le backend vérifie juste email/mdp
      // Mais cela permet de vérifier si l'utilisateur a le rôle attendu.
      // Pour l'instant, connexion standard.
      const response = await api.post('/login', {
        email,
        password,
        role_name: role
      });

      const { token, user: backendUser } = response.data;
      localStorage.setItem('token', token);

      const user = mapBackendUserToFrontend(backendUser);

      // Optionnel : Vérifier si l'utilisateur connecté correspond au rôle sélectionné
      if (user.role !== role) {
        // On pourrait bloquer, mais pour cette app, on avertit juste.
        console.warn(`Utilisateur connecté en tant que ${user.role} mais a choisi ${role}`);
      }

      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Inscrit un nouvel utilisateur.
   */
  const register = async (email: string, password: string, name: string, role: UserRole, filiereId?: number) => {
    try {
      const response = await api.post('/register', {
        email,
        password,
        password_confirmation: password,
        name,
        role_id: ROLE_IDS[role],
        filiere_id: role === 'student' ? filiereId : null,
      });

      const { token, user: backendUser } = response.data;
      localStorage.setItem('token', token);
      setUser(mapBackendUserToFrontend(backendUser));
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message);
      throw error;
    }
  };

  /**
   * Déconnecte l'utilisateur et supprime le token.
   */
  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
