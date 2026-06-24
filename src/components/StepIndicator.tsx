import { usePipeline } from '../stores/pipelineStore';

const STEPS = [
  { label: 'Input Data', key: 0 },
  { label: 'Analisis CP → TP → ATP', key: 1 },
  { label: 'Prota + Prosem', key: 2 },
  { label: 'Modul Ajar', key: 3 },
  { label: 'LKPD', key: 4 },
  { label: 'Asesmen + Rubrik', key: 5 },
];

export default function StepIndicator() {
  const { state, dispatch } = usePipeline();

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-3 px-2 no-print">
      {STEPS.map((step, idx) => {
        const isActive = state.currentStep === step.key;
        const isCompleted = state.currentStep > step.key;
        const isClickable = step.key <= state.currentStep + 1;

        return (
          <button
            key={step.key}
            disabled={!isClickable}
            onClick={() => {
              if (isClickable) dispatch({ type: 'SET_STEP', payload: step.key as any });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
              ${isActive
                ? 'bg-emerald-600 text-white shadow-sm'
                : isCompleted
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
              ${isClickable && !isActive && !isCompleted ? 'hover:bg-slate-200 text-slate-600 cursor-pointer' : ''}
              disabled:opacity-60`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
              ${isActive ? 'bg-white/20 text-white' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-500'}`}
            >
              {isCompleted ? '✓' : idx + 1}
            </span>
            {step.label}
          </button>
        );
      })}
    </div>
  );
}
