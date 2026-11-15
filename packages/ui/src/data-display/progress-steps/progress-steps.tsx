export type ProgressStep = {
  id: string;
  label: string;
};

export type ProgressStepsProps = {
  /** Array of step definitions with id and label */
  steps: readonly ProgressStep[];
  /** Current active step id */
  currentStep: string;
  /** Steps that have been completed (can be navigated back to) */
  completedSteps?: readonly string[];
  /** Optional callback when a step is clicked (if clickable) */
  onStepClick?: (stepId: string) => void;
  /** Whether steps can be clicked to navigate (default: false) */
  clickable?: boolean;
  /** Optional aria-label for the nav element */
  ariaLabel?: string;
};

/**
 * Displays a progress indicator showing numbered steps in a grid layout.
 * Matches lead-capture workflow styling with numbered circles and status colors.
 * Used to show workflow progression and optional navigation between steps.
 */
export function ProgressSteps({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  clickable = false,
  ariaLabel = 'Progress steps',
}: ProgressStepsProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  
  return (
    <nav aria-label={ariaLabel}>
      <ol className="m-0 grid list-none p-0 gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, index) => {
          const isCurrent = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isPast = index < currentIndex;
          
          return (
            <li key={step.id} aria-current={isCurrent ? 'step' : undefined} className="min-w-0">
              <button
                type="button"
                aria-label={`${index + 1}. ${step.label}`}
                disabled={!clickable || (!isCurrent && !isCompleted && !isPast)}
                onClick={() => onStepClick?.(step.id)}
                className={`flex h-full min-h-16 w-full min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-b-[3px] px-1 py-3 text-center text-base leading-tight font-bold focus-visible:focus-ring enabled:cursor-pointer disabled:cursor-default sm:flex-row sm:gap-3 sm:px-3 sm:text-lg transition-colors ${
                  isCurrent
                    ? 'border-primary border-b-primary-dark bg-seafoam text-ink'
                    : isPast
                    ? 'border-primary/35 border-b-primary bg-primary/10 text-primary-dark enabled:hover:bg-primary/15'
                    : 'border-line bg-paper text-ink'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-8 shrink-0 place-items-center rounded-full border text-sm sm:size-9 sm:text-base ${
                    isCurrent
                      ? 'border-current'
                      : isPast
                      ? 'border-primary text-primary-dark'
                      : 'border-line text-muted'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="wrap-anywhere">{step.label}</span>
              </button>
              {step.id !== currentStep && <span className="sr-only">{isPast ? 'completed' : 'upcoming'}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
