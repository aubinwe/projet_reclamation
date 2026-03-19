import { ClaimStatus, STATUS_CONFIG } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ClaimWorkflowProps {
  currentStatus: ClaimStatus;
}

const WORKFLOW_STEPS: ClaimStatus[] = [
  'SOUMISE',
  'RECUE_SCOLARITE',
  'ENVOYEE_DA',
  'IMPUTEE_ENSEIGNANT',
  'VALIDEE',
];

const REJECTED_STATUSES: ClaimStatus[] = ['REJETEE_SCOLARITE', 'NON_VALIDEE', 'REJETEE_DA'];

// Composant visuel de suivi de l'état d'avancement
export function ClaimWorkflow({ currentStatus }: ClaimWorkflowProps) {
  const isRejected = REJECTED_STATUSES.includes(currentStatus);
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStatus);

  if (isRejected) {
    return (
      <div className="bg-status-error-bg border border-status-error/30 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-status-error/20 flex items-center justify-center">
            <span className="text-status-error text-xl">✕</span>
          </div>
          <div>
            <p className="font-semibold text-status-error-text">
              {currentStatus === 'REJETEE_SCOLARITE' ? 'Réclamation rejetée par la scolarité' :
                currentStatus === 'REJETEE_DA' ? 'Réclamation rejetée par le DA' :
                  'Réclamation non validée'}
            </p>
            <p className="text-sm text-status-error-text/70">
              Veuillez consulter les commentaires pour plus de détails.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-6">Suivi du processus</h3>

      <div className="flex items-center justify-between">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === WORKFLOW_STEPS.length - 1;
          const config = STATUS_CONFIG[step];

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted && 'bg-status-success border-status-success',
                    isCurrent && 'bg-accent border-accent ring-4 ring-accent-light',
                    !isCompleted && !isCurrent && 'bg-muted border-border'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-status-success-bg" />
                  ) : (
                    <span className={cn(
                      'text-sm font-semibold',
                      isCurrent ? 'text-accent-foreground' : 'text-muted-foreground'
                    )}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <p className={cn(
                  'text-xs mt-2 text-center max-w-[80px]',
                  isCurrent ? 'font-semibold text-accent' : 'text-muted-foreground'
                )}>
                  {config.label}
                </p>
              </div>

              {!isLast && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2',
                  isCompleted ? 'bg-status-success' : 'bg-border'
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
