import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  default: 'bg-card',
  accent: 'bg-accent/10 border-accent/30',
  success: 'bg-status-success-bg border-status-success/30',
  warning: 'bg-status-pending-bg border-status-pending/30',
  error: 'bg-status-error-bg border-status-error/30',
};

const iconVariantStyles = {
  default: 'bg-primary/10 text-primary',
  accent: 'bg-accent/20 text-accent',
  success: 'bg-status-success/20 text-status-success',
  warning: 'bg-status-pending/20 text-status-pending-text',
  error: 'bg-status-error/20 text-status-error',
};

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: StatCardProps) {
  return (
    <div className={cn('stat-card', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              'text-sm font-medium mt-2',
              trend.isPositive ? 'text-status-success' : 'text-status-error'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs mois dernier
            </p>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          iconVariantStyles[variant]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
