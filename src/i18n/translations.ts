import { Language, LocalizedText } from '../types/geometry';

export interface Translations {
  brandTitle: string;
  brandSubtitle: string;
  leftDeckTitle: string;
  rightDeckTitle: string;
  modes: {
    guided: string;
    challenge: string;
    sandbox: string;
  };
  sections: {
    modes: string;
    curriculum: string;
    sheetType: string;
    cameraView: string;
    toolKit: string;
    toolAdjustments: string;
    examMarks: string;
    precisionAids: string;
  };
  sheetTypes: {
    plain: string;
    millimeter: string;
    dots: string;
  };
  cameraPresets: {
    classroom3d: string;
    top2d: string;
    zoomPaper: string;
  };
  tools: {
    ruler: string;
    setSquare: string;
    protractor: string;
    compass: string;
    pencil: string;
    eraser: string;
    mark: string;
  };
  toolDescriptions: {
    ruler: string;
    setSquare: string;
    protractor: string;
    compass: string;
    pencil: string;
    eraser: string;
    mark: string;
  };
  marks: {
    'right-angle': string;
    'equal-1': string;
    'equal-2': string;
    'angle-arc': string;
    'point-label': string;
  };
  controls: {
    showToolOnDesk: string;
    hideToolFromDesk: string;
    positionX: string;
    positionY: string;
    angleDeg: string;
    radiusCm: string;
    lengthCm: string;
    flipSetSquare: string;
    drawAlongRuler: string;
    drawAlongSquareBase: string;
    drawAlongSquareLeg: string;
    putAllAway: string;
    drawFullCircle: string;
    sweepArc90: string;
    sweepArc60: string;
    plantNeedleToggle: string;
    lineStyleSolid: string;
    lineStyleConstruction: string;
    magneticSnap: string;
    smartLoupe: string;
    undo: string;
    redo: string;
    clearSheet: string;
    resetLesson: string;
    showDemo: string;
    stopDemo: string;
    verifyWork: string;
    nextStep: string;
    prevStep: string;
    certificateBtn: string;
    collapsePanel: string;
    expandPanel: string;
    pupilNamePlaceholder: string;
    targetAngleDeg: string;
    markAngleRay: string;
    exportSheetPng: string;
    shortcutsHint: string;
  };
  mentor: {
    name: string;
    title: string;
    welcomeGuided: string;
    welcomeChallenge: string;
    welcomeSandbox: string;
    demoRunning: string;
    demoFinished: string;
    snapLocked: string;
  };
  certificate: {
    heading: string;
    subheading: string;
    awardedTo: string;
    bodyText: string;
    completedCount: string;
    starsEarned: string;
    signedBy: string;
    teacherRole: string;
    dateLabel: string;
    downloadPng: string;
    printBtn: string;
    closeBtn: string;
    lockedNotice: string;
    defaultPupil: string;
  };
  status: {
    stars: string;
    completed: string;
    stepOf: string;
    cmUnit: string;
    degUnit: string;
    snapPoint: string;
    snapMidpoint: string;
    snapIntersection: string;
    snapRulerEdge: string;
    snapGrid: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  ar: {
    brandTitle: 'مختبر الهندسة · الأستاذ مجدي',
    brandSubtitle: 'السنة السادسة أساسي',
    leftDeckTitle: 'الدروس والتحديات',
    rightDeckTitle: 'علبة الأدوات الهندسية',
    modes: {
      guided: 'التعلّم الموجّه',
      challenge: 'التحدّيات',
      sandbox: 'المختبر الحر',
    },
    sections: {
      modes: 'وضع العمل',
      curriculum: 'برنامج السنة السادسة',
      sheetType: 'نوع الورقة',
      cameraView: 'زاوية الكاميرا',
      toolKit: 'أدواتي الهندسية',
      toolAdjustments: 'ضبط الأداة النشطة',
      examMarks: 'التشفير الهندسي',
      precisionAids: 'مساعدات الدقة',
    },
    sheetTypes: {
      plain: 'ورقة بيضاء',
      millimeter: 'ورق مليمتري',
      dots: 'شبكة نقطية',
    },
    cameraPresets: {
      classroom3d: 'منظور مائل 3D',
      top2d: 'عمودي للرسم 2D',
      zoomPaper: 'تقريب الورقة',
    },
    tools: {
      ruler: 'المسطرة',
      setSquare: 'الكوس',
      protractor: 'المنقلة',
      compass: 'البركار',
      pencil: 'قلم الرصاص',
      eraser: 'الممحاة',
      mark: 'التشفير',
    },
    toolDescriptions: {
      ruler: 'اسحب المسطرة أو أدرها للقياس وتسطير المستقيمات',
      setSquare: 'لرسم الزوايا القائمة والتعامد والتوازي بدقة',
      protractor: 'لقياس ورسم الزوايا بالدرجات (0° إلى 180°)',
      compass: 'حدد فتحة البركار بالسنتيمتر وارسم الأقواس والدوائر',
      pencil: 'انقر واسحب على الورقة أو بمحاذاة حافة المسطرة للرسم',
      eraser: 'انقر على أي خط أو قوس أو رمز رسمته لمحوه',
      mark: 'انقر على الورقة لوضع رموز التعامد والتقايس وأسماء النقاط',
    },
    marks: {
      'right-angle': 'زاوية قائمة',
      'equal-1': 'تقايس ( / )',
      'equal-2': 'تقايس ( // )',
      'angle-arc': 'قوس زاوية',
      'point-label': 'تسمية نقطة',
    },
    controls: {
      showToolOnDesk: 'إظهار على الطاولة',
      hideToolFromDesk: 'إرجاع للعلبة',
      positionX: 'أفقي (X)',
      positionY: 'عمودي (Y)',
      angleDeg: 'الدوران',
      radiusCm: 'فتحة البركار',
      lengthCm: 'الطول',
      flipSetSquare: 'قلب الكوس',
      drawAlongRuler: 'رسم قطعة بمحاذاة المسطرة',
      drawAlongSquareBase: 'تسطير قاعدة الكوس',
      drawAlongSquareLeg: 'تسطير ضلع الكوس القائم',
      putAllAway: 'إبعاد الأدوات',
      drawFullCircle: 'رسم دائرة كاملة',
      sweepArc90: 'رسم قوس بناء (90°)',
      sweepArc60: 'رسم قوس بناء (60°)',
      plantNeedleToggle: 'تثبيت إبرة البركار',
      lineStyleSolid: 'خطّ نهائي واضح',
      lineStyleConstruction: 'خطّ بناء منقّط',
      magneticSnap: 'المغناطيس الذكي',
      smartLoupe: 'العدسة المكبرة',
      undo: 'تراجع',
      redo: 'إعادة',
      clearSheet: 'مسح الورقة',
      resetLesson: 'إعادة التمرين',
      showDemo: 'أرني كيف نبنيها',
      stopDemo: 'إيقاف العرض',
      verifyWork: 'تحقّق من إنشائي',
      nextStep: 'الخطوة التالية',
      prevStep: 'السابقة',
      certificateBtn: 'شهادة مهندس المستقبل',
      collapsePanel: 'طيّ اللوحة',
      expandPanel: 'إظهار اللوحة',
      pupilNamePlaceholder: 'اكتب اسمك هنا...',
      targetAngleDeg: 'الزاوية المطلوبة',
      markAngleRay: 'تحديد ورسم ضلع الزاوية',
      exportSheetPng: 'حفظ الورقة (PNG)',
      shortcutsHint: 'Ctrl+Z تراجع · Shift قفل الزاوية/البركار · L العدسة',
    },
    mentor: {
      name: 'المعلّم مجدي',
      title: 'مرشدك في مختبر الهندسة',
      welcomeGuided: 'أهلاً بك يا بطل! اختر درساً أو اضغط "أرني كيف نبنيها" لنبدأ معاً.',
      welcomeChallenge: 'وقت التحدّي! أنشئ الشكل بدقة ثم اضغط "تحقّق من إنشائي".',
      welcomeSandbox: 'المختبر الحر مفتوح! التقط أدواتك من العلبة وأبدع في الرسم الهندسي.',
      demoRunning: 'شاهد جيداً كيف تتحرك الأدوات وتترك أقواس البناء المنقطة...',
      demoFinished: 'أحسنت المشاهدة! الآن حان دورك لتطبيق البناء بنفسك.',
      snapLocked: 'جذب مغناطيسي دقيق!',
    },
    certificate: {
      heading: 'شهادة مهندس المستقبل الصغير',
      subheading: 'مختبر الهندسة التفاعلي — السنة السادسة أساسي',
      awardedTo: 'تُمنح بكل فخر إلى التلميذ(ة) النجيب(ة):',
      bodyText: 'تقديراً لإتقانه(ا) استعمال المسطرة والكوس والبركار والمنقلة وبناء الأشكال الهندسية بدقة مع التشفير الرسمي.',
      completedCount: 'الدروس المنجزة',
      starsEarned: 'النجوم المكتسبة',
      signedBy: 'الأستاذ مجدي',
      teacherRole: 'مُعدّ ومُشرف مختبر الهندسة',
      dateLabel: 'التاريخ',
      downloadPng: 'تحميل الشهادة (صورة)',
      printBtn: 'طباعة الشهادة',
      closeBtn: 'إغلاق',
      lockedNotice: 'أكمل تحدياً واحداً على الأقل لفتح الختم الذهبي، أو اكتب اسمك للمعاينة!',
      defaultPupil: 'بطل الهندسة الصغير',
    },
    status: {
      stars: 'نجوم',
      completed: 'منجز',
      stepOf: 'الخطوة',
      cmUnit: 'سم',
      degUnit: '°',
      snapPoint: 'نقطة',
      snapMidpoint: 'منتصف',
      snapIntersection: 'تقاطع',
      snapRulerEdge: 'حافة الأداة',
      snapGrid: 'الشبكة',
    },
  },
  fr: {
    brandTitle: 'Labo Géométrie · Prof. Majdi',
    brandSubtitle: '6ème Année Primaire',
    leftDeckTitle: 'Leçons et Défis',
    rightDeckTitle: 'Trousse de Géométrie',
    modes: {
      guided: 'Cours guidé',
      challenge: 'Défis',
      sandbox: 'Atelier libre',
    },
    sections: {
      modes: 'Mode de travail',
      curriculum: 'Programme 6ème année',
      sheetType: 'Type de feuille',
      cameraView: 'Angle de vue',
      toolKit: 'Mes instruments',
      toolAdjustments: 'Réglage de l’outil',
      examMarks: 'Codage géométrique',
      precisionAids: 'Aides de précision',
    },
    sheetTypes: {
      plain: 'Feuille blanche',
      millimeter: 'Papier millimétré',
      dots: 'Grille à points',
    },
    cameraPresets: {
      classroom3d: 'Vue inclinée 3D',
      top2d: 'Vue de dessus 2D',
      zoomPaper: 'Zoom feuille',
    },
    tools: {
      ruler: 'Règle',
      setSquare: 'Équerre',
      protractor: 'Rapporteur',
      compass: 'Compas',
      pencil: 'Crayon',
      eraser: 'Gomme',
      mark: 'Codage',
    },
    toolDescriptions: {
      ruler: 'Déplace et pivote la règle pour mesurer et tracer des segments',
      setSquare: 'Pour tracer des angles droits, perpendiculaires et parallèles',
      protractor: 'Mesure et trace les angles en degrés (0° à 180°)',
      compass: 'Règle l’ouverture en cm puis trace des arcs ou un cercle',
      pencil: 'Clique-glisse sur la feuille ou le long de la règle pour tracer',
      eraser: 'Clique sur un trait, arc ou symbole pour l’effacer',
      mark: 'Clique sur la feuille pour apposer angle droit, égalités et lettres',
    },
    marks: {
      'right-angle': 'Angle droit',
      'equal-1': 'Égalité ( / )',
      'equal-2': 'Égalité ( // )',
      'angle-arc': 'Arc d’angle',
      'point-label': 'Nom du point',
    },
    controls: {
      showToolOnDesk: 'Poser sur la table',
      hideToolFromDesk: 'Ranger',
      positionX: 'Position X',
      positionY: 'Position Y',
      angleDeg: 'Rotation',
      radiusCm: 'Ouverture (R)',
      lengthCm: 'Longueur',
      flipSetSquare: 'Retourner l’équerre',
      drawAlongRuler: 'Tracer le long de la règle',
      drawAlongSquareBase: 'Tracer la base',
      drawAlongSquareLeg: 'Tracer le côté droit',
      putAllAway: 'Tout ranger',
      drawFullCircle: 'Tracer un cercle entier',
      sweepArc90: 'Tracer un arc (90°)',
      sweepArc60: 'Tracer un arc (60°)',
      plantNeedleToggle: 'Piquer la pointe',
      lineStyleSolid: 'Trait plein final',
      lineStyleConstruction: 'Trait de construction',
      magneticSnap: 'Aimant intelligent',
      smartLoupe: 'Loupe de précision',
      undo: 'Annuler',
      redo: 'Rétablir',
      clearSheet: 'Effacer tout',
      resetLesson: 'Réinitialiser',
      showDemo: 'Montre-moi comment faire',
      stopDemo: 'Arrêter la démo',
      verifyWork: 'Vérifier ma figure',
      nextStep: 'Étape suivante',
      prevStep: 'Précédente',
      certificateBtn: 'Certificat Petit Ingénieur',
      collapsePanel: 'Réduire',
      expandPanel: 'Ouvrir',
      pupilNamePlaceholder: 'Ton prénom ici...',
      targetAngleDeg: 'Angle cible',
      markAngleRay: 'Tracer le côté de l’angle',
      exportSheetPng: 'Exporter (PNG)',
      shortcutsHint: 'Ctrl+Z Annuler · Shift Verrou · L Loupe',
    },
    mentor: {
      name: 'Maître Majdi',
      title: 'Ton guide de géométrie',
      welcomeGuided: 'Bienvenue ! Choisis une leçon ou clique sur "Montre-moi comment faire".',
      welcomeChallenge: 'À toi de jouer ! Construis la figure avec précision puis vérifie.',
      welcomeSandbox: 'Atelier libre ! Sors tes instruments et dessine librement.',
      demoRunning: 'Observe bien comment les instruments glissent et laissent les arcs...',
      demoFinished: 'Bravo pour ton attention ! À ton tour de réaliser la construction.',
      snapLocked: 'Aimantation précise !',
    },
    certificate: {
      heading: 'Certificat du Petit Ingénieur',
      subheading: 'Laboratoire de Géométrie 3D — 6ème Année Primaire',
      awardedTo: 'Décerné avec fierté à l’élève :',
      bodyText: 'Pour sa maîtrise de la règle, de l’équerre, du compas et du rapporteur dans les constructions géométriques avec codage officiel.',
      completedCount: 'Défis réussis',
      starsEarned: 'Étoiles obtenues',
      signedBy: 'Prof. Majdi',
      teacherRole: 'Fondateur du Labo Géométrie',
      dateLabel: 'Date',
      downloadPng: 'Télécharger (PNG)',
      printBtn: 'Imprimer',
      closeBtn: 'Fermer',
      lockedNotice: 'Réussis au moins un défi pour débloquer le sceau doré !',
      defaultPupil: 'Jeune Géomètre',
    },
    status: {
      stars: 'étoiles',
      completed: 'Validé',
      stepOf: 'Étape',
      cmUnit: 'cm',
      degUnit: '°',
      snapPoint: 'Point',
      snapMidpoint: 'Milieu',
      snapIntersection: 'Intersection',
      snapRulerEdge: 'Bord outil',
      snapGrid: 'Grille',
    },
  },
  en: {
    brandTitle: 'Geometry Lab · Prof. Majdi',
    brandSubtitle: 'Grade 6 Primary',
    leftDeckTitle: 'Lessons & Challenges',
    rightDeckTitle: 'Geometry Tool Kit',
    modes: {
      guided: 'Guided Lesson',
      challenge: 'Challenges',
      sandbox: 'Free Sandbox',
    },
    sections: {
      modes: 'Workspace Mode',
      curriculum: 'Grade 6 Curriculum',
      sheetType: 'Paper Style',
      cameraView: 'Camera Angle',
      toolKit: 'My Instruments',
      toolAdjustments: 'Active Tool Controls',
      examMarks: 'Exam Coding Marks',
      precisionAids: 'Precision Aids',
    },
    sheetTypes: {
      plain: 'Plain White',
      millimeter: 'Millimeter Grid',
      dots: 'Dot Grid',
    },
    cameraPresets: {
      classroom3d: '3D Angled View',
      top2d: '2D Top-Down',
      zoomPaper: 'Paper Zoom',
    },
    tools: {
      ruler: 'Ruler',
      setSquare: 'Set Square',
      protractor: 'Protractor',
      compass: 'Compass',
      pencil: 'Pencil',
      eraser: 'Eraser',
      mark: 'Exam Marks',
    },
    toolDescriptions: {
      ruler: 'Drag and rotate the ruler to measure and draw straight lines',
      setSquare: 'Construct right angles, perpendiculars, and parallels',
      protractor: 'Measure and mark angles in degrees (0° to 180°)',
      compass: 'Set radius in cm and sweep dotted arcs or full circles',
      pencil: 'Click and drag on paper or along a straightedge to draw',
      eraser: 'Click any user line, arc, or coding mark to remove it',
      mark: 'Click on paper to stamp right-angle squares, ticks, and labels',
    },
    marks: {
      'right-angle': 'Right Angle',
      'equal-1': 'Tick ( / )',
      'equal-2': 'Tick ( // )',
      'angle-arc': 'Angle Arc',
      'point-label': 'Point Label',
    },
    controls: {
      showToolOnDesk: 'Place on Desk',
      hideToolFromDesk: 'Put Away',
      positionX: 'Pos X',
      positionY: 'Pos Y',
      angleDeg: 'Rotation',
      radiusCm: 'Radius (R)',
      lengthCm: 'Length',
      flipSetSquare: 'Flip Set Square',
      drawAlongRuler: 'Draw Along Ruler Edge',
      drawAlongSquareBase: 'Draw Base Leg',
      drawAlongSquareLeg: 'Draw Perpendicular Leg',
      putAllAway: 'Put All Away',
      drawFullCircle: 'Draw Full Circle',
      sweepArc90: 'Sweep Arc (90°)',
      sweepArc60: 'Sweep Arc (60°)',
      plantNeedleToggle: 'Plant Needle',
      lineStyleSolid: 'Solid Final Line',
      lineStyleConstruction: 'Dotted Construction',
      magneticSnap: 'Magnetic Snap',
      smartLoupe: 'Smart Loupe',
      undo: 'Undo',
      redo: 'Redo',
      clearSheet: 'Clear Paper',
      resetLesson: 'Reset Task',
      showDemo: 'Show Me How',
      stopDemo: 'Stop Demo',
      verifyWork: 'Check My Work',
      nextStep: 'Next Step',
      prevStep: 'Back',
      certificateBtn: 'Future Engineer Certificate',
      collapsePanel: 'Collapse',
      expandPanel: 'Expand',
      pupilNamePlaceholder: 'Enter your name...',
      targetAngleDeg: 'Target Angle',
      markAngleRay: 'Mark & Draw Angle Ray',
      exportSheetPng: 'Export PNG',
      shortcutsHint: 'Ctrl+Z Undo · Shift Angle/Arc Lock · L Loupe',
    },
    mentor: {
      name: 'Teacher Majdi',
      title: 'Your Geometry Mentor',
      welcomeGuided: 'Welcome! Pick a lesson or press "Show Me How" to watch step-by-step.',
      welcomeChallenge: 'Challenge time! Build the figure accurately, then check your work.',
      welcomeSandbox: 'Free Sandbox is open! Pick any instrument and explore geometry.',
      demoRunning: 'Watch closely as the tools glide and leave dotted construction arcs...',
      demoFinished: 'Great watching! Now try constructing it on the paper yourself.',
      snapLocked: 'Magnetic snap locked!',
    },
    certificate: {
      heading: 'Junior Future Engineer Certificate',
      subheading: 'Interactive 3D Geometry Lab — Grade 6 Primary',
      awardedTo: 'Proudly awarded to:',
      bodyText: 'In recognition of mastering ruler, set square, compass, and protractor constructions with official geometric coding.',
      completedCount: 'Challenges Passed',
      starsEarned: 'Stars Earned',
      signedBy: 'Prof. Majdi',
      teacherRole: 'Geometry Lab Creator & Mentor',
      dateLabel: 'Date',
      downloadPng: 'Download PNG',
      printBtn: 'Print Certificate',
      closeBtn: 'Close',
      lockedNotice: 'Complete at least one challenge to unlock the gold seal!',
      defaultPupil: 'Young Geometer',
    },
    status: {
      stars: 'stars',
      completed: 'Passed',
      stepOf: 'Step',
      cmUnit: 'cm',
      degUnit: '°',
      snapPoint: 'Vertex',
      snapMidpoint: 'Midpoint',
      snapIntersection: 'Intersection',
      snapRulerEdge: 'Tool Edge',
      snapGrid: 'Grid',
    },
  },
};

export function pickText(text: LocalizedText, lang: Language): string {
  return text[lang] || text.ar;
}
