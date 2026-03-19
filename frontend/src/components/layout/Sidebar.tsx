import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  UserCog,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItemsByRole = {
  student: [
    { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Nouvelle réclamation', href: '/claims/new', icon: PlusCircle },
    { label: 'Mes réclamations', href: '/claims?filter=pending', icon: FileText },
    { label: 'Historique', href: '/claims?filter=processed', icon: History },
    { label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  registrar: [
    { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Réclamations', href: '/claims?filter=pending', icon: ClipboardCheck },
    { label: 'Historique', href: '/claims?filter=processed', icon: History },
    { label: 'Gestion des notes', href: '/grades', icon: BookOpen },
    { label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  teacher: [
    { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Réclamations assignées', href: '/claims?filter=pending', icon: FileText },
    { label: 'Historique', href: '/claims?filter=processed', icon: History },
    { label: 'Gestion des Notes', href: '/teacher/notes', icon: GraduationCap },
    { label: 'Mes matières', href: '/subjects', icon: BookOpen },
    { label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  admin: [
    { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Réclamations en cours', href: '/claims?filter=pending', icon: FileText },
    { label: 'Historique', href: '/claims?filter=processed', icon: History },
    { label: 'Gestion utilisateurs', href: '/users', icon: Users },
    { label: 'Enseignants', href: '/teachers', icon: UserCog },
    { label: 'Matières', href: '/subjects', icon: BookOpen },
    { label: 'Notifications', href: '/notifications', icon: Bell },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = navItemsByRole[user.role];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">IBAM</h1>
            <p className="text-[10px] text-sidebar-muted">Institut Burkinabé des Arts et Métiers</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const currentPath = location.pathname + location.search;
          const isActive = currentPath === item.href ||
            (item.href === '/claims' && currentPath.startsWith('/claims/')) ||
            (item.href === '/grades' && currentPath.startsWith('/grades/'));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn('sidebar-link', isActive && 'active')}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4 px-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-semibold text-sidebar-foreground">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-muted">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="sidebar-link w-full text-status-error hover:bg-status-error/10"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
