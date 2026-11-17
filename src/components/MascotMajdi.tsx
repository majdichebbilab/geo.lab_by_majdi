import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Play,
  Square,
  XCircle,
} from 'lucide-react';
import { Translations, pickText } from '../i18n/translations';
import {
  CurriculumLesson,
  Language,
  VerificationResult,
  WorkspaceMode,
} from '../types/geometry';

const TEACHER_LOGO_SRC =
  '/assets/aistudio/907839091_1760631539400894_1439018136014051481_n_639f1b42.jpg';

interface MascotMajdiProps {
  lang: Language;
  t: Translations;
  mode: WorkspaceMode;
  lesson: CurriculumLesson | null;
  stepIndex: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  speechText: string;
  isDemoRunning: boolean;
  demoProgress: number;
  onStartDemo: () => void;
  onStopDemo: () => void;
  onVerify: () => void;
  verification: VerificationResult | null;
  minimized: boolean;
  onToggleMinimize: () => void;
}

export function MascotMajdi({
  lang,
  t,
  mode,
  lesson,
  stepIndex,
  onPrevStep,
  onNextStep,
  speechText,
  isDemoRunning,
  demoProgress,
  onStartDemo,
  onStopDemo,
  onVerify,
  verification,
  minimized,
  onToggleMinimize,
}: MascotMajdiProps) {
  const totalSteps = lesson?.steps.length ?? 0;
  const currentStep = lesson && stepIndex < totalSteps ? lesson.steps[stepIndex] : null;

  if (minimized) {
    return (
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="w-full bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between gap-3 shrink-0"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onToggleMinimize}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-emerald-900 cursor-pointer shrink-0"
          >
            <img
              src={TEACHER_LOGO_SRC}
              alt={t.mentor.name}
              className="w-5 h-5 rounded-full object-cover border border-red-500/70 shrink-0"
            />
            <ChevronUp className="w-3.5 h-3.5" />
            <span>{t.mentor.name}</span>
          </button>
          {mode !== 'sandbox' && lesson && (
            <span className="text-xs font-medium text-slate-600 truncate">
              {pickText(lesson.title, lang)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {mode !== 'sandbox' && lesson && (
            <>
              {isDemoRunning ? (
                <button
                  type="button"
                  onClick={onStopDemo}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{t.controls.stopDemo}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onStartDemo}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.controls.showDemo}</span>
                </button>
              )}

              <button
                type="button"
                disabled={isDemoRunning}
                onClick={onVerify}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.controls.verifyWork}</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="w-full bg-white border-t border-slate-200 px-4 py-2.5 shrink-0"
    >
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        {/* Teacher Logo Avatar ("المعلم مجدي") */}
        <div className="w-12 h-12 rounded-full bg-white border-2 border-red-600/80 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
          <img
            src={TEACHER_LOGO_SRC}
            alt={t.mentor.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Instruction & Action Row */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-emerald-800 shrink-0">
                {t.mentor.name}
              </span>
              <span className="text-xs text-slate-700 font-medium truncate">
                {mode === 'guided' && currentStep && !isDemoRunning
                  ? `${t.status.stepOf} ${stepIndex + 1}/${totalSteps}: ${pickText(currentStep.instruction, lang)}`
                  : speechText}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {mode === 'guided' && currentStep && !isDemoRunning && (
                <>
                  <button
                    type="button"
                    disabled={stepIndex === 0}
                    onClick={onPrevStep}
                    className="p-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
                    aria-label={t.controls.prevStep}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={stepIndex >= totalSteps - 1}
                    onClick={onNextStep}
                    className="p-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
                    aria-label={t.controls.nextStep}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onToggleMinimize}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title={t.controls.collapsePanel}
                aria-label={t.controls.collapsePanel}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isDemoRunning && (
            <div className="mt-1.5 h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-150"
                style={{ width: `${Math.round(demoProgress * 100)}%` }}
              />
            </div>
          )}

          {verification && (
            <div
              className={`mt-1.5 px-2.5 py-1 rounded-lg border text-[11px] flex flex-wrap items-center gap-x-3 gap-y-0.5 ${
                verification.passed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {verification.checks.map((chk, idx) => (
                <span key={idx} className="flex items-center gap-1 font-semibold">
                  {chk.ok ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-amber-600 shrink-0" />
                  )}
                  <span>{pickText(chk.label, lang)}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Demo & Verify Buttons */}
        {mode !== 'sandbox' && lesson && (
          <div className="flex items-center gap-2 shrink-0">
            {isDemoRunning ? (
              <button
                type="button"
                onClick={onStopDemo}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t.controls.stopDemo}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartDemo}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.controls.showDemo}</span>
              </button>
            )}

            <button
              type="button"
              disabled={isDemoRunning}
              onClick={onVerify}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.controls.verifyWork}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
