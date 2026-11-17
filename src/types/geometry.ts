export type Language = 'ar' | 'fr' | 'en';

export type WorkspaceMode = 'guided' | 'challenge' | 'sandbox';

export type SheetType = 'plain' | 'millimeter' | 'dots';

export type CameraPreset = 'classroom3d' | 'top2d' | 'zoomPaper';

export type ToolId =
  | 'ruler'
  | 'setSquare'
  | 'protractor'
  | 'compass'
  | 'pencil'
  | 'eraser'
  | 'mark';

export type MarkType = 'right-angle' | 'equal-1' | 'equal-2' | 'angle-arc' | 'point-label';

export type LocalizedText = Record<Language, string>;

export interface GeoPoint {
  id: string;
  x: number; // cm relative to paper center (-14 .. +14)
  y: number; // cm relative to paper center (-10 .. +10), +Y up on paper
  label?: string;
  locked?: boolean;
  role?: 'given' | 'user';
}

export interface GeoLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: 'segment' | 'line';
  style: 'solid' | 'construction';
  color: string;
  locked?: boolean;
  label?: string;
}

export interface GeoArc {
  id: string;
  cx: number;
  cy: number;
  radiusCm: number;
  startDeg: number;
  endDeg: number;
  style: 'construction' | 'solid';
  color: string;
  locked?: boolean;
}

export interface GeoMark {
  id: string;
  type: MarkType;
  x: number;
  y: number;
  angleDeg: number;
  label?: string;
  color: string;
}

export interface SheetState {
  points: GeoPoint[];
  lines: GeoLine[];
  arcs: GeoArc[];
  marks: GeoMark[];
}

export interface RulerPose {
  x: number;
  y: number;
  angleDeg: number;
  lengthCm: number;
}

export interface SetSquarePose {
  x: number;
  y: number;
  angleDeg: number;
  flipped: boolean;
  legCm: number;
}

export interface ProtractorPose {
  x: number;
  y: number;
  angleDeg: number;
  radiusCm: number;
  measureDeg: number;
}

export interface CompassPose {
  cx: number;
  cy: number;
  radiusCm: number;
  armAngleDeg: number;
  sweepStartDeg: number;
  sweeping: boolean;
  needlePlanted: boolean;
  liftCm?: number;
}

export interface ToolPoses {
  ruler: RulerPose;
  setSquare: SetSquarePose;
  protractor: ProtractorPose;
  compass: CompassPose;
  visibleTools: Record<'ruler' | 'setSquare' | 'protractor' | 'compass', boolean>;
}

export type SnapKind =
  | 'point'
  | 'midpoint'
  | 'intersection'
  | 'ruler-edge'
  | 'grid'
  | null;

export interface SnapResult {
  x: number;
  y: number;
  kind: SnapKind;
  label?: string;
  edgeAngleDeg?: number;
  distanceAlongEdgeCm?: number;
}

export interface PreviewStroke {
  kind: 'line' | 'arc';
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  cx?: number;
  cy?: number;
  radiusCm?: number;
  startDeg?: number;
  endDeg?: number;
  style: 'solid' | 'construction';
}

export interface DemoStepAction {
  durationSec: number;
  tool: ToolId;
  speech: LocalizedText;
  isTransit?: boolean;
  fromPose?: Partial<ToolPoses>;
  toPose?: Partial<ToolPoses>;
  drawLine?: Omit<GeoLine, 'id'>;
  drawArc?: Omit<GeoArc, 'id'>;
  addPoint?: Omit<GeoPoint, 'id'>;
  addMark?: Omit<GeoMark, 'id'>;
}

export interface LessonStep {
  id: string;
  recommendedTool: ToolId;
  instruction: LocalizedText;
  hint: LocalizedText;
}

export interface VerificationResult {
  passed: boolean;
  stars: number; // 0..3
  feedback: LocalizedText;
  checks: { label: LocalizedText; ok: boolean }[];
}

export interface CurriculumLesson {
  id: string;
  order: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  badgeCode: string;
  initialSheet: SheetState;
  initialPoses?: Partial<ToolPoses>;
  steps: LessonStep[];
  demoSteps: DemoStepAction[];
  verify: (sheet: SheetState) => VerificationResult;
}

export interface LoupeState {
  active: boolean;
  paperX: number;
  paperY: number;
  screenX: number;
  screenY: number;
  snapLabel?: string;
  measurementText?: string;
}

export interface PupilProgress {
  pupilName: string;
  completedLessons: Record<string, number>; // lessonId -> best stars (1..3)
}
