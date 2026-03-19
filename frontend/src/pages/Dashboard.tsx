import { useAuth } from '@/context/AuthContext';
import StudentDashboard from './dashboards/StudentDashboard';
import RegistrarDashboard from './dashboards/RegistrarDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import { Navigate } from 'react-router-dom';

// Composant Dispatcher qui redirige vers le bon dashboard selon le rôle de l'utilisateur
export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'registrar':
      return <RegistrarDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
}
