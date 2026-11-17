import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  Eraser,
  Eye,
  EyeOff,
  FlipHorizontal2,
  Magnet,
  PenTool,
  Redo2,
  RotateCcw,
  Ruler,
  Search,
  Stamp,
  Trash2,
  Triangle,
  Undo2,
} from 'lucide-react';
import { Translations } from '../i18n/translations';
import {
  Language,
  MarkType,
  ToolId,
  ToolPoses,
  WorkspaceMode,
} from '../types/geometry';

interface RightToolKitProps {
  lang: Language;
  t: Translations;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  poses: ToolPoses;
  onUpdatePoses: (poses: ToolPoses) => void;
  activeMarkType: MarkType;
  onSelectMarkType: (mark: MarkType) => void;
  lineStyle: 'solid' | 'construction';
  onChangeLineStyle: (s: 'solid' | 'construction') => void;
  snapEnabled: boolean;
  onToggleSnap: () => void;
  loupeEnabled: boolean;
  onToggleLoupe: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetOrClear: () => void;
  mode: WorkspaceMode;
  onDrawAlongRuler: () => void;
  onDrawAlongSquareBase: () => void;
  onDrawAlongSquareLeg: () => void;
  onSweepCompassArc: (spanDeg: number) => void;
  onMarkProtractorAngle: () => void;
  onExportSheetPng: () => void;
}

export function RightToolKit({
  lang,
  t,
  collapsed,
  onToggleCollapse,
  activeTool,
  onSelectTool,
  poses,
  onUpdatePoses,
  activeMarkType,
  onSelectMarkType,
  lineStyle,
  onChangeLineStyle,
  snapEnabled,
  onToggleSnap,
  loupeEnabled,
  onToggleLoupe,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetOrClear,
  mode,
  onDrawAlongRuler,
  onDrawAlongSquareBase,
  onDrawAlongSquareLeg,
  onSweepCompassArc,
  onMarkProtractorAngle,
  onExportSheetPng,
}: RightToolKitProps) {
  if (collapsed) {
    return (
      <aside className="fixed right-3 top-18 z-20">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          title={t.controls.expandPanel}
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          <Compass className="w-4 h-4 text-sky-600" />
          <span className="whitespace-nowrap">{t.rightDeckTitle}</span>
        </button>
      </aside>
    );
  }

  const toolsList: { id: ToolId; label: string; icon: typeof Ruler; color: string }[] = [
    { id: 'ruler', label: t.tools.ruler, icon: Ruler, color: 'text-sky-600' },
    { id: 'setSquare', label: t.tools.setSquare, icon: Triangle, color: 'text-cyan-700' },
    { id: 'protractor', label: t.tools.protractor, icon: Compass, color: 'text-amber-600' },
    { id: 'compass', label: t.tools.compass, icon: Compass, color: 'text-blue-700' },
    { id: 'pencil', label: t.tools.pencil, icon: PenTool, color: 'text-amber-700' },
    { id: 'mark', label: t.tools.mark, icon: Stamp, color: 'text-rose-600' },
    { id: 'eraser', label: t.tools.eraser, icon: Eraser, color: 'text-slate-600' },
  ];

  const physicalTool =
    activeTool === 'ruler' ||
    activeTool === 'setSquare' ||
    activeTool === 'protractor' ||
    activeTool === 'compass'
      ? activeTool
      : null;

  const isPhysicalInstrument = physicalTool !== null;

  const isToolVisible = physicalTool
    ? poses.visibleTools[physicalTool]
    : false;

  const toggleInstrumentVisibility = (
    tool: 'ruler' | 'setSquare' | 'protractor' | 'compass',
  ) => {
    onUpdatePoses({
      ...poses,
      visibleTools: {
        ...poses.visibleTools,
        [tool]: !poses.visibleTools[tool],
      },
    });
  };

  return (
    <aside
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="w-72 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 z-10 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 min-w-0">
          <Ruler className="w-4 h-4 text-amber-600 shrink-0" />
          <h2 className="font-display text-sm font-bold text-slate-900 truncate">
            {t.rightDeckTitle}
          </h2>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
          title={t.controls.collapsePanel}
          aria-label={t.controls.collapsePanel}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto lab-scroll p-4 space-y-5">
        {/* 1. Child-Centered Tool Kit Box */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 mb-2">
            {t.sections.toolKit}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {toolsList.map((tool) => {
              const Icon = tool.icon;
              const active = activeTool === tool.id;
              const physicalKey =
                tool.id === 'ruler' ||
                tool.id === 'setSquare' ||
                tool.id === 'protractor' ||
                tool.id === 'compass'
                  ? tool.id
                  : null;
              const onDesk = physicalKey ? poses.visibleTools[physicalKey] : false;

              return (
                <div
                  key={tool.id}
                  className={`relative flex items-stretch rounded-xl border transition-colors min-h-[44px] overflow-hidden ${
                    active
                      ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectTool(tool.id)}
                    className="flex-1 flex items-center gap-2 px-2.5 py-2 text-start cursor-pointer min-w-0"
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-white' : tool.color
                      }`}
                    />
                    <span className="text-xs font-bold truncate">{tool.label}</span>
                  </button>
                  {physicalKey && (
                    <button
                      type="button"
                      onClick={() => toggleInstrumentVisibility(physicalKey)}
                      title={
                        onDesk
                          ? t.controls.hideToolFromDesk
                          : t.controls.showToolOnDesk
                      }
                      aria-label={
                        onDesk
                          ? t.controls.hideToolFromDesk
                          : t.controls.showToolOnDesk
                      }
                      className={`px-2 flex items-center justify-center border-s transition-colors cursor-pointer shrink-0 ${
                        active
                          ? 'border-sky-500 hover:bg-sky-700 text-amber-200'
                          : onDesk
                          ? 'border-slate-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          : 'border-slate-200 hover:bg-slate-100 text-slate-400'
                      }`}
                    >
                      {onDesk ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
            {t.toolDescriptions[activeTool]}
          </p>
        </section>

        {/* 2. Active Tool Precision Controls */}
        <section className="pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-slate-500">
              {t.sections.toolAdjustments}
            </h3>
            {isPhysicalInstrument && (
              <button
                type="button"
                onClick={() =>
                  toggleInstrumentVisibility(
                    activeTool as 'ruler' | 'setSquare' | 'protractor' | 'compass',
                  )
                }
                className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                {isToolVisible ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.controls.hideToolFromDesk}</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.controls.showToolOnDesk}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Ruler Controls */}
          {activeTool === 'ruler' && (
            <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <SliderControl
                label={t.controls.positionX}
                value={poses.ruler.x}
                min={-12}
                max={12}
                step={0.5}
                unit={t.status.cmUnit}
                onChange={(v) =>
                  onUpdatePoses({ ...poses, ruler: { ...poses.ruler, x: v } })
                }
              />
              <SliderControl
                label={t.controls.positionY}
                value={poses.ruler.y}
                min={-8}
                max={8}
                step={0.5}
                unit={t.status.cmUnit}
                onChange={(v) =>
                  onUpdatePoses({ ...poses, ruler: { ...poses.ruler, y: v } })
                }
              />
              <SliderControl
                label={t.controls.angleDeg}
                value={poses.ruler.angleDeg}
                min={0}
                max={360}
                step={5}
                unit={t.status.degUnit}
                onChange={(v) =>
                  onUpdatePoses({
                    ...poses,
                    ruler: { ...poses.ruler, angleDeg: v },
                  })
                }
              />
              <button
                type="button"
                onClick={onDrawAlongRuler}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {t.controls.drawAlongRuler}
              </button>
            </div>
          )}

          {/* Set Square Controls */}
          {activeTool === 'setSquare' && (
            <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <SliderControl
                label={t.controls.positionX}
                value={poses.setSquare.x}
                min={-11}
                max={11}
                step={0.5}
                unit={t.status.cmUnit}
                onChange={(v) =>
                  onUpdatePoses({
                    ...poses,
                    setSquare: { ...poses.setSquare, x: v },
                  })
                }
              />
              <SliderControl
                label={t.controls.positionY}
                value={poses.setSquare.y}
                min={-8}
                max={8}
                step={0.5}
                unit={t.status.cmUnit}
                onChange={(v) =>
                  onUpdatePoses({
                    ...poses,
                    setSquare: { ...poses.setSquare, y: v },
                  })
                }
              />
              <SliderControl
                label={t.controls.angleDeg}
                value={poses.setSquare.angleDeg}
                min={0}
                max={360}
                step={5}
                unit={t.status.degUnit}
                onChange={(v) =>
                  onUpdatePoses({
                    ...poses,
                    setSquare: { ...poses.setSquare, angleDeg: v },
                  })
                }
              />
              <button
                type="button"
                onClick={() =>
                  onUpdatePoses({
                    ...poses,
                    setSquare: {
                      ...poses.setSquare,
                      flipped: !poses.setSquare.flipped,
                    },
                  })
                }
                className="w-full flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold cursor-pointer"
              >
                <FlipHorizontal2 className="w-3.5 h-3.5" />
                <span>{t.controls.flipSetSquare}</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onDrawAlongSquareBase}
                  className="py-2 px-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                >
                  {t.controls.drawAlongSquareBase}
                </button>
                <button
                  type="button"
                  onClick={onDrawAlongSquareLeg}
                  className="py-2 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  {t.controls.drawAlongSquareLeg}
                </button>
              </div>
            </div>
          )}

          {/* Protractor Controls */}
          {activeTool === 'protractor' && (
            <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <SliderControl
                label={t.controls.positionX}
                value={poses.protractor.x}
                min={-11}
                max={11}
                step={0.5}
                unit={t.status.cmUnit}
                onChange={(v) =>
                  onUpdatePoses({
                    ...poses,
                    protractor: { ...poses.protractor, x: v },
                  })
                }
              />
              <SliderControl
                label={t.controls.positionY}
                value={poses.protractor.y}
                min={-8}
                max={8}
                step={0.5}
                unit={t.status.cmUnit}
                onChange={(v) =>
                  onUpdatePoses({
                    ...poses,
                    protractor: { ...poses.protractor, y: v },
                  })
                }
              />
              <SliderControl
                label={t.controls.angleDeg}
                value={poses.protractor.angleDeg}
                min={0}
                max={360}
                step={5}
                unit={t.status.degUnit}
                onChange={(v) =>
                  onUpdatePoses({
                    ...poses,
                    protractor: { ...poses.protractor, angleDeg: v },
                  })
                }
              />
              <SliderControl
                label={t.controls.targetAngleDeg}
                value={poses.protractor.measureDeg}
                min={0}
                max={180}
                step={5}
                unit={t.status.degUnit}
                onChange={(v) =>
                  onUpdatePoses({
                    ...poses,
                    protractor: { ...poses.protractor, measureDeg: v },
                  })
                }
              />
              <button
                type="button"
                onClick={onMarkProtractorAngle}
                className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {t.controls.markAngleRay}
              </button>
            </div>
          )}

          {/* Compass Controls */}
          {activeTool === 'compass' && (
            <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <SliderControl
                label={t.controls.radiusCm}
                value={poses.compass.radiusCm}
                min={0.5}
                max={10.0}
                step={0.5}
                unit={t.status.cmUnit}
                onChange={(v) =>
                  onUpdatePoses({
                    ...poses,
                    compass: { ...poses.compass, radiusCm: v },
                  })
                }
              />
              <SliderControl
                label={t.controls.angleDeg}
                value={Math.round(poses.compass.armAngleDeg)}
                min={-180}
                max={180}
                step={15}
                unit={t.status.degUnit}
                onChange={(v) =>
                  onUpdatePoses({
                    ...poses,
                    compass: { ...poses.compass, armAngleDeg: v },
                  })
                }
              />
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => onSweepCompassArc(90)}
                  className="py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t.controls.sweepArc90}
                </button>
                <button
                  type="button"
                  onClick={() => onSweepCompassArc(60)}
                  className="py-2 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t.controls.sweepArc60}
                </button>
                <button
                  type="button"
                  onClick={() => onSweepCompassArc(360)}
                  className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t.controls.drawFullCircle}
                </button>
              </div>
            </div>
          )}

          {/* Pencil Line Style */}
          {activeTool === 'pencil' && (
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => onChangeLineStyle('solid')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  lineStyle === 'solid'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {t.controls.lineStyleSolid}
              </button>
              <button
                type="button"
                onClick={() => onChangeLineStyle('construction')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  lineStyle === 'construction'
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {t.controls.lineStyleConstruction}
              </button>
            </div>
          )}

          {/* Exam Coding Marks */}
          {activeTool === 'mark' && (
            <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {(
                [
                  'right-angle',
                  'equal-1',
                  'equal-2',
                  'angle-arc',
                  'point-label',
                ] as MarkType[]
              ).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onSelectMarkType(m)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeMarkType === m
                      ? 'bg-rose-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t.marks[m]}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 3. Precision Aids (Magnetic Snap & Smart Loupe) */}
        <section className="pt-3 border-t border-slate-200 space-y-2">
          <h3 className="text-xs font-bold text-slate-500 mb-2">
            {t.sections.precisionAids}
          </h3>
          <button
            type="button"
            onClick={onToggleSnap}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              snapEnabled
                ? 'bg-amber-50 border-amber-400 text-amber-900'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <Magnet className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t.controls.magneticSnap}</span>
            </span>
            <span className="font-mono-num text-[11px]">
              {snapEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleLoupe}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              loupeEnabled
                ? 'bg-sky-50 border-sky-400 text-sky-900'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{t.controls.smartLoupe}</span>
            </span>
            <span className="font-mono-num text-[11px]">3×</span>
          </button>
        </section>

        {/* 4. Undo / Redo / Reset */}
        <section className="pt-3 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              disabled={!canUndo}
              onClick={onUndo}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-slate-700 cursor-pointer disabled:cursor-not-allowed"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>{t.controls.undo}</span>
            </button>
            <button
              type="button"
              disabled={!canRedo}
              onClick={onRedo}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-slate-700 cursor-pointer disabled:cursor-not-allowed"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span>{t.controls.redo}</span>
            </button>
            <button
              type="button"
              onClick={onResetOrClear}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 cursor-pointer"
            >
              {mode === 'sandbox' ? (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="truncate">{t.controls.clearSheet}</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="truncate">{t.controls.resetLesson}</span>
                </>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={onExportSheetPng}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>{t.controls.exportSheetPng}</span>
          </button>
        </section>
      </div>
    </aside>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-mono-num font-bold text-slate-900">
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-sky-600 cursor-pointer"
      />
    </div>
  );
}
