import { ClaimStatus, STATUS_CONFIG } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ClaimStatus;
  className?: string;
}

const variantStyles = {
  pending: 'bg-status-pending-bg text-status-pending-text',
  success: 'bg-status-success-bg text-status-success-text',
  error: 'bg-status-error-bg text-status-error-text',
  info: 'bg-status-info-bg text-status-info-text',
  processing: 'bg-status-processing-bg text-status-processing-text',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  return (
    <span
      className={cn(
        'status-badge',
        variantStyles[config.variant],
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        config.variant === 'pending' && 'bg-status-pending',
        config.variant === 'success' && 'bg-status-success',
        config.variant === 'error' && 'bg-status-error',
        config.variant === 'info' && 'bg-status-info',
        config.variant === 'processing' && 'bg-status-processing animate-pulse',
      )} />
      {config.label}
    </span>
  );
}
