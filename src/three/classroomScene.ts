import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {
  CM_TO_WORLD,
  PAPER_HALF_H,
  PAPER_HALF_W,
  clampToPaper,
  computeSnapPoint,
  degToRad,
  dist2D,
  normalizeDeg,
  pointToSegmentDist,
  radToDeg,
} from '../geometry/mathKernel';
import {
  CameraPreset,
  GeoArc,
  GeoLine,
  GeoMark,
  GeoPoint,
  MarkType,
  PreviewStroke,
  SheetState,
  SheetType,
  SnapResult,
  ToolId,
  ToolPoses,
} from '../types/geometry';
import {
  PAPER_CANVAS_H,
  PAPER_CANVAS_W,
  renderPaperToCanvas,
} from './paperRenderer';
import {
  createContactShadowTexture,
  createDraftingMatTexture,
  createKnurlBumpTexture,
  createPaperBumpTexture,
  createProtractorTexture,
  createRulerTexture,
  createSetSquareTexture,
  createToolContactShadowTexture,
  createWoodDeskGrainMap,
  createWoodDeskTexture,
} from './proceduralTextures';

export interface ClassroomCallbacks {
  onPosesChange: (poses: ToolPoses) => void;
  onAddLine: (line: Omit<GeoLine, 'id'>) => void;
  onAddArc: (arc: Omit<GeoArc, 'id'>) => void;
  onAddMark: (mark: Omit<GeoMark, 'id'>) => void;
  onAddPoint: (pt: Omit<GeoPoint, 'id'>) => void;
  onEraseAt: (x: number, y: number) => void;
  onHoverPaper: (info: {
    paperX: number;
    paperY: number;
    screenX: number;
    screenY: number;
    snap: SnapResult;
    insidePaper: boolean;
  }) => void;
  onSnapTrigger: (snap: SnapResult) => void;
  onDrawSound: () => void;
}

export interface ClassroomEngineState {
  activeTool: ToolId;
  activeMarkType: MarkType;
  lineStyle: 'solid' | 'construction';
  snapEnabled: boolean;
  sheetType: SheetType;
  sheet: SheetState;
  poses: ToolPoses;
  cameraPreset: CameraPreset;
  isDemoRunning: boolean;
  nextPointLabel: string;
  demoPreview?: PreviewStroke | null;
  demoPencilPose?: { x: number; y: number; liftCm?: number } | null;
}

// Reusable module-level math objects (Zero GC in loops)
const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const _paperPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.016);
const _hit = new THREE.Vector3();

const CAMERA_PRESETS: Record<
  CameraPreset,
  { pos: THREE.Vector3; target: THREE.Vector3 }
> = {
  classroom3d: {
    pos: new THREE.Vector3(0, 2.22, 1.48),
    target: new THREE.Vector3(0, 0.016, 0),
  },
  top2d: {
    pos: new THREE.Vector3(0, 2.85, 0.001),
    target: new THREE.Vector3(0, 0.016, 0),
  },
  zoomPaper: {
    pos: new THREE.Vector3(0, 1.85, 0.001),
    target: new THREE.Vector3(0, 0.016, 0),
  },
};

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export class ClassroomSceneController {
  private container: HTMLElement;
  private callbacks: ClassroomCallbacks;
  private state: ClassroomEngineState;

  private isSoftwareGl: boolean;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  // Dynamic paper canvas
  public paperCanvas: HTMLCanvasElement;
  private paperCtx: CanvasRenderingContext2D;
  private paperTexture: THREE.CanvasTexture;

  // Instrument meshes
  private rulerGroup: THREE.Group;
  private setSquareGroup: THREE.Group;
  private setSquareBodyMesh!: THREE.Mesh;
  private protractorGroup: THREE.Group;
  private compassGroup: THREE.Group;
  private compassPivotLeg!: THREE.Group;
  private compassPencilLeg!: THREE.Group;
  private compassHead!: THREE.Group;
  private compassScrewBar!: THREE.Mesh;
  private compassScrewWheel!: THREE.Group;
  private pencilGroup: THREE.Group;

  // Dynamic height-responsive contact shadows
  private compassNeedleShadow!: THREE.Mesh;
  private compassTipShadow!: THREE.Mesh;
  private pencilShadow!: THREE.Mesh;
  private contactShadowMatNeedle!: THREE.MeshBasicMaterial;
  private contactShadowMatTip!: THREE.MeshBasicMaterial;
  private contactShadowMatPencil!: THREE.MeshBasicMaterial;

  // Interaction handles
  private dragMode:
    | 'none'
    | 'move-ruler'
    | 'rotate-ruler'
    | 'move-setSquare'
    | 'rotate-setSquare'
    | 'move-protractor'
    | 'rotate-protractor'
    | 'move-compass'
    | 'sweep-compass'
    | 'resize-compass'
    | 'draw-pencil' = 'none';
  private dragOffset = { x: 0, y: 0 };
  private dragStartPaper = { x: 0, y: 0 };
  private compassSweepStartDeg = 0;
  private compassSweepCurrentDeg = 0;
  private previewStroke: PreviewStroke | null = null;
  private lastSnapKey = '';
  private activeSnap: SnapResult | null = null;
  private hadSnapHalo = false;
  private lastHoverPaper = { x: 0, y: 0, inside: false };
  private hoveredHandle: string | null = null;
  private handleMaterials = new Map<string, { mat: THREE.MeshStandardMaterial; color: number }>();
  private knurlTex!: THREE.CanvasTexture;

  // Camera transition damping
  private cameraAnimating = false;
  private targetCamPos = new THREE.Vector3().copy(CAMERA_PRESETS.classroom3d.pos);
  private targetCamLook = new THREE.Vector3().copy(CAMERA_PRESETS.classroom3d.target);
  private clock = new THREE.Clock();

  // Render scheduling
  private frameId = 0;
  private renderBusy = false;
  private renderDirty = false;
  private disposed = false;

  // Disposables
  private disposables: Array<{ dispose: () => void }> = [];

  constructor(
    container: HTMLElement,
    initialState: ClassroomEngineState,
    callbacks: ClassroomCallbacks,
  ) {
    this.container = container;
    this.state = initialState;
    this.callbacks = callbacks;

    this.isSoftwareGl = detectSoftwareWebGL();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 240);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.touchAction = 'none';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#e6edf5');
    this.scene.fog = new THREE.Fog('#e6edf5', 6.8, 14.5);

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 45);
    const initPreset = CAMERA_PRESETS[initialState.cameraPreset];
    this.camera.position.copy(initPreset.pos);
    this.targetCamPos.copy(initPreset.pos);
    this.targetCamLook.copy(initPreset.target);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(initPreset.target);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1.25;
    this.controls.maxDistance = 6.5;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.minPolarAngle = 0.02;
    this.controls.minAzimuthAngle = -Math.PI * 0.38;
    this.controls.maxAzimuthAngle = Math.PI * 0.38;

    this.controls.addEventListener('start', () => {
      this.cameraAnimating = false;
    });
    this.controls.addEventListener('change', () => {
      this.requestRender();
    });

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTex;
    this.disposables.push(envTex);
    pmremGenerator.dispose();

    // Paper Dynamic Canvas
    this.paperCanvas = document.createElement('canvas');
    this.paperCanvas.width = PAPER_CANVAS_W;
    this.paperCanvas.height = PAPER_CANVAS_H;
    this.paperCtx = this.paperCanvas.getContext('2d')!;
    this.paperTexture = new THREE.CanvasTexture(this.paperCanvas);
    this.paperTexture.colorSpace = THREE.SRGBColorSpace;
    this.paperTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.disposables.push(this.paperTexture);

    this.knurlTex = createKnurlBumpTexture();
    this.disposables.push(this.knurlTex);

    this.setupLighting();
    this.buildClassroomEnvironment();

    this.rulerGroup = this.buildRulerModel();
    this.setSquareGroup = this.buildSetSquareModel();
    this.protractorGroup = this.buildProtractorModel();
    this.compassGroup = this.buildCompassModel();
    this.pencilGroup = this.buildPencilModel();

    this.scene.add(
      this.rulerGroup,
      this.setSquareGroup,
      this.protractorGroup,
      this.compassGroup,
      this.pencilGroup,
    );

    this.syncPaperCanvas();
    this.syncToolsTransform();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindEvents();
    this.requestRender();
  }

  private setupLighting(): void {
    const hemi = new THREE.HemisphereLight('#fffdf5', '#cbd5e1', 0.9);
    this.scene.add(hemi);

    const sunKey = new THREE.DirectionalLight('#fffaf0', 1.7);
    sunKey.position.set(-3.2, 5.6, 2.6);
    sunKey.castShadow = !this.isSoftwareGl;
    sunKey.shadow.mapSize.set(2048, 2048);
    sunKey.shadow.radius = 2.5;
    sunKey.shadow.camera.near = 0.5;
    sunKey.shadow.camera.far = 14;
    const d = 2.6;
    sunKey.shadow.camera.left = -d;
    sunKey.shadow.camera.right = d;
    sunKey.shadow.camera.top = d;
    sunKey.shadow.camera.bottom = -d;
    sunKey.shadow.bias = -0.0004;
    sunKey.shadow.normalBias = 0.015;
    this.scene.add(sunKey);

    const fillRim = new THREE.DirectionalLight('#e0f2fe', 0.58);
    fillRim.position.set(3.8, 3.4, -2.8);
    this.scene.add(fillRim);

    // Subtle warm specular kicker from front-right for crisp acrylic & brass highlights
    const specKicker = new THREE.DirectionalLight('#fef3c7', 0.35);
    specKicker.position.set(2.4, 2.6, 3.2);
    this.scene.add(specKicker);

    // Overhead Studio Softboxes (Hardware GPU only) for elongated acrylic & brushed-metal highlights
    if (!this.isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const keySoftbox = new THREE.RectAreaLight('#fff8e7', 2.2, 3.4, 1.8);
      keySoftbox.position.set(-1.8, 2.8, 1.2);
      keySoftbox.lookAt(0, 0, 0);
      this.scene.add(keySoftbox);

      const fillSoftbox = new THREE.RectAreaLight('#e0f2fe', 1.3, 3.0, 1.6);
      fillSoftbox.position.set(2.2, 2.5, -1.4);
      fillSoftbox.lookAt(0, 0, 0);
      this.scene.add(fillSoftbox);
    }
  }

  private buildClassroomEnvironment(): void {
    const stage = new THREE.Group();

    // Warm natural wood drafting table base beneath the slate mat with grain roughness & bump maps
    const woodTex = createWoodDeskTexture();
    woodTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    woodTex.repeat.set(3, 2);
    const woodGrainTex = createWoodDeskGrainMap();
    woodGrainTex.repeat.set(3, 2);
    const deskGeo = new THREE.BoxGeometry(10.5, 0.08, 7.6);
    const deskMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughnessMap: woodGrainTex,
      bumpMap: woodGrainTex,
      bumpScale: 0.004,
      roughness: 0.78,
      metalness: 0.04,
    });
    const deskMesh = new THREE.Mesh(deskGeo, deskMat);
    deskMesh.position.set(0, -0.045, 0);
    deskMesh.receiveShadow = true;
    stage.add(deskMesh);

    // Recessed architectural drafting pad framing the 28 x 20 cm sheet
    const matTex = createDraftingMatTexture();
    matTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const padW = PAPER_HALF_W * 2 * CM_TO_WORLD + 0.34;
    const padH = PAPER_HALF_H * 2 * CM_TO_WORLD + 0.34;
    const padGeo = new THREE.BoxGeometry(padW, 0.014, padH);
    const padMat = new THREE.MeshStandardMaterial({
      map: matTex,
      roughness: 0.68,
      metalness: 0.1,
    });
    const padMesh = new THREE.Mesh(padGeo, padMat);
    padMesh.position.set(0, 0.002, 0);
    padMesh.receiveShadow = true;
    padMesh.castShadow = true;
    stage.add(padMesh);

    // Soft ambient paper contact shadow
    const sheetShadowGeo = new THREE.PlaneGeometry(
      PAPER_HALF_W * 2 * CM_TO_WORLD + 0.06,
      PAPER_HALF_H * 2 * CM_TO_WORLD + 0.06,
    );
    const sheetShadowMat = new THREE.MeshBasicMaterial({
      color: '#0f172a',
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    const sheetShadow = new THREE.Mesh(sheetShadowGeo, sheetShadowMat);
    sheetShadow.rotation.x = -Math.PI / 2;
    sheetShadow.position.set(0.012, 0.01, 0.012);
    stage.add(sheetShadow);

    // Crisp White Drawing Sheet (28 cm x 20 cm -> 2.8 x 2.0 world units) with subtle vellum fiber bump
    const paperBumpTex = createPaperBumpTexture();
    const paperGeo = new THREE.PlaneGeometry(
      PAPER_HALF_W * 2 * CM_TO_WORLD,
      PAPER_HALF_H * 2 * CM_TO_WORLD,
    );
    const paperMat = new THREE.MeshStandardMaterial({
      map: this.paperTexture,
      bumpMap: paperBumpTex,
      bumpScale: 0.0016,
      roughness: 0.88,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const paperMesh = new THREE.Mesh(paperGeo, paperMat);
    paperMesh.rotation.x = -Math.PI / 2;
    paperMesh.position.y = 0.016;
    paperMesh.receiveShadow = true;
    stage.add(paperMesh);

    // Multi-part spring-steel drafting binder clips holding the top corners of the paper
    const clipBodyGeo = new THREE.BoxGeometry(0.16, 0.014, 0.046);
    const clipBodyMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      metalness: 0.55,
      roughness: 0.36,
      envMapIntensity: 1.1,
    });
    const clipAccentGeo = new THREE.BoxGeometry(0.145, 0.005, 0.016);
    const clipAccentMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      metalness: 0.85,
      roughness: 0.24,
      envMapIntensity: 1.3,
    });
    const clipWireGeo = new THREE.TorusGeometry(0.028, 0.004, 8, 18, Math.PI);
    const clipWireMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.92,
      roughness: 0.16,
      envMapIntensity: 1.35,
    });

    const clipX = PAPER_HALF_W * CM_TO_WORLD - 0.18;
    const clipZ = -PAPER_HALF_H * CM_TO_WORLD + 0.018;
    for (const sx of [-1, 1]) {
      const clipGroup = new THREE.Group();
      clipGroup.position.set(sx * clipX, 0.023, clipZ);

      const cBody = new THREE.Mesh(clipBodyGeo, clipBodyMat);
      cBody.castShadow = true;
      const cAccent = new THREE.Mesh(clipAccentGeo, clipAccentMat);
      cAccent.position.set(0, 0.008, 0.006);
      const cWire = new THREE.Mesh(clipWireGeo, clipWireMat);
      cWire.rotation.x = -Math.PI / 2;
      cWire.position.set(0, 0.006, -0.02);
      cWire.castShadow = true;

      clipGroup.add(cBody, cAccent, cWire);
      stage.add(clipGroup);
    }

    // Dynamic ground contact shadow decals (tracks compass needle, compass pencil tip, and 3D pencil)
    const contactTex = createContactShadowTexture();
    const contactGeo = new THREE.PlaneGeometry(0.22, 0.22);

    this.contactShadowMatNeedle = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    this.compassNeedleShadow = new THREE.Mesh(contactGeo, this.contactShadowMatNeedle);
    this.compassNeedleShadow.rotation.x = -Math.PI / 2;
    this.compassNeedleShadow.position.y = 0.0172;
    this.compassNeedleShadow.visible = false;

    this.contactShadowMatTip = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    this.compassTipShadow = new THREE.Mesh(contactGeo, this.contactShadowMatTip);
    this.compassTipShadow.rotation.x = -Math.PI / 2;
    this.compassTipShadow.position.y = 0.0172;
    this.compassTipShadow.visible = false;

    this.contactShadowMatPencil = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    this.pencilShadow = new THREE.Mesh(contactGeo, this.contactShadowMatPencil);
    this.pencilShadow.rotation.x = -Math.PI / 2;
    this.pencilShadow.position.y = 0.0172;
    this.pencilShadow.visible = false;

    stage.add(this.compassNeedleShadow, this.compassTipShadow, this.pencilShadow);

    this.disposables.push(
      woodTex,
      woodGrainTex,
      deskGeo,
      deskMat,
      matTex,
      padGeo,
      padMat,
      sheetShadowGeo,
      sheetShadowMat,
      paperBumpTex,
      paperGeo,
      paperMat,
      clipBodyGeo,
      clipBodyMat,
      clipAccentGeo,
      clipAccentMat,
      clipWireGeo,
      clipWireMat,
      contactTex,
      contactGeo,
      this.contactShadowMatNeedle,
      this.contactShadowMatTip,
      this.contactShadowMatPencil,
    );
    this.scene.add(stage);
  }

  private buildRulerModel(): THREE.Group {
    const group = new THREE.Group();
    const lenCm = this.state.poses.ruler.lengthCm;
    const lenW = lenCm * CM_TO_WORLD;
    const widthW = 0.25; // 2.5 cm wide

    const rulerTex = createRulerTexture(lenCm);
    rulerTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    // Soft contact shadow directly under the ruler
    const rulerShadowTex = createToolContactShadowTexture('rect');
    const rulerShadowGeo = new THREE.PlaneGeometry(lenW + 0.16, widthW + 0.1);
    const rulerShadowMat = new THREE.MeshBasicMaterial({
      map: rulerShadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    const rulerShadow = new THREE.Mesh(rulerShadowGeo, rulerShadowMat);
    rulerShadow.rotation.x = -Math.PI / 2;
    rulerShadow.position.set(lenW / 2, -0.0005, widthW / 2);
    rulerShadow.renderOrder = 1;
    group.add(rulerShadow);

    // Beveled acrylic ruler profile extruded along X so drawing edge Z = 0 slopes crisply
    const profile = new THREE.Shape();
    profile.moveTo(-widthW, 0);
    profile.lineTo(0, 0);
    profile.lineTo(0, 0.0055);
    profile.lineTo(-0.055, 0.017);
    profile.lineTo(-widthW, 0.017);
    profile.closePath();

    const bodyGeo = new THREE.ExtrudeGeometry(profile, {
      depth: lenW + 0.08,
      bevelEnabled: true,
      bevelThickness: 0.0015,
      bevelSize: 0.0015,
      bevelSegments: 2,
    });
    bodyGeo.rotateY(Math.PI / 2);
    bodyGeo.translate(-0.04, 0.001, 0);

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: '#e0f2fe',
      transparent: true,
      opacity: 0.76,
      roughness: 0.11,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      ior: 1.49,
      reflectivity: 0.92,
      envMapIntensity: 1.35,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.renderOrder = 2;
    body.userData = { handle: 'move-ruler' };
    group.add(body);

    // Top printed scale plane
    const scaleGeo = new THREE.PlaneGeometry(lenW + 0.08, widthW);
    const scaleMat = new THREE.MeshBasicMaterial({
      map: rulerTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const scalePlane = new THREE.Mesh(scaleGeo, scaleMat);
    scalePlane.rotation.x = -Math.PI / 2;
    scalePlane.position.set(lenW / 2, 0.02, widthW / 2);
    scalePlane.renderOrder = 3;
    scalePlane.userData = { handle: 'move-ruler' };
    group.add(scalePlane);

    // Grip ridge
    const gripGeo = new THREE.BoxGeometry(lenW * 0.55, 0.016, 0.045);
    const gripMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.3,
      metalness: 0.18,
    });
    this.handleMaterials.set('move-ruler-knob', { mat: gripMat, color: 0x38bdf8 });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.set(lenW / 2, 0.026, widthW * 0.65);
    grip.castShadow = true;
    grip.userData = { handle: 'move-ruler-knob' };
    group.add(grip);

    // Rotate handle knob at the far end with knurled brass collar rim
    const knobGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.025, 24);
    const knobMat = new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.28,
      metalness: 0.28,
      bumpMap: this.knurlTex,
      bumpScale: 0.002,
    });
    this.handleMaterials.set('rotate-ruler', { mat: knobMat, color: 0xfbbf24 });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.set(lenW - 0.06, 0.03, widthW * 0.5);
    knob.castShadow = true;
    knob.userData = { handle: 'rotate-ruler' };
    group.add(knob);

    const knobRimGeo = new THREE.TorusGeometry(0.053, 0.005, 8, 24);
    const knobRimMat = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 1.35,
    });
    const knobRim = new THREE.Mesh(knobRimGeo, knobRimMat);
    knobRim.rotation.x = Math.PI / 2;
    knobRim.position.set(lenW - 0.06, 0.041, widthW * 0.5);
    knobRim.userData = { handle: 'rotate-ruler' };
    group.add(knobRim);

    this.disposables.push(
      rulerTex,
      rulerShadowTex,
      rulerShadowGeo,
      rulerShadowMat,
      bodyGeo,
      bodyMat,
      scaleGeo,
      scaleMat,
      gripGeo,
      gripMat,
      knobGeo,
      knobMat,
      knobRimGeo,
      knobRimMat,
    );
    return group;
  }

  private buildSetSquareModel(): THREE.Group {
    const group = new THREE.Group();
    const legCm = this.state.poses.setSquare.legCm;
    const legW = legCm * CM_TO_WORLD;

    // Right triangle in local XZ (X = 0..legW, Z = 0..-legW so +Y on paper)
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(legW, 0);
    shape.lineTo(0, legW);
    shape.closePath();

    // Inner cutout triangle
    const hole = new THREE.Path();
    hole.moveTo(0.14, 0.14);
    hole.lineTo(legW * 0.66, 0.14);
    hole.lineTo(0.14, legW * 0.66);
    hole.closePath();
    shape.holes.push(hole);

    const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 2,
    });
    extrudeGeo.rotateX(-Math.PI / 2);

    // Normalize UVs cleanly across [0..legW]
    const posAttr = extrudeGeo.attributes.position;
    const uvs = new Float32Array(posAttr.count * 2);
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      uvs[i * 2] = vx / legW;
      uvs[i * 2 + 1] = -vz / legW;
    }
    extrudeGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    // Grounded contact shadow directly underneath the triangle
    const sqShadowTex = createToolContactShadowTexture('triangle');
    const sqShadowGeo = new THREE.PlaneGeometry(legW + 0.14, legW + 0.14);
    const sqShadowMat = new THREE.MeshBasicMaterial({
      map: sqShadowTex,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    const sqShadow = new THREE.Mesh(sqShadowGeo, sqShadowMat);
    sqShadow.rotation.x = -Math.PI / 2;
    sqShadow.position.set(legW / 2, -0.0045, -legW / 2);
    sqShadow.renderOrder = 1;
    group.add(sqShadow);

    const sqTex = createSetSquareTexture(legCm);
    sqTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const bodyMat = new THREE.MeshPhysicalMaterial({
      map: sqTex,
      color: '#bae6fd',
      transparent: true,
      opacity: 0.8,
      roughness: 0.12,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      ior: 1.49,
      reflectivity: 0.92,
      envMapIntensity: 1.35,
      side: THREE.DoubleSide,
    });
    this.setSquareBodyMesh = new THREE.Mesh(extrudeGeo, bodyMat);
    this.setSquareBodyMesh.position.y = 0.002;
    this.setSquareBodyMesh.castShadow = true;
    this.setSquareBodyMesh.renderOrder = 2;
    this.setSquareBodyMesh.userData = { handle: 'move-setSquare' };
    group.add(this.setSquareBodyMesh);

    // Grip knob near center (always grabbable even when holding Pencil)
    const knobGeo = new THREE.CylinderGeometry(0.048, 0.058, 0.036, 22);
    const knobMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.3,
      metalness: 0.2,
      bumpMap: this.knurlTex,
      bumpScale: 0.0018,
      side: THREE.DoubleSide,
    });
    this.handleMaterials.set('move-setSquare-knob', { mat: knobMat, color: 0x38bdf8 });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.set(legW * 0.28, 0.03, -legW * 0.28);
    knob.castShadow = true;
    knob.userData = { handle: 'move-setSquare-knob' };
    group.add(knob);

    // Rotate handle near top apex with knurled brass collar rim
    const rotGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.034, 22);
    const rotMat = new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.28,
      metalness: 0.26,
      bumpMap: this.knurlTex,
      bumpScale: 0.002,
      side: THREE.DoubleSide,
    });
    this.handleMaterials.set('rotate-setSquare', { mat: rotMat, color: 0xfbbf24 });
    const rotKnob = new THREE.Mesh(rotGeo, rotMat);
    rotKnob.position.set(0.06, 0.03, -legW + 0.1);
    rotKnob.castShadow = true;
    rotKnob.userData = { handle: 'rotate-setSquare' };
    group.add(rotKnob);

    const rotRimGeo = new THREE.TorusGeometry(0.051, 0.005, 8, 24);
    const rotRimMat = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 1.35,
    });
    const rotRim = new THREE.Mesh(rotRimGeo, rotRimMat);
    rotRim.rotation.x = Math.PI / 2;
    rotRim.position.set(0.06, 0.046, -legW + 0.1);
    rotRim.userData = { handle: 'rotate-setSquare' };
    group.add(rotRim);

    this.disposables.push(
      extrudeGeo,
      sqShadowTex,
      sqShadowGeo,
      sqShadowMat,
      sqTex,
      bodyMat,
      knobGeo,
      knobMat,
      rotGeo,
      rotMat,
      rotRimGeo,
      rotRimMat,
    );
    return group;
  }

  private buildProtractorModel(): THREE.Group {
    const group = new THREE.Group();
    const rW = this.state.poses.protractor.radiusCm * CM_TO_WORLD;

    const shape = new THREE.Shape();
    shape.absarc(0, 0, rW, 0, Math.PI, false);
    shape.closePath();

    const hole = new THREE.Path();
    hole.absarc(0, 0, rW * 0.45, 0.12, Math.PI - 0.12, false);
    hole.closePath();
    shape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.014,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2,
    });
    geo.rotateX(-Math.PI / 2);

    // Grounded contact shadow directly underneath the protractor
    const protShadowTex = createToolContactShadowTexture('semicircle');
    const protShadowGeo = new THREE.PlaneGeometry(rW * 2.4, rW * 2.4);
    const protShadowMat = new THREE.MeshBasicMaterial({
      map: protShadowTex,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    const protShadow = new THREE.Mesh(protShadowGeo, protShadowMat);
    protShadow.rotation.x = -Math.PI / 2;
    protShadow.position.set(0, -0.0085, -rW * 0.44);
    protShadow.renderOrder = 1;
    group.add(protShadow);

    const mat = new THREE.MeshPhysicalMaterial({
      color: '#fef3c7',
      transparent: true,
      opacity: 0.68,
      roughness: 0.12,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      ior: 1.49,
      reflectivity: 0.92,
      envMapIntensity: 1.35,
    });
    const body = new THREE.Mesh(geo, mat);
    body.castShadow = true;
    body.renderOrder = 2;
    body.userData = { handle: 'move-protractor' };
    group.add(body);

    const protTex = createProtractorTexture();
    protTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const plateGeo = new THREE.PlaneGeometry(rW * 2.15, rW * 1.15);
    const plateMat = new THREE.MeshBasicMaterial({
      map: protTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.rotation.x = -Math.PI / 2;
    plate.position.set(0, 0.018, -rW * 0.51);
    plate.renderOrder = 3;
    plate.userData = { handle: 'move-protractor' };
    group.add(plate);

    // Center brass eyelet
    const centerGeo = new THREE.TorusGeometry(0.032, 0.008, 10, 24);
    const centerMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.28, metalness: 0.55 });
    this.handleMaterials.set('move-protractor-knob', { mat: centerMat, color: 0xf87171 });
    const centerRing = new THREE.Mesh(centerGeo, centerMat);
    centerRing.rotation.x = Math.PI / 2;
    centerRing.position.set(0, 0.022, 0);
    centerRing.userData = { handle: 'move-protractor-knob' };
    group.add(centerRing);

    // Rotate handle at 90° rim with knurled brass collar rim
    const rotGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.032, 22);
    const rotMat = new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.28,
      metalness: 0.26,
      bumpMap: this.knurlTex,
      bumpScale: 0.002,
    });
    this.handleMaterials.set('rotate-protractor', { mat: rotMat, color: 0xfbbf24 });
    const rotKnob = new THREE.Mesh(rotGeo, rotMat);
    rotKnob.position.set(0, 0.03, -rW * 0.9);
    rotKnob.castShadow = true;
    rotKnob.userData = { handle: 'rotate-protractor' };
    group.add(rotKnob);

    const rotRimGeo = new THREE.TorusGeometry(0.049, 0.005, 8, 24);
    const rotRimMat = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 1.35,
    });
    const rotRim = new THREE.Mesh(rotRimGeo, rotRimMat);
    rotRim.rotation.x = Math.PI / 2;
    rotRim.position.set(0, 0.045, -rW * 0.9);
    rotRim.userData = { handle: 'rotate-protractor' };
    group.add(rotRim);

    this.disposables.push(
      geo,
      protShadowTex,
      protShadowGeo,
      protShadowMat,
      mat,
      protTex,
      plateGeo,
      plateMat,
      centerGeo,
      centerMat,
      rotGeo,
      rotMat,
      rotRimGeo,
      rotRimMat,
    );
    return group;
  }

  private buildCompassModel(): THREE.Group {
    const group = new THREE.Group();

    const metalMat = new THREE.MeshPhysicalMaterial({
      color: '#e2e8f0',
      roughness: 0.16,
      metalness: 0.94,
      anisotropy: 0.85,
      anisotropyRotation: Math.PI / 4,
      clearcoat: 0.25,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.4,
    });
    const brassMat = new THREE.MeshPhysicalMaterial({
      color: '#f59e0b',
      roughness: 0.22,
      metalness: 0.9,
      anisotropy: 0.8,
      anisotropyRotation: Math.PI / 6,
      clearcoat: 0.25,
      clearcoatRoughness: 0.22,
      bumpMap: this.knurlTex,
      bumpScale: 0.0022,
      envMapIntensity: 1.4,
    });
    const bluePlasticMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.28,
      metalness: 0.2,
    });
    const tealResizeMat = new THREE.MeshStandardMaterial({
      color: '#0d9488',
      roughness: 0.28,
      metalness: 0.24,
      bumpMap: this.knurlTex,
      bumpScale: 0.002,
    });
    this.handleMaterials.set('resize-compass', { mat: tealResizeMat, color: 0x2dd4bf });
    const needleMat = new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.2,
      metalness: 0.96,
      envMapIntensity: 1.35,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      roughness: 0.48,
    });
    const cedarMat = new THREE.MeshStandardMaterial({
      color: '#e6be8a',
      roughness: 0.72,
    });
    const graphiteMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.85,
      metalness: 0.1,
    });

    // Precision Geared Hinge Head + Center Pivot Screw + Fluted Top Handle
    this.compassHead = new THREE.Group();
    const headBaseGeo = new THREE.CylinderGeometry(0.052, 0.058, 0.072, 22);
    const headBase = new THREE.Mesh(headBaseGeo, bluePlasticMat);
    headBase.castShadow = true;
    headBase.userData = { handle: 'move-compass' };

    const gearRingGeo = new THREE.TorusGeometry(0.052, 0.011, 10, 26);
    const gearRing = new THREE.Mesh(gearRingGeo, brassMat);
    gearRing.rotation.y = Math.PI / 2;
    gearRing.userData = { handle: 'move-compass' };

    // Transverse brass hinge screw caps on front & back of the compass head
    const hingeBoltGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.118, 16);
    hingeBoltGeo.rotateX(Math.PI / 2);
    const hingeBolt = new THREE.Mesh(hingeBoltGeo, brassMat);
    hingeBolt.userData = { handle: 'move-compass' };

    const handleStemGeo = new THREE.CylinderGeometry(0.022, 0.026, 0.14, 18);
    const handleStem = new THREE.Mesh(handleStemGeo, metalMat);
    handleStem.position.y = 0.105;
    handleStem.castShadow = true;
    handleStem.userData = { handle: 'move-compass' };

    const handleCapGeo = new THREE.SphereGeometry(0.032, 18, 14);
    const handleCapMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.28,
      metalness: 0.22,
      bumpMap: this.knurlTex,
      bumpScale: 0.002,
    });
    this.handleMaterials.set('move-compass', { mat: handleCapMat, color: 0x38bdf8 });
    const handleCap = new THREE.Mesh(handleCapGeo, handleCapMat);
    handleCap.position.y = 0.175;
    handleCap.userData = { handle: 'move-compass' };

    this.compassHead.add(headBase, gearRing, hingeBolt, handleStem, handleCap);
    group.add(this.compassHead);

    // Exact L = 0.68 world units from hinge (0,0,0) to both tips
    // Pivot Leg (ends cleanly at local (0, -0.68, 0))
    this.compassPivotLeg = new THREE.Group();
    const legGeo = new THREE.CylinderGeometry(0.016, 0.012, 0.56, 12);
    const pivotUpper = new THREE.Mesh(legGeo, metalMat);
    pivotUpper.position.y = -0.28;
    pivotUpper.castShadow = true;
    pivotUpper.userData = { handle: 'move-compass' };

    const chuckGeo = new THREE.CylinderGeometry(0.017, 0.015, 0.04, 12);
    const chuck = new THREE.Mesh(chuckGeo, brassMat);
    chuck.position.y = -0.56;
    chuck.userData = { handle: 'move-compass' };

    const needleConeGeo = new THREE.ConeGeometry(0.009, 0.11, 12);
    const needleCone = new THREE.Mesh(needleConeGeo, needleMat);
    needleCone.rotation.x = Math.PI;
    needleCone.position.y = -0.625; // tip at -0.68
    needleCone.userData = { handle: 'move-compass' };

    // Subtle red target ring around needle foot
    const pivotRingGeo = new THREE.TorusGeometry(0.036, 0.006, 8, 20);
    const pivotRingMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.35 });
    const pivotRing = new THREE.Mesh(pivotRingGeo, pivotRingMat);
    pivotRing.rotation.x = Math.PI / 2;
    pivotRing.position.y = -0.675;
    pivotRing.userData = { handle: 'move-compass' };

    this.compassPivotLeg.add(pivotUpper, chuck, needleCone, pivotRing);
    this.compassHead.add(this.compassPivotLeg);

    // Drawing Pencil Leg (ends cleanly at local (0, -0.68, 0))
    this.compassPencilLeg = new THREE.Group();
    const drawUpper = new THREE.Mesh(legGeo, metalMat);
    drawUpper.position.y = -0.26;
    drawUpper.castShadow = true;
    drawUpper.userData = { handle: 'sweep-compass' };

    // Teal Radial Resize Collar on pencil leg
    const resizeGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.055, 16);
    const resizeCollar = new THREE.Mesh(resizeGeo, tealResizeMat);
    resizeCollar.position.y = -0.34;
    resizeCollar.userData = { handle: 'resize-compass' };

    const clampGeo = new THREE.BoxGeometry(0.046, 0.085, 0.052);
    const clamp = new THREE.Mesh(clampGeo, bluePlasticMat);
    clamp.position.y = -0.50;
    clamp.userData = { handle: 'sweep-compass' };

    const stubGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 6);
    const stub = new THREE.Mesh(stubGeo, woodMat);
    stub.position.y = -0.54;
    stub.userData = { handle: 'sweep-compass' };

    const pencilConeGeo = new THREE.ConeGeometry(0.015, 0.05, 10);
    const pencilCone = new THREE.Mesh(pencilConeGeo, cedarMat);
    pencilCone.rotation.x = Math.PI;
    pencilCone.position.y = -0.615;
    pencilCone.userData = { handle: 'sweep-compass' };

    const leadConeGeo = new THREE.ConeGeometry(0.008, 0.045, 10);
    const leadCone = new THREE.Mesh(leadConeGeo, graphiteMat);
    leadCone.rotation.x = Math.PI;
    leadCone.position.y = -0.6575; // tip at -0.68
    leadCone.userData = { handle: 'sweep-compass' };

    // Amber sweep drag ring right around pencil tip
    const ringGeo = new THREE.TorusGeometry(0.054, 0.009, 10, 24);
    const ringMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.28, metalness: 0.25 });
    this.handleMaterials.set('sweep-compass', { mat: ringMat, color: 0xfbbf24 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.665;
    ring.userData = { handle: 'sweep-compass' };

    this.compassPencilLeg.add(
      drawUpper,
      resizeCollar,
      clamp,
      stub,
      pencilCone,
      leadCone,
      ring,
    );
    this.compassHead.add(this.compassPencilLeg);

    // Precision micrometer adjustment cross-bar + knurled brass thumbwheel (centered under compassHead)
    const screwBarGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.3, 12);
    screwBarGeo.rotateZ(Math.PI / 2);
    this.compassScrewBar = new THREE.Mesh(screwBarGeo, metalMat);
    this.compassScrewBar.position.set(0, -0.24, 0);
    this.compassScrewBar.castShadow = true;
    this.compassScrewBar.userData = { handle: 'resize-compass' };

    this.compassScrewWheel = new THREE.Group();
    this.compassScrewWheel.position.set(0, -0.24, 0);
    const wheelHubGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.018, 22);
    wheelHubGeo.rotateZ(Math.PI / 2);
    const wheelHub = new THREE.Mesh(wheelHubGeo, brassMat);
    wheelHub.castShadow = true;
    wheelHub.userData = { handle: 'resize-compass' };
    const wheelRimGeo = new THREE.TorusGeometry(0.024, 0.004, 8, 22);
    wheelRimGeo.rotateY(Math.PI / 2);
    const wheelRim = new THREE.Mesh(wheelRimGeo, metalMat);
    wheelRim.userData = { handle: 'resize-compass' };
    this.compassScrewWheel.add(wheelHub, wheelRim);
    this.compassHead.add(this.compassScrewBar, this.compassScrewWheel);

    this.disposables.push(
      metalMat,
      brassMat,
      bluePlasticMat,
      handleCapMat,
      tealResizeMat,
      needleMat,
      woodMat,
      cedarMat,
      graphiteMat,
      headBaseGeo,
      gearRingGeo,
      hingeBoltGeo,
      handleStemGeo,
      handleCapGeo,
      legGeo,
      chuckGeo,
      needleConeGeo,
      pivotRingGeo,
      pivotRingMat,
      resizeGeo,
      clampGeo,
      stubGeo,
      pencilConeGeo,
      leadConeGeo,
      ringGeo,
      ringMat,
      screwBarGeo,
      wheelHubGeo,
      wheelRimGeo,
    );
    return group;
  }

  private buildPencilModel(): THREE.Group {
    const group = new THREE.Group();

    const woodShaftGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.65, 6);
    const yellowMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.45 });
    const shaft = new THREE.Mesh(woodShaftGeo, yellowMat);
    shaft.position.y = 0.42;
    shaft.castShadow = true;

    const coneGeo = new THREE.ConeGeometry(0.022, 0.095, 12);
    const cedarMat = new THREE.MeshStandardMaterial({ color: '#e6be8a', roughness: 0.75 });
    const cone = new THREE.Mesh(coneGeo, cedarMat);
    cone.rotation.x = Math.PI;
    cone.position.y = 0.05;

    const tipGeo = new THREE.ConeGeometry(0.008, 0.032, 10);
    const tipMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.85 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.rotation.x = Math.PI;
    tip.position.y = 0.016;

    const ferruleGeo = new THREE.CylinderGeometry(0.023, 0.023, 0.05, 16);
    const ferruleMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      metalness: 0.88,
      roughness: 0.2,
      envMapIntensity: 1.25,
    });
    const ferrule = new THREE.Mesh(ferruleGeo, ferruleMat);
    ferrule.position.y = 0.77;

    // Machined ferrule crimp bands & lower steel collar near cedar cone
    const crimpGeo = new THREE.TorusGeometry(0.0235, 0.0024, 8, 20);
    const crimpTop = new THREE.Mesh(crimpGeo, ferruleMat);
    crimpTop.rotation.x = Math.PI / 2;
    crimpTop.position.y = 0.788;
    const crimpBot = new THREE.Mesh(crimpGeo, ferruleMat);
    crimpBot.rotation.x = Math.PI / 2;
    crimpBot.position.y = 0.752;
    const collarGeo = new THREE.CylinderGeometry(0.023, 0.0225, 0.014, 16);
    const collar = new THREE.Mesh(collarGeo, ferruleMat);
    collar.position.y = 0.095;

    const eraserGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.05, 16);
    const eraserMat = new THREE.MeshStandardMaterial({ color: '#fb7185', roughness: 0.85 });
    const eraser = new THREE.Mesh(eraserGeo, eraserMat);
    eraser.position.y = 0.82;

    const tipHaloGeo = new THREE.RingGeometry(0.018, 0.028, 24);
    const tipHaloMat = new THREE.MeshBasicMaterial({
      color: '#0284c7',
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const tipHalo = new THREE.Mesh(tipHaloGeo, tipHaloMat);
    tipHalo.rotation.x = -Math.PI / 2;
    tipHalo.position.y = 0.002;

    group.add(shaft, cone, tip, ferrule, crimpTop, crimpBot, collar, eraser, tipHalo);
    group.rotation.z = -0.24;
    group.rotation.x = 0.16;
    group.visible = false;

    this.disposables.push(
      woodShaftGeo,
      yellowMat,
      coneGeo,
      cedarMat,
      tipGeo,
      tipMat,
      ferruleGeo,
      ferruleMat,
      crimpGeo,
      collarGeo,
      eraserGeo,
      eraserMat,
      tipHaloGeo,
      tipHaloMat,
    );
    return group;
  }

  public updateState(next: Partial<ClassroomEngineState>): void {
    const prevSheet = this.state.sheet;
    const prevSheetType = this.state.sheetType;
    const prevPreset = this.state.cameraPreset;
    const prevTool = this.state.activeTool;
    const prevProt = this.state.poses.protractor;
    const prevProtVis = this.state.poses.visibleTools.protractor;
    const prevComp = this.state.poses.compass;
    const prevCompVis = this.state.poses.visibleTools.compass;
    const prevDemoPreview = this.state.demoPreview;
    const prevDemoPencil = this.state.demoPencilPose;

    this.state = { ...this.state, ...next };

    if (next.poses !== undefined || next.demoPencilPose !== undefined) {
      this.syncToolsTransform();
    }

    if (next.activeTool !== undefined || next.demoPencilPose !== undefined) {
      const showPencil =
        Boolean(this.state.demoPencilPose) ||
        this.state.activeTool === 'pencil' ||
        this.state.activeTool === 'mark';
      this.pencilGroup.visible = showPencil;
      if (!showPencil) {
        this.pencilShadow.visible = false;
      }
    }

    const protChanged =
      next.poses !== undefined &&
      (next.poses.protractor !== prevProt ||
        next.poses.visibleTools.protractor !== prevProtVis);
    const compChanged =
      next.poses !== undefined &&
      (next.poses.compass !== prevComp ||
        next.poses.visibleTools.compass !== prevCompVis);

    if (
      (next.sheet !== undefined && next.sheet !== prevSheet) ||
      (next.sheetType !== undefined && next.sheetType !== prevSheetType) ||
      (next.activeTool !== undefined && next.activeTool !== prevTool) ||
      (next.demoPreview !== undefined && next.demoPreview !== prevDemoPreview) ||
      (next.demoPencilPose !== undefined && next.demoPencilPose !== prevDemoPencil) ||
      protChanged ||
      compChanged
    ) {
      this.syncPaperCanvas();
    }

    if (next.cameraPreset !== undefined && next.cameraPreset !== prevPreset) {
      const target = CAMERA_PRESETS[next.cameraPreset];
      this.targetCamPos.copy(target.pos);
      this.targetCamLook.copy(target.target);
      this.cameraAnimating = true;
    }

    this.requestRender();
  }

  private syncPaperCanvas(): void {
    const showProtractorGuide =
      this.state.activeTool === 'protractor' &&
      this.state.poses.visibleTools.protractor;
    const showCompassGuide =
      this.state.activeTool === 'compass' &&
      this.state.poses.visibleTools.compass &&
      this.state.poses.compass.needlePlanted;
    const activePreview = this.previewStroke || this.state.demoPreview || null;
    renderPaperToCanvas(
      this.paperCtx,
      this.state.sheet,
      this.state.sheetType,
      activePreview,
      this.activeSnap,
      showProtractorGuide ? this.state.poses.protractor : null,
      showCompassGuide ? this.state.poses.compass : null,
    );
    this.paperTexture.needsUpdate = true;
  }

  private syncToolsTransform(): void {
    const { ruler, setSquare, protractor, compass, visibleTools } = this.state.poses;

    // Ruler
    this.rulerGroup.visible = visibleTools.ruler;
    this.rulerGroup.position.set(
      ruler.x * CM_TO_WORLD,
      0.018,
      -ruler.y * CM_TO_WORLD,
    );
    this.rulerGroup.rotation.y = degToRad(ruler.angleDeg);

    // Set Square
    this.setSquareGroup.visible = visibleTools.setSquare;
    this.setSquareGroup.position.set(
      setSquare.x * CM_TO_WORLD,
      0.022,
      -setSquare.y * CM_TO_WORLD,
    );
    this.setSquareGroup.rotation.y = degToRad(setSquare.angleDeg);
    this.setSquareGroup.scale.set(1, 1, setSquare.flipped ? -1 : 1);

    // Protractor
    this.protractorGroup.visible = visibleTools.protractor;
    this.protractorGroup.position.set(
      protractor.x * CM_TO_WORLD,
      0.026,
      -protractor.y * CM_TO_WORLD,
    );
    this.protractorGroup.rotation.y = degToRad(protractor.angleDeg);

    // Compass (exact L = 0.68 trigonometric leg spread so both tips sit at y = 0 + liftCm)
    this.compassGroup.visible = visibleTools.compass;
    const rW = Math.max(0.04, compass.radiusCm * CM_TO_WORLD);
    const legLen = 0.68;
    const halfSpan = Math.min(0.60, rW / 2);
    const halfAngle = Math.asin(Math.min(0.92, halfSpan / legLen));
    const headHeight = Math.cos(halfAngle) * legLen;
    const liftW = (compass.liftCm ?? 0) * CM_TO_WORLD;

    this.compassGroup.position.set(
      compass.cx * CM_TO_WORLD,
      0.017 + liftW,
      -compass.cy * CM_TO_WORLD,
    );
    this.compassGroup.rotation.order = 'YXZ';
    this.compassGroup.rotation.y = degToRad(compass.armAngleDeg);
    // Subtle forward tangent lean while sweeping keeps both tips on y=0 in YXZ order
    this.compassGroup.rotation.x = compass.sweeping
      ? -0.095
      : compass.needlePlanted
      ? 0
      : 0.06;

    // Pivot leg anchored at local (0,0,0), head shifts along +X by rW/2
    this.compassHead.position.set(rW / 2, headHeight, 0);
    this.compassPivotLeg.rotation.z = -halfAngle;
    this.compassPencilLeg.rotation.z = halfAngle;

    // Sync micrometer screw bar width cleanly between the two compass legs at y = -0.24 below head
    const barSpan = Math.max(0.08, 2 * Math.sin(halfAngle) * 0.24 * 1.15);
    this.compassScrewBar.scale.x = barSpan / 0.3;
    this.compassScrewBar.visible = rW > 0.06;
    this.compassScrewWheel.visible = rW > 0.06;

    // Height-responsive dynamic contact shadows for compass needle & pencil tip
    const compassLift = Math.max(0, compass.liftCm ?? 0);
    const compFade = Math.max(0.14, 1 - compassLift / 3.8);
    const compScale = 0.72 + compassLift * 0.24;
    this.compassNeedleShadow.visible = visibleTools.compass;
    this.compassTipShadow.visible = visibleTools.compass;
    if (visibleTools.compass) {
      this.compassNeedleShadow.position.set(
        compass.cx * CM_TO_WORLD,
        0.0172,
        -compass.cy * CM_TO_WORLD,
      );
      this.compassNeedleShadow.scale.set(compScale, compScale, 1);
      this.contactShadowMatNeedle.opacity = 0.45 * compFade;

      const armRad = degToRad(compass.armAngleDeg);
      const tipX = compass.cx + compass.radiusCm * Math.cos(armRad);
      const tipY = compass.cy + compass.radiusCm * Math.sin(armRad);
      this.compassTipShadow.position.set(
        tipX * CM_TO_WORLD,
        0.0172,
        -tipY * CM_TO_WORLD,
      );
      this.compassTipShadow.scale.set(compScale, compScale, 1);
      this.contactShadowMatTip.opacity = 0.42 * compFade;
    }

    // Demo animated 3D Pencil pose + ground contact shadow
    const dp = this.state.demoPencilPose;
    if (dp) {
      const pLift = Math.max(0, dp.liftCm ?? 0);
      const pFade = Math.max(0.16, 1 - pLift / 3.5);
      const pScale = 0.78 + pLift * 0.22;
      this.pencilGroup.visible = true;
      this.pencilGroup.position.set(
        dp.x * CM_TO_WORLD,
        0.018 + pLift * CM_TO_WORLD,
        -dp.y * CM_TO_WORLD,
      );
      this.pencilShadow.visible = true;
      this.pencilShadow.position.set(
        dp.x * CM_TO_WORLD,
        0.0172,
        -dp.y * CM_TO_WORLD,
      );
      this.pencilShadow.scale.set(pScale, pScale, 1);
      this.contactShadowMatPencil.opacity = 0.48 * pFade;
    } else if (!this.pencilGroup.visible) {
      this.pencilShadow.visible = false;
    }
  }

  private getRayPaperHit(clientX: number, clientY: number): {
    x: number;
    y: number;
    inside: boolean;
  } | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    _ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_ndc, this.camera);
    const intersected = _raycaster.ray.intersectPlane(_paperPlane, _hit);
    if (!intersected) return null;

    const px = _hit.x / CM_TO_WORLD;
    const py = -_hit.z / CM_TO_WORLD;
    const inside =
      Math.abs(px) <= PAPER_HALF_W && Math.abs(py) <= PAPER_HALF_H;
    return { x: px, y: py, inside };
  }

  private findHitHandle(clientX: number, clientY: number): string | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    _ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster.setFromCamera(_ndc, this.camera);

    const targets: THREE.Object3D[] = [];
    if (this.rulerGroup.visible) targets.push(this.rulerGroup);
    if (this.setSquareGroup.visible) targets.push(this.setSquareGroup);
    if (this.protractorGroup.visible) targets.push(this.protractorGroup);
    if (this.compassGroup.visible) targets.push(this.compassGroup);

    const hits = _raycaster.intersectObjects(targets, true);
    for (const h of hits) {
      let cur: THREE.Object3D | null = h.object;
      while (cur) {
        if (cur.userData?.handle) return cur.userData.handle as string;
        cur = cur.parent;
      }
    }
    return null;
  }

  private maybePlaySnap(snap: SnapResult): void {
    if (!snap.kind) {
      this.lastSnapKey = '';
      return;
    }
    const key = `${snap.kind}:${snap.x.toFixed(2)},${snap.y.toFixed(2)}`;
    if (key !== this.lastSnapKey) {
      this.lastSnapKey = key;
      this.callbacks.onSnapTrigger(snap);
    }
  }

  private bindEvents(): void {
    const canvas = this.renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (this.state.isDemoRunning || e.button !== 0) return;

      const paperHit = this.getRayPaperHit(e.clientX, e.clientY);
      const handle = this.findHitHandle(e.clientX, e.clientY);

      // Priority 1: Eraser / Mark / Pencil actions on paper when those tools are selected
      if (paperHit && paperHit.inside) {
        if (this.state.activeTool === 'eraser') {
          this.callbacks.onEraseAt(paperHit.x, paperHit.y);
          return;
        }

        if (this.state.activeTool === 'mark') {
          const snap = computeSnapPoint(
            paperHit.x,
            paperHit.y,
            this.state.sheet,
            this.state.poses,
            this.state.snapEnabled,
            this.state.sheetType,
            false,
          );
          if (this.state.activeMarkType === 'point-label') {
            this.callbacks.onAddPoint({
              x: snap.x,
              y: snap.y,
              label: this.state.nextPointLabel,
              role: 'user',
            });
          } else {
            // Auto-orient mark along nearest line if available
            let angleDeg = 0;
            let minD = 0.8;
            for (const l of this.state.sheet.lines) {
              const seg = pointToSegmentDist(snap.x, snap.y, l.x1, l.y1, l.x2, l.y2);
              if (seg.dist < minD) {
                minD = seg.dist;
                angleDeg = radToDeg(Math.atan2(l.y2 - l.y1, l.x2 - l.x1));
              }
            }
            this.callbacks.onAddMark({
              type: this.state.activeMarkType,
              x: snap.x,
              y: snap.y,
              angleDeg,
              color:
                this.state.activeMarkType === 'right-angle'
                  ? '#dc2626'
                  : '#059669',
            });
          }
          return;
        }

        // Grip & rotate knobs stay draggable even in Pencil mode; acrylic bodies drag when not drawing with Pencil
        const isKnobHandle = Boolean(
          handle && (handle.endsWith('-knob') || handle.startsWith('rotate-')),
        );
        if (handle && (this.state.activeTool !== 'pencil' || isKnobHandle)) {
          this.controls.enabled = false;
          canvas.setPointerCapture(e.pointerId);
          this.dragStartPaper = { x: paperHit.x, y: paperHit.y };

          if (handle === 'move-ruler' || handle === 'move-ruler-knob') {
            this.dragMode = 'move-ruler';
            this.dragOffset = {
              x: this.state.poses.ruler.x - paperHit.x,
              y: this.state.poses.ruler.y - paperHit.y,
            };
          } else if (handle === 'rotate-ruler') {
            this.dragMode = 'rotate-ruler';
          } else if (handle === 'move-setSquare' || handle === 'move-setSquare-knob') {
            this.dragMode = 'move-setSquare';
            this.dragOffset = {
              x: this.state.poses.setSquare.x - paperHit.x,
              y: this.state.poses.setSquare.y - paperHit.y,
            };
          } else if (handle === 'rotate-setSquare') {
            this.dragMode = 'rotate-setSquare';
          } else if (handle === 'move-protractor' || handle === 'move-protractor-knob') {
            this.dragMode = 'move-protractor';
            this.dragOffset = {
              x: this.state.poses.protractor.x - paperHit.x,
              y: this.state.poses.protractor.y - paperHit.y,
            };
          } else if (handle === 'rotate-protractor') {
            this.dragMode = 'rotate-protractor';
          } else if (handle === 'move-compass') {
            this.dragMode = 'move-compass';
            this.dragOffset = {
              x: this.state.poses.compass.cx - paperHit.x,
              y: this.state.poses.compass.cy - paperHit.y,
            };
          } else if (handle === 'resize-compass') {
            this.dragMode = 'resize-compass';
          } else if (handle === 'sweep-compass') {
            this.dragMode = 'sweep-compass';
            const ang = radToDeg(
              Math.atan2(
                paperHit.y - this.state.poses.compass.cy,
                paperHit.x - this.state.poses.compass.cx,
              ),
            );
            this.compassSweepStartDeg = ang;
            this.compassSweepCurrentDeg = ang;
          }
          return;
        }

        // Pencil tool drawing on paper (with magnetic + straightedge snap!)
        if (this.state.activeTool === 'pencil') {
          this.controls.enabled = false;
          canvas.setPointerCapture(e.pointerId);
          const snap = computeSnapPoint(
            paperHit.x,
            paperHit.y,
            this.state.sheet,
            this.state.poses,
            this.state.snapEnabled,
            this.state.sheetType,
            true,
          );
          this.maybePlaySnap(snap);
          this.dragMode = 'draw-pencil';
          this.dragStartPaper = { x: snap.x, y: snap.y };
          this.previewStroke = {
            kind: 'line',
            x1: snap.x,
            y1: snap.y,
            x2: snap.x,
            y2: snap.y,
            style: this.state.lineStyle,
          };
          this.syncPaperCanvas();
          this.requestRender();
          return;
        }

        // Smart proximity interaction when Compass tool is active
        if (this.state.activeTool === 'compass' && this.state.poses.visibleTools.compass) {
          this.controls.enabled = false;
          canvas.setPointerCapture(e.pointerId);
          const comp = this.state.poses.compass;
          const armRad = degToRad(comp.armAngleDeg);
          const tipX = comp.cx + comp.radiusCm * Math.cos(armRad);
          const tipY = comp.cy + comp.radiusCm * Math.sin(armRad);
          const distToTip = dist2D(paperHit.x, paperHit.y, tipX, tipY);
          const distToNeedle = dist2D(paperHit.x, paperHit.y, comp.cx, comp.cy);

          if (e.shiftKey || distToTip <= 0.95) {
            this.dragMode = 'sweep-compass';
            const ang = radToDeg(Math.atan2(paperHit.y - comp.cy, paperHit.x - comp.cx));
            this.compassSweepStartDeg = ang;
            this.compassSweepCurrentDeg = ang;
          } else if (e.altKey) {
            this.dragMode = 'resize-compass';
          } else if (distToNeedle <= 0.95) {
            this.dragMode = 'move-compass';
            this.dragOffset = { x: comp.cx - paperHit.x, y: comp.cy - paperHit.y };
          } else {
            const snap = computeSnapPoint(
              paperHit.x,
              paperHit.y,
              this.state.sheet,
              this.state.poses,
              this.state.snapEnabled,
              this.state.sheetType,
              false,
            );
            this.maybePlaySnap(snap);
            const nextPoses: ToolPoses = {
              ...this.state.poses,
              compass: { ...comp, cx: snap.x, cy: snap.y },
            };
            this.updateState({ poses: nextPoses });
            this.callbacks.onPosesChange(nextPoses);
            this.dragMode = 'move-compass';
            this.dragOffset = { x: 0, y: 0 };
          }
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const paperHit = this.getRayPaperHit(e.clientX, e.clientY);
      if (paperHit) {
        const snap = computeSnapPoint(
          paperHit.x,
          paperHit.y,
          this.state.sheet,
          this.state.poses,
          this.state.snapEnabled,
          this.state.sheetType,
          this.state.activeTool === 'pencil',
        );
        this.activeSnap = paperHit.inside ? snap : null;
        this.lastHoverPaper = {
          x: snap.x,
          y: snap.y,
          inside: paperHit.inside,
        };

        // Move 3D Pencil & its ground contact shadow smoothly above the paper cursor
        if (this.pencilGroup.visible && paperHit.inside) {
          this.pencilGroup.position.set(
            snap.x * CM_TO_WORLD,
            0.022,
            -snap.y * CM_TO_WORLD,
          );
          this.pencilShadow.visible = true;
          this.pencilShadow.position.set(
            snap.x * CM_TO_WORLD,
            0.0172,
            -snap.y * CM_TO_WORLD,
          );
          this.pencilShadow.scale.set(0.78, 0.78, 1);
          this.contactShadowMatPencil.opacity = 0.48;
          this.requestRender();
        } else if (!paperHit.inside && !this.state.demoPencilPose) {
          this.pencilShadow.visible = false;
        }

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.callbacks.onHoverPaper({
          paperX: snap.x,
          paperY: snap.y,
          screenX: e.clientX - rect.left,
          screenY: e.clientY - rect.top,
          snap,
          insidePaper: paperHit.inside,
        });

        if (this.dragMode === 'none') {
          const h = this.findHitHandle(e.clientX, e.clientY);
          if (h !== this.hoveredHandle) {
            if (this.hoveredHandle) {
              const prev = this.handleMaterials.get(this.hoveredHandle);
              if (prev) {
                prev.mat.emissive.setHex(0x000000);
                prev.mat.emissiveIntensity = 0;
              }
            }
            this.hoveredHandle = h;
            if (h) {
              const next = this.handleMaterials.get(h);
              if (next) {
                next.mat.emissive.setHex(next.color);
                next.mat.emissiveIntensity = 0.34;
              }
            }
            this.requestRender();
          }

          const hIsKnob = Boolean(h && (h.endsWith('-knob') || h.startsWith('rotate-')));
          canvas.style.cursor = hIsKnob
            ? 'grab'
            : this.state.activeTool === 'pencil' && paperHit.inside
            ? 'crosshair'
            : h
            ? 'grab'
            : 'default';
          const hasSnap = Boolean(paperHit.inside && snap.kind);
          if (hasSnap || this.hadSnapHalo) {
            this.hadSnapHalo = hasSnap;
            this.syncPaperCanvas();
            this.requestRender();
          }
          return;
        }

        canvas.style.cursor = 'grabbing';
        const poses = this.state.poses;

        if (this.dragMode === 'move-ruler') {
          const raw = clampToPaper(
            paperHit.x + this.dragOffset.x,
            paperHit.y + this.dragOffset.y,
          );
          const s = computeSnapPoint(raw.x, raw.y, this.state.sheet, poses, this.state.snapEnabled, this.state.sheetType, false);
          this.maybePlaySnap(s);
          const next = { ...poses, ruler: { ...poses.ruler, x: s.x, y: s.y } };
          this.updateState({ poses: next });
          this.callbacks.onPosesChange(next);
        } else if (this.dragMode === 'rotate-ruler') {
          let ang = radToDeg(Math.atan2(paperHit.y - poses.ruler.y, paperHit.x - poses.ruler.x));
          if (this.state.snapEnabled) {
            const snapAng = Math.round(ang / 15) * 15;
            if (Math.abs(ang - snapAng) < 3.5) ang = snapAng;
          }
          const next = { ...poses, ruler: { ...poses.ruler, angleDeg: normalizeDeg(ang) } };
          this.updateState({ poses: next });
          this.callbacks.onPosesChange(next);
        } else if (this.dragMode === 'move-setSquare') {
          const raw = clampToPaper(
            paperHit.x + this.dragOffset.x,
            paperHit.y + this.dragOffset.y,
          );
          const s = computeSnapPoint(raw.x, raw.y, this.state.sheet, poses, this.state.snapEnabled, this.state.sheetType, false);
          this.maybePlaySnap(s);
          const next = { ...poses, setSquare: { ...poses.setSquare, x: s.x, y: s.y } };
          this.updateState({ poses: next });
          this.callbacks.onPosesChange(next);
        } else if (this.dragMode === 'rotate-setSquare') {
          const apexOffset = poses.setSquare.flipped ? 90 : -90;
          let ang =
            radToDeg(Math.atan2(paperHit.y - poses.setSquare.y, paperHit.x - poses.setSquare.x)) +
            apexOffset;
          if (this.state.snapEnabled) {
            const snapAng = Math.round(ang / 15) * 15;
            if (Math.abs(ang - snapAng) < 3.5) ang = snapAng;
          }
          const next = { ...poses, setSquare: { ...poses.setSquare, angleDeg: normalizeDeg(ang) } };
          this.updateState({ poses: next });
          this.callbacks.onPosesChange(next);
        } else if (this.dragMode === 'move-protractor') {
          const raw = clampToPaper(
            paperHit.x + this.dragOffset.x,
            paperHit.y + this.dragOffset.y,
          );
          const s = computeSnapPoint(raw.x, raw.y, this.state.sheet, poses, this.state.snapEnabled, this.state.sheetType, false);
          this.maybePlaySnap(s);
          const next = { ...poses, protractor: { ...poses.protractor, x: s.x, y: s.y } };
          this.updateState({ poses: next });
          this.callbacks.onPosesChange(next);
        } else if (this.dragMode === 'rotate-protractor') {
          let ang = radToDeg(Math.atan2(paperHit.y - poses.protractor.y, paperHit.x - poses.protractor.x)) - 90;
          if (this.state.snapEnabled) {
            const snapAng = Math.round(ang / 15) * 15;
            if (Math.abs(ang - snapAng) < 3.5) ang = snapAng;
          }
          const next = { ...poses, protractor: { ...poses.protractor, angleDeg: normalizeDeg(ang) } };
          this.updateState({ poses: next });
          this.callbacks.onPosesChange(next);
        } else if (this.dragMode === 'move-compass') {
          const raw = clampToPaper(
            paperHit.x + this.dragOffset.x,
            paperHit.y + this.dragOffset.y,
          );
          const s = computeSnapPoint(raw.x, raw.y, this.state.sheet, poses, this.state.snapEnabled, this.state.sheetType, false);
          this.maybePlaySnap(s);
          const next = { ...poses, compass: { ...poses.compass, cx: s.x, cy: s.y } };
          this.updateState({ poses: next });
          this.callbacks.onPosesChange(next);
        } else if (this.dragMode === 'resize-compass') {
          const rawDist = dist2D(paperHit.x, paperHit.y, poses.compass.cx, poses.compass.cy);
          const step = e.shiftKey ? 0.1 : 0.5;
          const snappedR = Math.max(0.5, Math.min(10.0, Math.round(rawDist / step) * step));
          const ang = radToDeg(
            Math.atan2(paperHit.y - poses.compass.cy, paperHit.x - poses.compass.cx),
          );
          const next = {
            ...poses,
            compass: { ...poses.compass, radiusCm: snappedR, armAngleDeg: ang },
          };
          this.updateState({ poses: next });
          this.callbacks.onPosesChange(next);
          this.syncPaperCanvas();
        } else if (this.dragMode === 'sweep-compass') {
          let ang = radToDeg(
            Math.atan2(paperHit.y - poses.compass.cy, paperHit.x - poses.compass.cx),
          );
          if (e.shiftKey) {
            const rel = ang - this.compassSweepStartDeg;
            ang = this.compassSweepStartDeg + Math.round(rel / 15) * 15;
          }
          // Unwrap angle smoothly relative to current
          let diff = ang - this.compassSweepCurrentDeg;
          while (diff > 180) diff -= 360;
          while (diff < -180) diff += 360;
          this.compassSweepCurrentDeg += diff;

          const next = {
            ...poses,
            compass: { ...poses.compass, armAngleDeg: this.compassSweepCurrentDeg },
          };
          this.previewStroke = {
            kind: 'arc',
            cx: poses.compass.cx,
            cy: poses.compass.cy,
            radiusCm: poses.compass.radiusCm,
            startDeg: this.compassSweepStartDeg,
            endDeg: this.compassSweepCurrentDeg,
            style: 'construction',
          };
          this.updateState({ poses: next });
          this.callbacks.onPosesChange(next);
          this.syncPaperCanvas();
        } else if (this.dragMode === 'draw-pencil') {
          let endX = snap.x;
          let endY = snap.y;
          if (e.shiftKey) {
            const dx = endX - this.dragStartPaper.x;
            const dy = endY - this.dragStartPaper.y;
            const len = Math.hypot(dx, dy);
            if (len > 0.1) {
              const lockAng = Math.round(radToDeg(Math.atan2(dy, dx)) / 15) * 15;
              const lockRad = degToRad(lockAng);
              endX = this.dragStartPaper.x + len * Math.cos(lockRad);
              endY = this.dragStartPaper.y + len * Math.sin(lockRad);
            }
          }
          this.maybePlaySnap(snap);
          this.previewStroke = {
            kind: 'line',
            x1: this.dragStartPaper.x,
            y1: this.dragStartPaper.y,
            x2: endX,
            y2: endY,
            style: this.state.lineStyle,
          };
          this.syncPaperCanvas();
          this.requestRender();
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (this.dragMode === 'none') return;

      if (this.dragMode === 'draw-pencil' && this.previewStroke && this.previewStroke.kind === 'line') {
        const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = this.previewStroke;
        if (dist2D(x1, y1, x2, y2) >= 0.25) {
          this.callbacks.onAddLine({
            x1,
            y1,
            x2,
            y2,
            kind: 'segment',
            style: this.state.lineStyle,
            color: this.state.lineStyle === 'construction' ? '#2563eb' : '#0f172a',
          });
          this.callbacks.onDrawSound();
        }
      } else if (this.dragMode === 'sweep-compass') {
        const span = Math.abs(this.compassSweepCurrentDeg - this.compassSweepStartDeg);
        if (span >= 8) {
          this.callbacks.onAddArc({
            cx: this.state.poses.compass.cx,
            cy: this.state.poses.compass.cy,
            radiusCm: this.state.poses.compass.radiusCm,
            startDeg: this.compassSweepStartDeg,
            endDeg: this.compassSweepCurrentDeg,
            style: 'construction',
            color: '#2563eb',
          });
          this.callbacks.onDrawSound();
        }
      }

      this.dragMode = 'none';
      this.previewStroke = null;
      this.controls.enabled = true;
      canvas.style.cursor = 'default';
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }
      this.syncPaperCanvas();
      this.requestRender();
    };

    const onResize = () => {
      if (this.disposed) return;
      const w = Math.max(this.container.clientWidth, 320);
      const h = Math.max(this.container.clientHeight, 240);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.requestRender();
    };

    const onWheel = (e: WheelEvent) => {
      if (this.state.isDemoRunning) return;
      const poses = this.state.poses;
      if (!poses.visibleTools.compass) return;
      const h = this.findHitHandle(e.clientX, e.clientY);
      const hoveringCompass = Boolean(
        h === 'move-compass' || h === 'sweep-compass' || h === 'resize-compass',
      );
      if (hoveringCompass || (this.state.activeTool === 'compass' && e.altKey)) {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY < 0 ? 1 : -1;
        const step = e.shiftKey ? 0.1 : 0.5;
        const nextR = Math.max(
          0.5,
          Math.min(10.0, Math.round((poses.compass.radiusCm + delta * step) * 10) / 10),
        );
        const nextPoses: ToolPoses = {
          ...poses,
          compass: { ...poses.compass, radiusCm: nextR },
        };
        this.updateState({ poses: nextPoses });
        this.callbacks.onPosesChange(nextPoses);
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', onResize);

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(this.container);

    this.disposables.push({
      dispose: () => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('wheel', onWheel, { capture: true });
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('resize', onResize);
        resizeObserver.disconnect();
      },
    });
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || !gl.fenceSync) {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  public requestRender(): void {
    if (this.disposed) return;
    if (this.renderBusy) {
      this.renderDirty = true;
      return;
    }
    this.renderBusy = true;
    this.frameId = requestAnimationFrame(() => {
      if (this.disposed) return;
      this.renderDirty = false;
      const delta = Math.min(this.clock.getDelta(), 0.1);

      if (this.cameraAnimating) {
        const lambda = 7.5;
        this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCamPos.x, lambda, delta);
        this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCamPos.y, lambda, delta);
        this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCamPos.z, lambda, delta);
        this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this.targetCamLook.x, lambda, delta);
        this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this.targetCamLook.y, lambda, delta);
        this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this.targetCamLook.z, lambda, delta);

        const posDist = this.camera.position.distanceTo(this.targetCamPos);
        const tgtDist = this.controls.target.distanceTo(this.targetCamLook);
        if (posDist < 0.008 && tgtDist < 0.008) {
          this.camera.position.copy(this.targetCamPos);
          this.controls.target.copy(this.targetCamLook);
          this.cameraAnimating = false;
        } else {
          this.renderDirty = true;
        }
      }

      const dampingMoved = this.controls.update();
      if (dampingMoved && !this.isSoftwareGl) {
        this.renderDirty = true;
      }

      this.renderer.render(this.scene, this.camera);

      const done = () => {
        this.renderBusy = false;
        if (this.renderDirty) {
          this.requestRender();
        }
      };

      if (this.isSoftwareGl) {
        this.afterDraw(done);
      } else {
        done();
      }
    });
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.controls.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
