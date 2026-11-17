import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  playGentleRetry,
  playPencilStroke,
  playSnapClick,
  playStampMark,
  playSuccessChime,
  playToolPick,
} from './audio/soundEngine';
import { CertificateModal } from './components/CertificateModal';
import { LeftControlDeck } from './components/LeftControlDeck';
import { MascotMajdi } from './components/MascotMajdi';
import { RightToolKit } from './components/RightToolKit';
import { SmartLoupe } from './components/SmartLoupe';
import { TopHeader } from './components/TopHeader';
import { GRADE6_LESSONS } from './curriculum/lessons';
import { degToRad, dist2D, pointToSegmentDist } from './geometry/mathKernel';
import { TRANSLATIONS, pickText } from './i18n/translations';
import {
  ClassroomCallbacks,
  ClassroomSceneController,
} from './three/classroomScene';
import {
  CameraPreset,
  GeoArc,
  GeoLine,
  GeoMark,
  GeoPoint,
  Language,
  LoupeState,
  MarkType,
  PreviewStroke,
  PupilProgress,
  SheetState,
  SheetType,
  SnapResult,
  ToolId,
  ToolPoses,
  VerificationResult,
  WorkspaceMode,
} from './types/geometry';

const STORAGE_KEY = 'geometry_lab_by_majdi_progress_v1';

const DEFAULT_POSES: ToolPoses = {
  ruler: { x: -7.5, y: -4, angleDeg: 0, lengthCm: 15 },
  setSquare: { x: -4.5, y: -2, angleDeg: 0, flipped: false, legCm: 9 },
  protractor: { x: 0, y: -2.5, angleDeg: 0, radiusCm: 5.5, measureDeg: 45 },
  compass: {
    cx: 0,
    cy: 0,
    radiusCm: 4.5,
    armAngleDeg: 35,
    sweepStartDeg: 35,
    sweeping: false,
    needlePlanted: true,
  },
  visibleTools: {
    ruler: true,
    setSquare: false,
    protractor: false,
    compass: false,
  },
};

const EMPTY_SHEET: SheetState = {
  points: [],
  lines: [],
  arcs: [],
  marks: [],
};

function cloneSheet(s: SheetState): SheetState {
  return {
    points: s.points.map((p) => ({ ...p })),
    lines: s.lines.map((l) => ({ ...l })),
    arcs: s.arcs.map((a) => ({ ...a })),
    marks: s.marks.map((m) => ({ ...m })),
  };
}

function mergePoses(base: ToolPoses, override?: Partial<ToolPoses>): ToolPoses {
  if (!override) return { ...base, visibleTools: { ...base.visibleTools } };
  return {
    ruler: { ...base.ruler, ...override.ruler },
    setSquare: { ...base.setSquare, ...override.setSquare },
    protractor: { ...base.protractor, ...override.protractor },
    compass: { ...base.compass, ...override.compass },
    visibleTools: { ...base.visibleTools, ...override.visibleTools },
  };
}

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const t = TRANSLATIONS[lang];

  const [mode, setMode] = useState<WorkspaceMode>('guided');
  const [activeLessonId, setActiveLessonId] = useState<string>(GRADE6_LESSONS[0].id);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const [sheetType, setSheetType] = useState<SheetType>('millimeter');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('top2d');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [mentorMinimized, setMentorMinimized] = useState(false);

  const activeLesson = useMemo(
    () => GRADE6_LESSONS.find((l) => l.id === activeLessonId) || GRADE6_LESSONS[0],
    [activeLessonId],
  );

  // Sheet state + Undo/Redo stacks
  const [sheet, setSheet] = useState<SheetState>(() =>
    cloneSheet(GRADE6_LESSONS[0].initialSheet),
  );
  const [undoStack, setUndoStack] = useState<SheetState[]>([]);
  const [redoStack, setRedoStack] = useState<SheetState[]>([]);

  const [activeTool, setActiveTool] = useState<ToolId>(
    GRADE6_LESSONS[0].steps[0]?.recommendedTool || 'compass',
  );
  const [activeMarkType, setActiveMarkType] = useState<MarkType>('right-angle');
  const [lineStyle, setLineStyle] = useState<'solid' | 'construction'>('solid');
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [loupeEnabled, setLoupeEnabled] = useState(false);
  const [poses, setPoses] = useState<ToolPoses>(() =>
    mergePoses(DEFAULT_POSES, GRADE6_LESSONS[0].initialPoses),
  );

  // Mentor text & Verification
  const [speechText, setSpeechText] = useState<string>(
    TRANSLATIONS.ar.mentor.welcomeGuided,
  );
  const [verification, setVerification] = useState<VerificationResult | null>(null);

  // Animated Demo state
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [demoPreview, setDemoPreview] = useState<PreviewStroke | null>(null);
  const [demoPencilPose, setDemoPencilPose] = useState<{
    x: number;
    y: number;
    liftCm?: number;
  } | null>(null);
  const demoCancelRef = useRef(false);

  // Loupe & CAD Telemetry hover state
  const [loupeState, setLoupeState] = useState<LoupeState>({
    active: false,
    paperX: 0,
    paperY: 0,
    screenX: 0,
    screenY: 0,
  });
  const [hoverTelemetry, setHoverTelemetry] = useState<{
    inside: boolean;
    x: number;
    y: number;
    snapLabel?: string;
  }>({ inside: false, x: 0, y: 0 });

  // Pupil Progress & Certificate Modal
  const [progress, setProgress] = useState<PupilProgress>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as PupilProgress;
    } catch {
      // ignore
    }
    return { pupilName: '', completedLessons: {} };
  });
  const [certOpen, setCertOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  // Sync HTML dir & lang attributes for bilingual typography
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Next letter for point labeling
  const nextPointLabel = useMemo(() => {
    const letters = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'M', 'N'];
    const used = new Set(sheet.points.map((p) => p.label).filter(Boolean));
    return letters.find((ch) => !used.has(ch)) || `P${sheet.points.length + 1}`;
  }, [sheet.points]);

  // Push sheet mutation with undo support
  const commitSheet = useCallback((updater: (prev: SheetState) => SheetState) => {
    setSheet((prev) => {
      const next = updater(prev);
      setUndoStack((u) => [...u.slice(-24), cloneSheet(prev)]);
      setRedoStack([]);
      return next;
    });
    setVerification(null);
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack((u) => {
      if (u.length === 0) return u;
      const last = u[u.length - 1];
      setSheet((cur) => {
        setRedoStack((r) => [...r, cloneSheet(cur)]);
        return last;
      });
      return u.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      setSheet((cur) => {
        setUndoStack((u) => [...u, cloneSheet(cur)]);
        return next;
      });
      return r.slice(0, -1);
    });
  }, []);

  // Load lesson or sandbox
  const loadLessonState = useCallback(
    (lessonId: string, nextMode: WorkspaceMode, activeLang: Language) => {
      demoCancelRef.current = true;
      setIsDemoRunning(false);
      setDemoProgress(0);
      setDemoPreview(null);
      setDemoPencilPose(null);
      setVerification(null);
      setUndoStack([]);
      setRedoStack([]);
      setStepIndex(0);

      if (nextMode === 'sandbox') {
        setSheet(cloneSheet(EMPTY_SHEET));
        setPoses(mergePoses(DEFAULT_POSES, { visibleTools: { ruler: true, setSquare: false, protractor: false, compass: false } }));
        setActiveTool('ruler');
        setSpeechText(TRANSLATIONS[activeLang].mentor.welcomeSandbox);
        return;
      }

      const target = GRADE6_LESSONS.find((l) => l.id === lessonId) || GRADE6_LESSONS[0];
      setSheet(cloneSheet(target.initialSheet));
      setPoses(mergePoses(DEFAULT_POSES, target.initialPoses));
      setActiveTool(target.steps[0]?.recommendedTool || 'ruler');
      const msg =
        nextMode === 'challenge'
          ? `${TRANSLATIONS[activeLang].mentor.welcomeChallenge} — ${pickText(target.subtitle, activeLang)}`
          : pickText(target.steps[0].instruction, activeLang);
      setSpeechText(msg);
    },
    [],
  );

  const handleChangeMode = (nextMode: WorkspaceMode) => {
    setMode(nextMode);
    loadLessonState(activeLessonId, nextMode, lang);
  };

  const handleSelectLesson = (id: string) => {
    setActiveLessonId(id);
    if (mode === 'sandbox') setMode('guided');
    loadLessonState(id, mode === 'sandbox' ? 'guided' : mode, lang);
  };

  const handleChangeLang = (nextLang: Language) => {
    setLang(nextLang);
    if (mode === 'sandbox') {
      setSpeechText(TRANSLATIONS[nextLang].mentor.welcomeSandbox);
    } else if (activeLesson.steps[stepIndex]) {
      setSpeechText(pickText(activeLesson.steps[stepIndex].instruction, nextLang));
    }
  };

  const handleSelectTool = (tool: ToolId) => {
    playToolPick();
    setActiveTool(tool);
    if (
      tool === 'ruler' ||
      tool === 'setSquare' ||
      tool === 'protractor' ||
      tool === 'compass'
    ) {
      setPoses((prev) => ({
        ...prev,
        visibleTools: { ...prev.visibleTools, [tool]: true },
      }));
    }
    // Smoothly transition from initial 3D overview to top-down 2D view when picking a drawing tool
    if (cameraPreset === 'classroom3d' && (tool === 'pencil' || tool === 'compass' || tool === 'mark')) {
      setCameraPreset('top2d');
    }
  };

  // Straightedge & Compass Quick Precision Actions
  const handleDrawAlongRuler = () => {
    const r = poses.ruler;
    const rad = degToRad(r.angleDeg);
    const len = Math.min(10, r.lengthCm);
    commitSheet((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          id: `line-${Date.now()}`,
          x1: r.x,
          y1: r.y,
          x2: r.x + len * Math.cos(rad),
          y2: r.y + len * Math.sin(rad),
          kind: 'segment',
          style: lineStyle,
          color: lineStyle === 'construction' ? '#2563eb' : '#0f172a',
        },
      ],
    }));
    playPencilStroke();
  };

  const handleDrawAlongSquareBase = () => {
    const sq = poses.setSquare;
    const rad = degToRad(sq.angleDeg);
    const len = sq.legCm;
    commitSheet((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          id: `line-${Date.now()}`,
          x1: sq.x,
          y1: sq.y,
          x2: sq.x + len * Math.cos(rad),
          y2: sq.y + len * Math.sin(rad),
          kind: 'segment',
          style: lineStyle,
          color: lineStyle === 'construction' ? '#2563eb' : '#0f172a',
        },
      ],
    }));
    playPencilStroke();
  };

  const handleDrawAlongSquareLeg = () => {
    const sq = poses.setSquare;
    const rad = degToRad(sq.angleDeg) + (sq.flipped ? -Math.PI / 2 : Math.PI / 2);
    const len = sq.legCm;
    commitSheet((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          id: `line-${Date.now()}`,
          x1: sq.x,
          y1: sq.y,
          x2: sq.x + len * Math.cos(rad),
          y2: sq.y + len * Math.sin(rad),
          kind: 'segment',
          style: lineStyle,
          color: lineStyle === 'construction' ? '#2563eb' : '#0f172a',
        },
      ],
    }));
    playPencilStroke();
  };

  const handleSweepCompassArc = (spanDeg: number) => {
    const c = poses.compass;
    const start = c.armAngleDeg - spanDeg / 2;
    const end = c.armAngleDeg + spanDeg / 2;
    const isCircle = spanDeg >= 360;
    commitSheet((prev) => ({
      ...prev,
      arcs: [
        ...prev.arcs,
        {
          id: `arc-${Date.now()}`,
          cx: c.cx,
          cy: c.cy,
          radiusCm: c.radiusCm,
          startDeg: isCircle ? 0 : start,
          endDeg: isCircle ? 360 : end,
          style: isCircle ? 'solid' : 'construction',
          color: isCircle ? '#0f172a' : '#2563eb',
        },
      ],
    }));
    playPencilStroke();
  };

  const handleMarkProtractorAngle = () => {
    const p = poses.protractor;
    const totalRad = degToRad(p.angleDeg + p.measureDeg);
    const len = 7.5;
    commitSheet((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          id: `line-${Date.now()}`,
          x1: p.x,
          y1: p.y,
          x2: p.x + len * Math.cos(totalRad),
          y2: p.y + len * Math.sin(totalRad),
          kind: 'segment',
          style: lineStyle,
          color: lineStyle === 'construction' ? '#2563eb' : '#0f172a',
        },
      ],
      marks: [
        ...prev.marks,
        {
          id: `mark-${Date.now()}`,
          type: 'angle-arc',
          x: p.x,
          y: p.y,
          angleDeg: p.angleDeg,
          color: '#d97706',
        },
      ],
    }));
    playPencilStroke();
  };

  const handleExportSheetPng = () => {
    const canvas = engineRef.current?.paperCanvas;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `geometry_lab_${activeLessonId}.png`;
    a.click();
  };

  // Animated Auto-Demo ("أرني كيف نبنيها")
  const handleStartDemo = async () => {
    if (mode === 'sandbox') return;
    demoCancelRef.current = false;
    setIsDemoRunning(true);
    setDemoProgress(0);
    setDemoPreview(null);
    setDemoPencilPose(null);
    setVerification(null);
    // Use 3D perspective framing so Compass lifts, leg spread, and cast shadows read clearly
    setCameraPreset('classroom3d');

    // Reset sheet cleanly so demo builds from scratch
    let workingSheet = cloneSheet(activeLesson.initialSheet);
    setSheet(workingSheet);
    const steps = activeLesson.demoSteps;
    let workingPoses = mergePoses(
      mergePoses(DEFAULT_POSES, activeLesson.initialPoses),
      steps[0]?.fromPose,
    );
    if (steps[0]?.tool === 'compass') {
      workingPoses = {
        ...workingPoses,
        visibleTools: {
          ruler: false,
          setSquare: false,
          protractor: false,
          compass: true,
        },
      };
    }
    setPoses(workingPoses);
    for (let i = 0; i < steps.length; i++) {
      if (demoCancelRef.current) break;
      const step = steps[i];
      setActiveTool(step.tool);

      // Clean instrument handoff so active tools stay visible without cluttering marks
      const nextVis = { ...workingPoses.visibleTools };
      if (step.tool === 'compass') {
        nextVis.compass = true;
        nextVis.ruler = false;
        nextVis.setSquare = false;
        nextVis.protractor = false;
      } else if (step.tool === 'ruler') {
        nextVis.ruler = true;
        nextVis.compass = false;
        nextVis.protractor = false;
      } else if (step.tool === 'setSquare') {
        nextVis.setSquare = true;
        nextVis.compass = false;
        nextVis.protractor = false;
      } else if (step.tool === 'pencil') {
        nextVis.compass = false;
      } else if (step.tool === 'mark') {
        nextVis.compass = false;
        nextVis.ruler = false;
        nextVis.setSquare = false;
        nextVis.protractor = false;
      }
      workingPoses = { ...workingPoses, visibleTools: nextVis };

      setSpeechText(pickText(step.speech, lang));

      const startPoses = mergePoses(workingPoses, step.fromPose);
      const endPoses = mergePoses(workingPoses, step.toPose);

      const durationMs = step.durationSec * 1000;
      const startTime = performance.now();

      await new Promise<void>((resolve) => {
        const tick = (now: number) => {
          if (demoCancelRef.current) {
            setDemoPreview(null);
            setDemoPencilPose(null);
            resolve();
            return;
          }
          const tRaw = Math.min(1, (now - startTime) / durationMs);
          // Smooth cubic ease-in-out for natural physical hand motion
          const ease =
            tRaw < 0.5
              ? 4 * tRaw * tRaw * tRaw
              : 1 - Math.pow(-2 * tRaw + 2, 3) / 2;

          const compassRelocating =
            step.isTransit &&
            step.tool === 'compass' &&
            startPoses.compass.needlePlanted === false;
          const compassLiftCm = compassRelocating
            ? Math.sin(Math.PI * tRaw) * 2.5
            : 0;
          const compassSweeping =
            Boolean(step.drawArc) && tRaw > 0.02 && tRaw < 0.98;
          const compassPlanted = compassRelocating
            ? tRaw >= 0.94
            : endPoses.compass.needlePlanted;

          const interp: ToolPoses = {
            ...workingPoses,
            ruler: {
              ...workingPoses.ruler,
              x: lerpNum(startPoses.ruler.x, endPoses.ruler.x, ease),
              y: lerpNum(startPoses.ruler.y, endPoses.ruler.y, ease),
              angleDeg: lerpNum(startPoses.ruler.angleDeg, endPoses.ruler.angleDeg, ease),
            },
            setSquare: {
              ...workingPoses.setSquare,
              x: lerpNum(startPoses.setSquare.x, endPoses.setSquare.x, ease),
              y: lerpNum(startPoses.setSquare.y, endPoses.setSquare.y, ease),
              angleDeg: lerpNum(startPoses.setSquare.angleDeg, endPoses.setSquare.angleDeg, ease),
            },
            compass: {
              ...workingPoses.compass,
              cx: lerpNum(startPoses.compass.cx, endPoses.compass.cx, ease),
              cy: lerpNum(startPoses.compass.cy, endPoses.compass.cy, ease),
              radiusCm: lerpNum(startPoses.compass.radiusCm, endPoses.compass.radiusCm, ease),
              armAngleDeg: lerpNum(
                startPoses.compass.armAngleDeg,
                endPoses.compass.armAngleDeg,
                ease,
              ),
              sweeping: compassSweeping,
              needlePlanted: compassPlanted,
              liftCm: compassLiftCm,
            },
          };
          setPoses(interp);

          if (step.drawArc) {
            setDemoPencilPose(null);
            setDemoPreview({
              kind: 'arc',
              cx: step.drawArc.cx,
              cy: step.drawArc.cy,
              radiusCm: step.drawArc.radiusCm,
              startDeg: step.drawArc.startDeg,
              endDeg: lerpNum(step.drawArc.startDeg, step.drawArc.endDeg, ease),
              style: step.drawArc.style,
            });
          } else if (step.drawLine) {
            const { x1, y1, x2, y2, style } = step.drawLine;
            if (tRaw < 0.14) {
              const dropT = tRaw / 0.14;
              setDemoPencilPose({
                x: x1,
                y: y1,
                liftCm: (1 - dropT) * 1.5,
              });
              setDemoPreview(null);
            } else if (tRaw <= 0.92) {
              const drawT = (tRaw - 0.14) / 0.78;
              const drawEase =
                drawT < 0.5
                  ? 2 * drawT * drawT
                  : 1 - Math.pow(-2 * drawT + 2, 2) / 2;
              const px = lerpNum(x1, x2, drawEase);
              const py = lerpNum(y1, y2, drawEase);
              setDemoPencilPose({ x: px, y: py, liftCm: 0 });
              setDemoPreview({
                kind: 'line',
                x1,
                y1,
                x2: px,
                y2: py,
                style,
              });
            } else {
              const liftT = (tRaw - 0.92) / 0.08;
              setDemoPencilPose({ x: x2, y: y2, liftCm: liftT * 1.1 });
              setDemoPreview({ kind: 'line', x1, y1, x2, y2, style });
            }
          } else if (step.addPoint || step.addMark) {
            const tx = step.addPoint ? step.addPoint.x : step.addMark!.x;
            const ty = step.addPoint ? step.addPoint.y : step.addMark!.y;
            const liftCm =
              tRaw < 0.55
                ? (1 - tRaw / 0.55) * 1.6
                : ((tRaw - 0.55) / 0.45) * 1.1;
            setDemoPencilPose({ x: tx, y: ty, liftCm });
            setDemoPreview(null);
          } else {
            setDemoPencilPose(null);
            setDemoPreview(null);
          }

          setDemoProgress((i + tRaw) / steps.length);

          if (tRaw < 1) {
            requestAnimationFrame(tick);
          } else {
            workingPoses = {
              ...interp,
              compass: {
                ...interp.compass,
                sweeping: false,
                liftCm: 0,
              },
            };
            setPoses(workingPoses);
            setDemoPreview(null);
            setDemoPencilPose(null);
            resolve();
          }
        };
        requestAnimationFrame(tick);
      });

      if (demoCancelRef.current) break;

      if (step.isTransit && step.tool === 'compass') {
        playSnapClick();
      }

      // Commit the demo's drawn entity cleanly at end of step
      if (step.drawArc) {
        workingSheet = {
          ...workingSheet,
          arcs: [...workingSheet.arcs, { ...step.drawArc, id: `demo-arc-${i}` }],
        };
        setSheet(cloneSheet(workingSheet));
        playPencilStroke();
      }
      if (step.drawLine) {
        workingSheet = {
          ...workingSheet,
          lines: [...workingSheet.lines, { ...step.drawLine, id: `demo-line-${i}` }],
        };
        setSheet(cloneSheet(workingSheet));
        playPencilStroke();
      }
      if (step.addPoint) {
        workingSheet = {
          ...workingSheet,
          points: [...workingSheet.points, { ...step.addPoint, id: `demo-pt-${i}` }],
        };
        setSheet(cloneSheet(workingSheet));
        playSnapClick();
      }
      if (step.addMark) {
        workingSheet = {
          ...workingSheet,
          marks: [...workingSheet.marks, { ...step.addMark, id: `demo-mark-${i}` }],
        };
        setSheet(cloneSheet(workingSheet));
        playStampMark();
      }
    }

    setDemoPreview(null);
    setDemoPencilPose(null);
    if (!demoCancelRef.current) {
      setIsDemoRunning(false);
      setDemoProgress(1);
      setSpeechText(t.mentor.demoFinished);
      playSuccessChime();
    }
  };

  const handleStopDemo = () => {
    demoCancelRef.current = true;
    setIsDemoRunning(false);
    setDemoPreview(null);
    setDemoPencilPose(null);
  };

  // Challenge Verification
  const handleVerify = () => {
    const res = activeLesson.verify(sheet);
    setVerification(res);
    setSpeechText(pickText(res.feedback, lang));

    if (res.passed) {
      playSuccessChime();
      setProgress((prev) => ({
        ...prev,
        completedLessons: {
          ...prev.completedLessons,
          [activeLesson.id]: Math.max(
            prev.completedLessons[activeLesson.id] || 0,
            res.stars,
          ),
        },
      }));
    } else {
      playGentleRetry();
    }
  };

  // Three.js Canvas Mount + Imperative Sync
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<ClassroomSceneController | null>(null);

  // Latest callbacks ref so WebGL instance never remounts
  const callbacksRef = useRef<ClassroomCallbacks>({
    onPosesChange: () => {},
    onAddLine: () => {},
    onAddArc: () => {},
    onAddMark: () => {},
    onAddPoint: () => {},
    onEraseAt: () => {},
    onHoverPaper: () => {},
    onSnapTrigger: () => {},
    onDrawSound: () => {},
  });

  callbacksRef.current = {
    onPosesChange: (nextPoses) => setPoses(nextPoses),
    onAddLine: (line) =>
      commitSheet((prev) => ({
        ...prev,
        lines: [...prev.lines, { ...line, id: `line-${Date.now()}-${Math.random()}` }],
      })),
    onAddArc: (arc) =>
      commitSheet((prev) => ({
        ...prev,
        arcs: [...prev.arcs, { ...arc, id: `arc-${Date.now()}-${Math.random()}` }],
      })),
    onAddMark: (mark) => {
      playStampMark();
      commitSheet((prev) => ({
        ...prev,
        marks: [...prev.marks, { ...mark, id: `mark-${Date.now()}-${Math.random()}` }],
      }));
    },
    onAddPoint: (pt) => {
      playStampMark();
      commitSheet((prev) => ({
        ...prev,
        points: [...prev.points, { ...pt, id: `pt-${Date.now()}-${Math.random()}` }],
      }));
    },
    onEraseAt: (x, y) => {
      commitSheet((prev) => {
        const nextLines = prev.lines.filter(
          (l) => l.locked || pointToSegmentDist(x, y, l.x1, l.y1, l.x2, l.y2).dist > 0.55,
        );
        const nextArcs = prev.arcs.filter(
          (a) =>
            a.locked ||
            Math.abs(dist2D(x, y, a.cx, a.cy) - a.radiusCm) > 0.55,
        );
        const nextMarks = prev.marks.filter(
          (m) => dist2D(x, y, m.x, m.y) > 0.7,
        );
        const nextPoints = prev.points.filter(
          (p) => p.locked || dist2D(x, y, p.x, p.y) > 0.55,
        );
        return {
          points: nextPoints,
          lines: nextLines,
          arcs: nextArcs,
          marks: nextMarks,
        };
      });
    },
    onHoverPaper: (info) => {
      const snapLabel =
        info.snap.kind === 'point'
          ? info.snap.label || t.status.snapPoint
          : info.snap.kind === 'midpoint'
          ? t.status.snapMidpoint
          : info.snap.kind === 'intersection'
          ? t.status.snapIntersection
          : info.snap.kind === 'ruler-edge'
          ? `${t.status.snapRulerEdge} (${info.snap.distanceAlongEdgeCm ?? 0} ${t.status.cmUnit})`
          : info.snap.kind === 'grid'
          ? t.status.snapGrid
          : undefined;

      setLoupeState({
        active: loupeEnabled && info.insidePaper,
        paperX: info.paperX,
        paperY: info.paperY,
        screenX: info.screenX,
        screenY: info.screenY,
        snapLabel,
      });
      setHoverTelemetry({
        inside: info.insidePaper,
        x: info.paperX,
        y: info.paperY,
        snapLabel,
      });
    },
    onSnapTrigger: () => {
      playSnapClick();
    },
    onDrawSound: () => {
      playPencilStroke();
    },
  };

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const engine = new ClassroomSceneController(
      mount,
      {
        activeTool,
        activeMarkType,
        lineStyle,
        snapEnabled,
        sheetType,
        sheet,
        poses,
        cameraPreset,
        isDemoRunning,
        nextPointLabel,
        demoPreview,
        demoPencilPose,
      },
      {
        onPosesChange: (p) => callbacksRef.current.onPosesChange(p),
        onAddLine: (l) => callbacksRef.current.onAddLine(l),
        onAddArc: (a) => callbacksRef.current.onAddArc(a),
        onAddMark: (m) => callbacksRef.current.onAddMark(m),
        onAddPoint: (pt) => callbacksRef.current.onAddPoint(pt),
        onEraseAt: (x, y) => callbacksRef.current.onEraseAt(x, y),
        onHoverPaper: (i) => callbacksRef.current.onHoverPaper(i),
        onSnapTrigger: (s) => callbacksRef.current.onSnapTrigger(s),
        onDrawSound: () => callbacksRef.current.onDrawSound(),
      },
    );
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // Mount WebGL canvas once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.updateState({
      activeTool,
      activeMarkType,
      lineStyle,
      snapEnabled,
      sheetType,
      sheet,
      poses,
      cameraPreset,
      isDemoRunning,
      nextPointLabel,
      demoPreview,
      demoPencilPose,
    });
  }, [
    activeTool,
    activeMarkType,
    lineStyle,
    snapEnabled,
    sheetType,
    sheet,
    poses,
    cameraPreset,
    isDemoRunning,
    nextPointLabel,
    demoPreview,
    demoPencilPose,
  ]);

  // Global keyboard shortcuts (Ctrl+Z Undo, Ctrl+Y Redo, L Loupe, M Snap, Esc Stop Demo)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'l') {
        setLoupeEnabled((v) => !v);
      } else if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'm') {
        setSnapEnabled((v) => !v);
      } else if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'h') {
        if (
          activeTool === 'ruler' ||
          activeTool === 'setSquare' ||
          activeTool === 'protractor' ||
          activeTool === 'compass'
        ) {
          setPoses((prev) => ({
            ...prev,
            visibleTools: {
              ...prev.visibleTools,
              [activeTool]: !prev.visibleTools[activeTool],
            },
          }));
        }
      } else if (e.key === 'Escape' && isDemoRunning) {
        handleStopDemo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo, isDemoRunning, activeTool]);

  const totalStars = Object.values(progress.completedLessons).reduce(
    (a, b) => a + b,
    0,
  );
  const maxStars = GRADE6_LESSONS.length * 3;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100 select-none">
      {/* Top Bar */}
      <TopHeader
        lang={lang}
        onChangeLang={handleChangeLang}
        t={t}
        totalStars={totalStars}
        maxStars={maxStars}
        onOpenCertificate={() => setCertOpen(true)}
      />

      {/* Ergonomic Dual-Side Workspace: Left Deck | Center 3D Classroom | Right Tool Kit */}
      <main dir="ltr" className="flex-1 flex min-h-0 relative overflow-hidden">
        <LeftControlDeck
          lang={lang}
          t={t}
          collapsed={leftCollapsed}
          onToggleCollapse={() => setLeftCollapsed((v) => !v)}
          mode={mode}
          onChangeMode={handleChangeMode}
          lessons={GRADE6_LESSONS}
          activeLessonId={activeLessonId}
          onSelectLesson={handleSelectLesson}
          completedLessons={progress.completedLessons}
          sheetType={sheetType}
          onChangeSheetType={setSheetType}
          cameraPreset={cameraPreset}
          onChangeCameraPreset={setCameraPreset}
        />

        {/* Spacious Center Paper-Focused Viewport */}
        <section className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#e9eef4]">
          {/* Sleek 1-line CAD Status, Coordinate & Quick Tool-Hide Strip */}
          <div
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className="min-h-8 px-3 py-1 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-[11px] text-slate-600 shrink-0"
          >
            <div className="flex items-center gap-3 font-mono-num min-w-0">
              <span>
                {hoverTelemetry.inside
                  ? `X: ${hoverTelemetry.x.toFixed(1)} ${t.status.cmUnit} · Y: ${hoverTelemetry.y.toFixed(1)} ${t.status.cmUnit}`
                  : `28.0 × 20.0 ${t.status.cmUnit}`}
              </span>
              {hoverTelemetry.inside && hoverTelemetry.snapLabel && (
                <span className="text-amber-700 font-semibold truncate">
                  · {hoverTelemetry.snapLabel}
                </span>
              )}
            </div>

            {/* Quick 1-click removal of any instrument currently sitting on the sheet */}
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {(
                (['ruler', 'setSquare', 'protractor', 'compass'] as const).filter(
                  (k) => poses.visibleTools[k],
                )
              ).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() =>
                    setPoses((prev) => ({
                      ...prev,
                      visibleTools: { ...prev.visibleTools, [k]: false },
                    }))
                  }
                  title={t.controls.hideToolFromDesk}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold transition-colors cursor-pointer"
                >
                  <span>{t.tools[k]}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
              {Object.values(poses.visibleTools).filter(Boolean).length >= 2 && (
                <button
                  type="button"
                  onClick={() =>
                    setPoses((prev) => ({
                      ...prev,
                      visibleTools: {
                        ruler: false,
                        setSquare: false,
                        protractor: false,
                        compass: false,
                      },
                    }))
                  }
                  className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-semibold transition-colors cursor-pointer"
                >
                  {t.controls.putAllAway}
                </button>
              )}
              <span className="hidden xl:inline text-slate-400 truncate ms-2">
                {t.controls.shortcutsHint}
              </span>
            </div>
          </div>

          <div className="flex-1 relative min-h-0 overflow-hidden">
            {/* Dedicated isolated WebGL mount */}
            <div ref={canvasMountRef} className="w-full h-full" />

            {/* Smart 3x Magnifying Loupe Overlay */}
            <SmartLoupe
              loupe={loupeState}
              paperCanvas={engineRef.current?.paperCanvas || null}
              t={t}
            />
          </div>

          {/* Non-blocking collapsible Mascot "المعلم مجدي" strip below the paper */}
          <MascotMajdi
            lang={lang}
            t={t}
            mode={mode}
            lesson={mode === 'sandbox' ? null : activeLesson}
            stepIndex={stepIndex}
            onPrevStep={() => {
              const nextIdx = Math.max(0, stepIndex - 1);
              setStepIndex(nextIdx);
              const s = activeLesson.steps[nextIdx];
              if (s) {
                setActiveTool(s.recommendedTool);
                setSpeechText(pickText(s.instruction, lang));
              }
            }}
            onNextStep={() => {
              const nextIdx = Math.min(
                activeLesson.steps.length - 1,
                stepIndex + 1,
              );
              setStepIndex(nextIdx);
              const s = activeLesson.steps[nextIdx];
              if (s) {
                setActiveTool(s.recommendedTool);
                setSpeechText(pickText(s.instruction, lang));
              }
            }}
            speechText={speechText}
            isDemoRunning={isDemoRunning}
            demoProgress={demoProgress}
            onStartDemo={handleStartDemo}
            onStopDemo={handleStopDemo}
            onVerify={handleVerify}
            verification={verification}
            minimized={mentorMinimized}
            onToggleMinimize={() => setMentorMinimized((v) => !v)}
          />
        </section>

        <RightToolKit
          lang={lang}
          t={t}
          collapsed={rightCollapsed}
          onToggleCollapse={() => setRightCollapsed((v) => !v)}
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          poses={poses}
          onUpdatePoses={setPoses}
          activeMarkType={activeMarkType}
          onSelectMarkType={setActiveMarkType}
          lineStyle={lineStyle}
          onChangeLineStyle={setLineStyle}
          snapEnabled={snapEnabled}
          onToggleSnap={() => setSnapEnabled((v) => !v)}
          loupeEnabled={loupeEnabled}
          onToggleLoupe={() => setLoupeEnabled((v) => !v)}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onResetOrClear={() => loadLessonState(activeLessonId, mode, lang)}
          mode={mode}
          onDrawAlongRuler={handleDrawAlongRuler}
          onDrawAlongSquareBase={handleDrawAlongSquareBase}
          onDrawAlongSquareLeg={handleDrawAlongSquareLeg}
          onSweepCompassArc={handleSweepCompassArc}
          onMarkProtractorAngle={handleMarkProtractorAngle}
          onExportSheetPng={handleExportSheetPng}
        />
      </main>

      {/* Personalized Future Engineer Certificate Modal */}
      <CertificateModal
        open={certOpen}
        onClose={() => setCertOpen(false)}
        lang={lang}
        t={t}
        pupilName={progress.pupilName}
        onChangePupilName={(name) =>
          setProgress((prev) => ({ ...prev, pupilName: name }))
        }
        lessons={GRADE6_LESSONS}
        completedLessons={progress.completedLessons}
      />
    </div>
  );
}
