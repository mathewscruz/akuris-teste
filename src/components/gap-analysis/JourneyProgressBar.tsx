import { CheckCircle2, BookOpen, ClipboardCheck, Wrench, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyProgressBarProps {
  evaluatedRequirements: number;
  totalRequirements: number;
  conformeCount: number;
  hasActionPlans: boolean;
}

const STEPS = [
  {
    id: 1,
    label: 'Conhecer o Framework',
    description: 'Entenda os requisitos e o roteiro de avaliação',
    icon: BookOpen,
  },
  {
    id: 2,
    label: 'Avaliar Requisitos',
    description: 'Avalie cada requisito com ajuda da IA',
    icon: ClipboardCheck,
  },
  {
    id: 3,
    label: 'Tratar Gaps',
    description: 'Crie planos de ação para itens não conformes',
    icon: Wrench,
  },
  {
    id: 4,
    label: 'Certificar',
    description: 'Maturidade elevada — pronto para auditoria',
    icon: Award,
  },
];

function calculateCurrentStep(
  evaluated: number,
  total: number,
  conformeCount: number,
  hasActionPlans: boolean
): number {
  if (total === 0 || evaluated === 0) return 1;
  const applicableEvaluated = evaluated;
  const percentEvaluated = (applicableEvaluated / total) * 100;
  const percentConforme = total > 0 ? (conformeCount / total) * 100 : 0;

  if (percentConforme >= 80) return 4;
  if (percentEvaluated >= 50 && hasActionPlans) return 3;
  if (percentEvaluated > 0) return 2;
  return 1;
}

export function JourneyProgressBar({
  evaluatedRequirements,
  totalRequirements,
  conformeCount,
  hasActionPlans,
}: JourneyProgressBarProps) {
  const currentStep = calculateCurrentStep(
    evaluatedRequirements,
    totalRequirements,
    conformeCount,
    hasActionPlans
  );

  return (
    <div className="bg-card border rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-foreground">Sua Jornada de Certificação</h3>
        <span className="text-xs text-muted-foreground">Etapa {currentStep} de 4</span>
      </div>

      {/* Progress bar with steps */}
      <div className="relative mt-4">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
        {/* Active line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        <div className="relative flex justify-between">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center text-center w-1/4">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isCurrent
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-background border-muted-foreground/30 text-muted-foreground/50'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[11px] mt-2 font-medium leading-tight hidden sm:block',
                    isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current step hint */}
      <p className="text-xs text-muted-foreground mt-4 text-center">
        {STEPS[currentStep - 1].description}
      </p>
    </div>
  );
}
