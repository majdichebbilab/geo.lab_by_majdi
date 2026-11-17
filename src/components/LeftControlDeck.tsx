import {
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileSpreadsheet,
  Grid3X3,
  Layers,
  Star,
  Trophy,
} from 'lucide-react';
import { Translations, pickText } from '../i18n/translations';
import {
  CameraPreset,
  CurriculumLesson,
  Language,
  SheetType,
  WorkspaceMode,
} from '../types/geometry';

interface LeftControlDeckProps {
  lang: Language;
  t: Translations;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mode: WorkspaceMode;
  onChangeMode: (mode: WorkspaceMode) => void;
  lessons: CurriculumLesson[];
  activeLessonId: string;
  onSelectLesson: (id: string) => void;
  completedLessons: Record<string, number>;
  sheetType: SheetType;
  onChangeSheetType: (s: SheetType) => void;
  cameraPreset: CameraPreset;
  onChangeCameraPreset: (c: CameraPreset) => void;
}

export function LeftControlDeck({
  lang,
  t,
  collapsed,
  onToggleCollapse,
  mode,
  onChangeMode,
  lessons,
  activeLessonId,
  onSelectLesson,
  completedLessons,
  sheetType,
  onChangeSheetType,
  cameraPreset,
  onChangeCameraPreset,
}: LeftControlDeckProps) {
  if (collapsed) {
    return (
      <aside className="fixed left-3 top-18 z-20">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          title={t.controls.expandPanel}
        >
          <BookOpen className="w-4 h-4 text-sky-600" />
          <span className="whitespace-nowrap">{t.leftDeckTitle}</span>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-10 overflow-hidden"
    >
      {/* Deck Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-sky-700 shrink-0" />
          <h2 className="font-display text-sm font-bold text-slate-900 truncate">
            {t.leftDeckTitle}
          </h2>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
          title={t.controls.collapsePanel}
          aria-label={t.controls.collapsePanel}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto lab-scroll p-4 space-y-5">
        {/* 1. Modes */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 mb-2">
            {t.sections.modes}
          </h3>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(
              [
                { id: 'guided', label: t.modes.guided, icon: BookOpen },
                { id: 'challenge', label: t.modes.challenge, icon: Trophy },
                { id: 'sandbox', label: t.modes.sandbox, icon: Compass },
              ] as const
            ).map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangeMode(m.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-full">{m.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. 6th Grade Curriculum Lessons */}
        {mode !== 'sandbox' && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-500">
                {t.sections.curriculum}
              </h3>
              <span className="font-mono-num text-[11px] text-slate-500">
                {Object.keys(completedLessons).length}/{lessons.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {lessons.map((lesson) => {
                const active = lesson.id === activeLessonId;
                const stars = completedLessons[lesson.id] || 0;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onSelectLesson(lesson.id)}
                    className={`w-full text-start p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      active
                        ? 'bg-sky-50 border-sky-400 text-slate-900'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono-num text-xs font-bold shrink-0 ${
                            active
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {lesson.badgeCode}
                        </span>
                        <span className="text-xs font-bold truncate">
                          {lesson.order}. {pickText(lesson.title, lang)}
                        </span>
                      </div>
                      {stars > 0 && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-mono-num text-[11px] font-bold text-amber-600">
                            {stars}★
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {pickText(lesson.subtitle, lang)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Sheet Options */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 mb-2">
            {t.sections.sheetType}
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'plain', label: t.sheetTypes.plain, icon: Layers },
                { id: 'millimeter', label: t.sheetTypes.millimeter, icon: FileSpreadsheet },
                { id: 'dots', label: t.sheetTypes.dots, icon: Grid3X3 },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = sheetType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeSheetType(item.id)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-full">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Camera Views */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 mb-2">
            {t.sections.cameraView}
          </h3>
          <div className="space-y-1.5">
            {(
              [
                { id: 'classroom3d', label: t.cameraPresets.classroom3d },
                { id: 'top2d', label: t.cameraPresets.top2d },
                { id: 'zoomPaper', label: t.cameraPresets.zoomPaper },
              ] as const
            ).map((cam) => {
              const active = cameraPreset === cam.id;
              return (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => onChangeCameraPreset(cam.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 shrink-0" />
                    <span>{cam.label}</span>
                  </span>
                  {active && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
}
