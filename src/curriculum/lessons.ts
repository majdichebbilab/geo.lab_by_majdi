import {
  angleBetweenLinesDeg,
  dist2D,
  pointToInfiniteLineDist,
  userArcs,
  userLines,
} from '../geometry/mathKernel';
import { CurriculumLesson, SheetState } from '../types/geometry';

export const GRADE6_LESSONS: CurriculumLesson[] = [
  {
    id: 'perpendicular',
    order: 1,
    badgeCode: '⊥',
    title: {
      ar: 'المستقيمان المتعامدان',
      fr: 'Droites perpendiculaires',
      en: 'Perpendicular Lines',
    },
    subtitle: {
      ar: 'رسم مستقيم عمودي على (D) ويمرّ من النقطة A بالبركار والمسطرة',
      fr: 'Tracer (D’) ⊥ (D) passant par A au compas et à la règle',
      en: 'Draw (D’) ⊥ (D) through point A using Compass & Ruler',
    },
    initialSheet: {
      points: [
        { id: 'pt-a', x: 1.5, y: 4.5, label: 'A', locked: true, role: 'given' },
      ],
      lines: [
        {
          id: 'line-d',
          x1: -9,
          y1: -1.5,
          x2: 9,
          y2: -1.5,
          kind: 'line',
          style: 'solid',
          color: '#1e293b',
          locked: true,
          label: '(D)',
        },
      ],
      arcs: [],
      marks: [],
    },
    initialPoses: {
      compass: { cx: 1.5, cy: 4.5, radiusCm: 6.5, armAngleDeg: -126, sweepStartDeg: -126, sweeping: false, needlePlanted: true },
      ruler: { x: 1.5, y: -6.5, angleDeg: 90, lengthCm: 14 },
      setSquare: { x: -4.5, y: -1.5, angleDeg: 0, flipped: false, legCm: 9 },
      visibleTools: { ruler: false, setSquare: false, protractor: false, compass: true },
    },
    steps: [
      {
        id: 'perp-1',
        recommendedTool: 'compass',
        instruction: {
          ar: 'اغرس إبرة البركار في النقطة A وافتحه فتحة أكبر من البعد إلى (D) (مثلاً 6.5 سم) ثم ارسم قوساً يقطع (D) في نقطتين P و Q.',
          fr: 'Pique le compas en A (R = 6,5 cm) et trace un arc qui coupe (D) en deux points P et Q.',
          en: 'Plant Compass at A (R = 6.5 cm) and sweep an arc cutting line (D) at P and Q.',
        },
        hint: {
          ar: 'المركز A (1.5, 4.5) ونصف القطر 6.5 سم يقطع (D) في (-1, -1.5) و (4, -1.5).',
          fr: 'Centre A (1,5 ; 4,5), R = 6,5 cm coupe (D) en (-1 ; -1,5) et (4 ; -1,5).',
          en: 'Center A (1.5, 4.5), R = 6.5 cm cuts (D) at (-1, -1.5) and (4, -1.5).',
        },
      },
      {
        id: 'perp-2',
        recommendedTool: 'compass',
        instruction: {
          ar: 'بنفس الفتحة من نقطتي التقاطع P و Q (أو بفتحة 4.5 سم أكبر من نصف PQ)، ارسم قوسين متقاطعين أسفل (D) في النقطة K.',
          fr: 'Depuis P puis Q avec le même écartement (ex. 4,5 cm > PQ/2), trace deux arcs qui se croisent en K.',
          en: 'From P and Q using the same opening (e.g. 4.5 cm > PQ/2), sweep two intersecting arcs at K below (D).',
        },
        hint: {
          ar: 'ثبّت البركار في P (-1, -1.5) ثم في Q (4, -1.5) بنفس الفتحة 4.5 سم.',
          fr: 'Pique en P (-1 ; -1,5) puis en Q (4 ; -1,5) avec R = 4,5 cm.',
          en: 'Plant at P (-1, -1.5) then Q (4, -1.5) keeping R = 4.5 cm.',
        },
      },
      {
        id: 'perp-3',
        recommendedTool: 'pencil',
        instruction: {
          ar: 'صل النقطة A بتقاطع القوسين K بالمسطرة، ثم أضف رمز الزاوية القائمة للتشفير الرسمي.',
          fr: 'Relie A au point K à la règle puis ajoute le symbole de l’angle droit.',
          en: 'Connect A to intersection K with the Ruler, then stamp the right-angle mark.',
        },
        hint: {
          ar: 'المستقيم المارّ من A و K عمودي على (D). لا تنسَ أداة التشفير عند (1.5, -1.5).',
          fr: 'La droite (AK) est perpendiculaire à (D). Code l’angle droit en (1,5 ; -1,5).',
          en: 'Line (AK) is perpendicular to (D). Stamp the right-angle mark at (1.5, -1.5).',
        },
      },
    ],
    demoSteps: [
      {
        durationSec: 1.4,
        tool: 'compass',
        speech: {
          ar: '1) نغرس البركار في النقطة A ونفتحه 6.5 سم (أكبر من البعد إلى المستقيم) ليقطع (D) في نقطتين P و Q.',
          fr: '1) On pique en A (R = 6,5 cm) pour couper la droite (D) en deux points P et Q.',
          en: '1) Plant at A (R = 6.5 cm > distance to line) and cut (D) in two points P and Q.',
        },
        fromPose: { compass: { cx: 1.5, cy: 4.5, radiusCm: 6.5, armAngleDeg: -126, sweepStartDeg: -126, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: 1.5, cy: 4.5, radiusCm: 6.5, armAngleDeg: -54, sweepStartDeg: -126, sweeping: true, needlePlanted: true } },
        drawArc: { cx: 1.5, cy: 4.5, radiusCm: 6.5, startDeg: -126, endDeg: -54, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 0.65,
        tool: 'mark',
        speech: {
          ar: 'نحدّد نقطتي التقاطع P و Q على المستقيم (D).',
          fr: 'On repère les intersections P et Q sur (D).',
          en: 'Mark intersections P and Q on (D).',
        },
        addPoint: { x: -1.0, y: -1.5, label: 'P', role: 'user' },
      },
      {
        durationSec: 0.65,
        tool: 'mark',
        speech: {
          ar: 'النقطة الثانية Q على المستقيم (D) تبعد عن A بنفس المسافة 6.5 سم.',
          fr: 'Et le second point Q sur (D), à égale distance de A.',
          en: 'And second intersection Q on (D), equidistant from A.',
        },
        addPoint: { x: 4.0, y: -1.5, label: 'Q', role: 'user' },
      },
      {
        durationSec: 1.0,
        tool: 'compass',
        isTransit: true,
        speech: {
          ar: '2) نرفع البركار ونضبطه على 4.5 سم (أكبر من نصف [PQ]) ثم نغرس الإبرة في P.',
          fr: '2) On règle l’ouverture à 4,5 cm (> PQ/2) et on pique en P.',
          en: '2) Lift Compass, adjust radius to 4.5 cm (> PQ/2), and plant at P.',
        },
        fromPose: { compass: { cx: 1.5, cy: 4.5, radiusCm: 6.5, armAngleDeg: -54, sweepStartDeg: -54, sweeping: false, needlePlanted: false } },
        toPose: { compass: { cx: -1.0, cy: -1.5, radiusCm: 4.5, armAngleDeg: -78, sweepStartDeg: -78, sweeping: false, needlePlanted: true } },
      },
      {
        durationSec: 1.15,
        tool: 'compass',
        speech: {
          ar: 'نرسم قوساً أسفل المستقيم (D) من النقطة P.',
          fr: 'On trace un arc sous la droite (D) depuis P.',
          en: 'Sweep an arc below line (D) from P.',
        },
        fromPose: { compass: { cx: -1.0, cy: -1.5, radiusCm: 4.5, armAngleDeg: -78, sweepStartDeg: -78, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: -1.0, cy: -1.5, radiusCm: 4.5, armAngleDeg: -34, sweepStartDeg: -78, sweeping: true, needlePlanted: true } },
        drawArc: { cx: -1.0, cy: -1.5, radiusCm: 4.5, startDeg: -78, endDeg: -34, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 1.0,
        tool: 'compass',
        isTransit: true,
        speech: {
          ar: '3) بنفس الفتحة تماماً (4.5 سم)، نرفع البركار وننقله إلى النقطة Q.',
          fr: '3) En gardant exactement 4,5 cm, on déplace la pointe en Q.',
          en: '3) Keeping exact 4.5 cm radius, lift and move the needle to Q.',
        },
        fromPose: { compass: { cx: -1.0, cy: -1.5, radiusCm: 4.5, armAngleDeg: -34, sweepStartDeg: -34, sweeping: false, needlePlanted: false } },
        toPose: { compass: { cx: 4.0, cy: -1.5, radiusCm: 4.5, armAngleDeg: -146, sweepStartDeg: -146, sweeping: false, needlePlanted: true } },
      },
      {
        durationSec: 1.15,
        tool: 'compass',
        speech: {
          ar: 'نرسم القوس الثاني ليقطع القوس الأول أسفل (D) في النقطة K.',
          fr: 'On trace le second arc pour couper le premier en K.',
          en: 'Sweep the second arc intersecting the first below (D) at K.',
        },
        fromPose: { compass: { cx: 4.0, cy: -1.5, radiusCm: 4.5, armAngleDeg: -146, sweepStartDeg: -146, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: 4.0, cy: -1.5, radiusCm: 4.5, armAngleDeg: -102, sweepStartDeg: -146, sweeping: true, needlePlanted: true } },
        drawArc: { cx: 4.0, cy: -1.5, radiusCm: 4.5, startDeg: -146, endDeg: -102, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 0.7,
        tool: 'mark',
        speech: {
          ar: 'تحدّدت نقطة التناظر K! المستقيم (AK) عمودي تماماً على (D).',
          fr: 'Voici le point symétrique K ! La droite (AK) est perpendiculaire à (D).',
          en: 'Intersection K is located — line (AK) is perpendicular to (D)!',
        },
        addPoint: { x: 1.5, y: -5.242, label: 'K', role: 'user' },
      },
      {
        durationSec: 0.9,
        tool: 'ruler',
        isTransit: true,
        speech: {
          ar: '4) نحاذي المسطرة بدقة بين النقطة A والنقطة K.',
          fr: '4) On aligne la règle avec précision sur les points A et K.',
          en: '4) Align the Ruler cleanly through points A and K.',
        },
        fromPose: { ruler: { x: -2.5, y: -6.5, angleDeg: 75, lengthCm: 14 } },
        toPose: { ruler: { x: 1.5, y: -6.5, angleDeg: 90, lengthCm: 14 } },
      },
      {
        durationSec: 1.4,
        tool: 'pencil',
        speech: {
          ar: 'نمرّر القلم بمحاذاة المسطرة لنرسم المستقيم العمودي (D’) المارّ من A و K.',
          fr: 'On trace à la règle la perpendiculaire (D’) passant par A et K.',
          en: 'Trace along the Ruler through A and K to draw perpendicular (D’).',
        },
        drawLine: {
          x1: 1.5,
          y1: 7.4,
          x2: 1.5,
          y2: -7.4,
          kind: 'line',
          style: 'solid',
          color: '#0f172a',
          label: "(D')",
        },
      },
      {
        durationSec: 0.9,
        tool: 'mark',
        speech: {
          ar: '5) أخيراً نضع رمز الزاوية القائمة للتشفير الرسمي عند نقطة التقاطع!',
          fr: '5) Enfin, on ajoute le codage de l’angle droit à l’intersection !',
          en: '5) Finally, stamp the official right-angle mark at the intersection!',
        },
        addMark: {
          type: 'right-angle',
          x: 1.5,
          y: -1.5,
          angleDeg: 0,
          color: '#dc2626',
        },
      },
    ],
    verify: (sheet: SheetState) => {
      const drawn = userLines(sheet);
      const base = sheet.lines[0];
      const perpLine = drawn.find(
        (l) =>
          Math.abs(angleBetweenLinesDeg(l, base) - 90) <= 3.5 &&
          pointToInfiniteLineDist(1.5, 4.5, l.x1, l.y1, l.x2, l.y2) <= 0.45 &&
          dist2D(l.x1, l.y1, l.x2, l.y2) >= 4.0,
      );
      const hasRightMark = sheet.marks.some(
        (m) => m.type === 'right-angle' && dist2D(m.x, m.y, 1.5, -1.5) <= 0.9,
      );

      const checks = [
        {
          label: {
            ar: 'زاوية قائمة 90° مع المستقيم (D)',
            fr: 'Angle de 90° avec (D)',
            en: '90° angle with line (D)',
          },
          ok: Boolean(perpLine),
        },
        {
          label: {
            ar: 'يمر المستقيم بالنقطة A',
            fr: 'Passe par le point A',
            en: 'Passes through point A',
          },
          ok: Boolean(perpLine),
        },
        {
          label: {
            ar: 'رمز التشفير (زاوية قائمة)',
            fr: 'Codage angle droit présent',
            en: 'Right-angle coding mark placed',
          },
          ok: hasRightMark,
        },
      ];
      const okCount = checks.filter((c) => c.ok).length;
      const passed = Boolean(perpLine && hasRightMark);
      return {
        passed,
        stars: passed ? 3 : perpLine ? 2 : 0,
        checks,
        feedback: passed
          ? {
              ar: 'ممتاز يا مهندس! أنشأت مستقيماً عمودياً دقيقاً مع التشفير الرسمي.',
              fr: 'Bravo ! Ta droite perpendiculaire et son codage sont parfaits.',
              en: 'Excellent! Your perpendicular line and right-angle mark are spot on.',
            }
          : perpLine
          ? {
              ar: 'المستقيم صحيح! أضف فقط رمز الزاوية القائمة عند التقاطع لتكتمل العلامة.',
              fr: 'La droite est bonne ! Ajoute le codage d’angle droit à l’intersection.',
              en: 'Great line! Just add the right-angle coding mark at the intersection.',
            }
          : {
              ar: 'حاول محاذاة الكوس مع المستقيم (D) بحيث يمرّ المستقيم الجديد من النقطة A.',
              fr: 'Aligne bien l’équerre sur (D) pour passer exactement par le point A.',
              en: 'Align the Set Square on (D) so the drawn line passes through A.',
            },
      };
    },
  },
  {
    id: 'parallel',
    order: 2,
    badgeCode: '//',
    title: {
      ar: 'المستقيمان المتوازيان',
      fr: 'Droites parallèles',
      en: 'Parallel Lines',
    },
    subtitle: {
      ar: 'بناء مستقيم موازٍ لـ (D) يمرّ من M بالبركار والمسطرة (طريقة المعيّن)',
      fr: 'Tracer (D’) // (D) par M au compas et à la règle (méthode du losange)',
      en: 'Construct (D’) // (D) through M using Compass & Ruler (Rhombus method)',
    },
    initialSheet: {
      points: [
        { id: 'pt-m', x: 0, y: 3.5, label: 'M', locked: true, role: 'given' },
      ],
      lines: [
        {
          id: 'line-d-par',
          x1: -9,
          y1: -2,
          x2: 9,
          y2: -2,
          kind: 'line',
          style: 'solid',
          color: '#1e293b',
          locked: true,
          label: '(D)',
        },
      ],
      arcs: [],
      marks: [],
    },
    initialPoses: {
      compass: { cx: -3.464, cy: -2, radiusCm: 6.5, armAngleDeg: 57.8, sweepStartDeg: 57.8, sweeping: false, needlePlanted: true },
      ruler: { x: -7.5, y: 3.5, angleDeg: 0, lengthCm: 16 },
      setSquare: { x: -5.5, y: -2, angleDeg: 0, flipped: false, legCm: 9 },
      visibleTools: { ruler: false, setSquare: false, protractor: false, compass: true },
    },
    steps: [
      {
        id: 'par-1',
        recommendedTool: 'compass',
        instruction: {
          ar: 'اختر نقطة A على المستقيم (D)، واغرس فيها إبرة البركار وافتحه بقدر المسافة AM (6.5 سم)، ثم ارسم قوساً يمرّ من M ويقطع (D) في B.',
          fr: 'Choisis un point A sur (D), pique en A avec rayon AM (6,5 cm) et trace un arc passant par M qui coupe (D) en B.',
          en: 'Pick point A on (D), plant at A with radius AM (6.5 cm), and sweep an arc from M down to cut (D) at B.',
        },
        hint: {
          ar: 'A (-3.46, -2)، نصف القطر R = 6.5 سم يمرّ من M (0, 3.5) ويقطع (D) في B (3.04, -2).',
          fr: 'Centre A (-3,46 ; -2), R = 6,5 cm passe par M et coupe (D) en B (3,04 ; -2).',
          en: 'Center A (-3.46, -2), R = 6.5 cm passes through M and cuts (D) at B (3.04, -2).',
        },
      },
      {
        id: 'par-2',
        recommendedTool: 'compass',
        instruction: {
          ar: 'بنفس الفتحة (6.5 سم)، ارسم قوساً من B في الأعلى، ثم قوساً من M يقطعه في النقطة N لإتمام المعيّن ABNM.',
          fr: 'En gardant 6,5 cm, trace un arc depuis B puis depuis M pour obtenir le 4e sommet N du losange.',
          en: 'Keeping R = 6.5 cm, sweep an arc from B then from M to intersect at N (forming rhombus ABNM).',
        },
        hint: {
          ar: 'حافظ على نفس فتحة البركار 6.5 سم في B (3.04, -2) وفي M (0, 3.5).',
          fr: 'Garde exactement R = 6,5 cm en B puis en M.',
          en: 'Keep exact R = 6.5 cm at B then at M.',
        },
      },
      {
        id: 'par-3',
        recommendedTool: 'pencil',
        instruction: {
          ar: 'صل النقطتين M و N بالمسطرة لتحصل على المستقيم (D’) الموازي تماماً لـ (D).',
          fr: 'Relie M et N à la règle pour tracer la droite (D’) parallèle à (D).',
          en: 'Connect M and N with the Ruler to draw line (D’) strictly parallel to (D).',
        },
        hint: {
          ar: 'المستقيم المارّ من M (0, 3.5) و N (6.5, 3.5) يوازي (D).',
          fr: 'La droite (MN) passant par (0 ; 3,5) et (6,5 ; 3,5) est parallèle à (D).',
          en: 'Line (MN) through (0, 3.5) and (6.5, 3.5) is parallel to (D).',
        },
      },
    ],
    demoSteps: [
      {
        durationSec: 0.7,
        tool: 'mark',
        speech: {
          ar: '1) نعيّن نقطة A على المستقيم (D) للبدء ببناء المعيّن.',
          fr: '1) On place un point A sur la droite (D) pour construire le losange.',
          en: '1) Mark a reference point A on line (D) to build our rhombus.',
        },
        addPoint: { x: -3.464, y: -2, label: 'A', role: 'user' },
      },
      {
        durationSec: 0.9,
        tool: 'compass',
        isTransit: true,
        speech: {
          ar: '2) نغرس إبرة البركار في A ونفتح القلم ليصل مباشرة إلى النقطة M (المسافة AM = 6.5 سم).',
          fr: '2) On pique en A et on ouvre le compas exactement jusqu’au point M (AM = 6,5 cm).',
          en: '2) Plant the needle at A and open the Compass directly onto point M (AM = 6.5 cm).',
        },
        fromPose: { compass: { cx: -3.464, cy: -2, radiusCm: 3.2, armAngleDeg: 25, sweepStartDeg: 25, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: -3.464, cy: -2, radiusCm: 6.5, armAngleDeg: 66, sweepStartDeg: 66, sweeping: false, needlePlanted: true } },
      },
      {
        durationSec: 1.35,
        tool: 'compass',
        speech: {
          ar: 'نرسم قوساً يمرّ من M وينزل ليقطع المستقيم (D) في النقطة B (إذن AB = AM).',
          fr: 'On trace un arc passant par M qui coupe (D) en B (ainsi AB = AM).',
          en: 'Sweep an arc passing through M down to cut line (D) at B (so AB = AM).',
        },
        fromPose: { compass: { cx: -3.464, cy: -2, radiusCm: 6.5, armAngleDeg: 66, sweepStartDeg: 66, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: -3.464, cy: -2, radiusCm: 6.5, armAngleDeg: -10, sweepStartDeg: 66, sweeping: true, needlePlanted: true } },
        drawArc: { cx: -3.464, cy: -2, radiusCm: 6.5, startDeg: 66, endDeg: -10, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 0.65,
        tool: 'mark',
        speech: {
          ar: 'نحدّد نقطة التقاطع B على المستقيم (D).',
          fr: 'On nomme B le point d’intersection sur (D).',
          en: 'Label intersection B on (D).',
        },
        addPoint: { x: 3.036, y: -2, label: 'B', role: 'user' },
      },
      {
        durationSec: 0.9,
        tool: 'compass',
        isTransit: true,
        speech: {
          ar: '3) نحافظ على نفس الفتحة (6.5 سم) وننقل إبرة البركار إلى النقطة B.',
          fr: '3) En gardant exactement la même ouverture (6,5 cm), on pique en B.',
          en: '3) Keeping the exact same 6.5 cm opening, lift and plant the needle at B.',
        },
        fromPose: { compass: { cx: -3.464, cy: -2, radiusCm: 6.5, armAngleDeg: -10, sweepStartDeg: -10, sweeping: false, needlePlanted: false } },
        toPose: { compass: { cx: 3.036, cy: -2, radiusCm: 6.5, armAngleDeg: 36, sweepStartDeg: 36, sweeping: false, needlePlanted: true } },
      },
      {
        durationSec: 1.1,
        tool: 'compass',
        speech: {
          ar: 'نرسم قوساً للأعلى جهة اليمين لتحديد موضع الرأس الرابع.',
          fr: 'On trace un arc vers le haut à droite.',
          en: 'Sweep an upward arc from B for the fourth rhombus vertex.',
        },
        fromPose: { compass: { cx: 3.036, cy: -2, radiusCm: 6.5, armAngleDeg: 36, sweepStartDeg: 36, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: 3.036, cy: -2, radiusCm: 6.5, armAngleDeg: 78, sweepStartDeg: 36, sweeping: true, needlePlanted: true } },
        drawArc: { cx: 3.036, cy: -2, radiusCm: 6.5, startDeg: 36, endDeg: 78, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 0.9,
        tool: 'compass',
        isTransit: true,
        speech: {
          ar: '4) بنفس الفتحة (6.5 سم)، نرفع البركار ونغرسه في النقطة M.',
          fr: '4) Toujours avec 6,5 cm, on place la pointe sèche en M.',
          en: '4) Still keeping 6.5 cm, lift and plant the needle at M.',
        },
        fromPose: { compass: { cx: 3.036, cy: -2, radiusCm: 6.5, armAngleDeg: 78, sweepStartDeg: 78, sweeping: false, needlePlanted: false } },
        toPose: { compass: { cx: 0, cy: 3.5, radiusCm: 6.5, armAngleDeg: -22, sweepStartDeg: -22, sweeping: false, needlePlanted: true } },
      },
      {
        durationSec: 1.1,
        tool: 'compass',
        speech: {
          ar: 'نقاطع القوس السابق لتحديد النقطة N بحيث يكتمل المعيّن ABNM!',
          fr: 'On coupe l’arc précédent en N pour former le losange ABNM !',
          en: 'Intersect the arc at N to complete rhombus ABNM!',
        },
        fromPose: { compass: { cx: 0, cy: 3.5, radiusCm: 6.5, armAngleDeg: -22, sweepStartDeg: -22, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: 0, cy: 3.5, radiusCm: 6.5, armAngleDeg: 22, sweepStartDeg: -22, sweeping: true, needlePlanted: true } },
        drawArc: { cx: 0, cy: 3.5, radiusCm: 6.5, startDeg: -22, endDeg: 22, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 0.65,
        tool: 'mark',
        speech: {
          ar: 'تحصّلنا على الرأس الرابع N للمعيّن ABNM!',
          fr: 'Le 4e sommet N du losange ABNM est trouvé !',
          en: 'Fourth rhombus vertex N located!',
        },
        addPoint: { x: 6.5, y: 3.5, label: 'N', role: 'user' },
      },
      {
        durationSec: 0.9,
        tool: 'ruler',
        isTransit: true,
        speech: {
          ar: '5) نحاذي المسطرة بدقة على النقطتين M و N.',
          fr: '5) On aligne la règle sur les points M et N.',
          en: '5) Align the Ruler cleanly along points M and N.',
        },
        fromPose: { ruler: { x: -7.5, y: 1.5, angleDeg: -8, lengthCm: 16 } },
        toPose: { ruler: { x: -7.5, y: 3.5, angleDeg: 0, lengthCm: 16 } },
      },
      {
        durationSec: 1.4,
        tool: 'pencil',
        speech: {
          ar: 'نمرّر القلم بمحاذاة المسطرة لنرسم المستقيم (D’) الموازي تماماً لـ (D)!',
          fr: 'On trace la droite (D’) passant par M et N : elle est parallèle à (D) !',
          en: 'Trace along the Ruler through M and N to draw (D’) strictly parallel to (D)!',
        },
        drawLine: {
          x1: -9.5,
          y1: 3.5,
          x2: 9.5,
          y2: 3.5,
          kind: 'line',
          style: 'solid',
          color: '#0f172a',
          label: "(D')",
        },
      },
    ],
    verify: (sheet: SheetState) => {
      const drawn = userLines(sheet);
      const base = sheet.lines[0];
      const parLine = drawn.find(
        (l) =>
          angleBetweenLinesDeg(l, base) <= 3.5 &&
          pointToInfiniteLineDist(0, 3.5, l.x1, l.y1, l.x2, l.y2) <= 0.45 &&
          dist2D(l.x1, l.y1, l.x2, l.y2) >= 4.0,
      );
      const checks = [
        {
          label: {
            ar: 'المستقيم الجديد يوازي (D)',
            fr: 'Droite parallèle à (D)',
            en: 'Line is parallel to (D)',
          },
          ok: Boolean(parLine),
        },
        {
          label: {
            ar: 'يمرّ المستقيم بالنقطة M',
            fr: 'Passe par le point M',
            en: 'Passes through point M',
          },
          ok: Boolean(parLine),
        },
      ];
      return {
        passed: Boolean(parLine),
        stars: parLine ? 3 : 0,
        checks,
        feedback: parLine
          ? {
              ar: 'رائع! المستقيمان متوازيان تماماً ويمرّ المستقيم الجديد بالنقطة M.',
              fr: 'Parfait ! Les deux droites sont bien parallèles.',
              en: 'Awesome! Your parallel line passes cleanly through M.',
            }
          : {
              ar: 'تأكّد من انزلاق الكوس أفقياً دون دوران حتى يمرّ المستقيم بالنقطة M.',
              fr: 'Assure-toi que la droite reste bien parallèle à (D) et passe par M.',
              en: 'Make sure your new line stays parallel to (D) and passes through M.',
            },
      };
    },
  },
  {
    id: 'mediatrice',
    order: 3,
    badgeCode: '⟘',
    title: {
      ar: 'الموسط العمودي لقطعة مستقيم',
      fr: 'Médiatrice d’un segment',
      en: 'Perpendicular Bisector',
    },
    subtitle: {
      ar: 'بناء الموسط العمودي للقطعة [AB] بالبركار والمسطرة',
      fr: 'Construire la médiatrice de [AB] au compas et à la règle',
      en: 'Construct the perpendicular bisector of [AB] with Compass & Ruler',
    },
    initialSheet: {
      points: [
        { id: 'pt-a3', x: -4, y: 0, label: 'A', locked: true, role: 'given' },
        { id: 'pt-b3', x: 4, y: 0, label: 'B', locked: true, role: 'given' },
      ],
      lines: [
        {
          id: 'seg-ab',
          x1: -4,
          y1: 0,
          x2: 4,
          y2: 0,
          kind: 'segment',
          style: 'solid',
          color: '#1e293b',
          locked: true,
        },
      ],
      arcs: [],
      marks: [],
    },
    initialPoses: {
      compass: { cx: -4, cy: 0, radiusCm: 5.5, armAngleDeg: 50, sweepStartDeg: 50, sweeping: false, needlePlanted: true },
      ruler: { x: 0, y: -6, angleDeg: 90, lengthCm: 14 },
      visibleTools: { ruler: false, setSquare: false, protractor: false, compass: true },
    },
    steps: [
      {
        id: 'med-1',
        recommendedTool: 'compass',
        instruction: {
          ar: 'افتح البركار فتحة أكبر من نصف طول [AB] (مثلاً 5.5 سم)، ضع الإبرة في A وارسم قوساً أعلى وأسفل.',
          fr: 'Ouvre le compas (R > AB/2, ex. 5,5 cm), pique en A et trace un arc.',
          en: 'Open Compass larger than half AB (e.g. 5.5 cm), plant at A and sweep an arc.',
        },
        hint: {
          ar: 'ثبّت البركار في A (-4, 0) بنصف قطر 5.5 سم وارسم قوساً.',
          fr: 'Centre en A (-4, 0), rayon 5,5 cm et trace l’arc.',
          en: 'Center at A (-4, 0), R = 5.5 cm, then sweep an arc.',
        },
      },
      {
        id: 'med-2',
        recommendedTool: 'compass',
        instruction: {
          ar: 'بنفس الفتحة، ضع الإبرة في B وارسم قوساً يقطع القوس الأول في نقطتين.',
          fr: 'Avec la même ouverture, pique en B et coupe le premier arc en deux points.',
          en: 'Keep the same radius, plant at B and sweep an arc intersecting the first.',
        },
        hint: {
          ar: 'انقل الإبرة إلى B (4, 0) بنفس الفتحة 5.5 سم.',
          fr: 'Déplace la pointe sèche en B (4, 0) sans changer le rayon.',
          en: 'Move needle to B (4, 0) keeping R = 5.5 cm.',
        },
      },
      {
        id: 'med-3',
        recommendedTool: 'pencil',
        instruction: {
          ar: 'صل بين نقطتي تقاطع الأقواس بالمسطرة ثم ضع رمز الزاوية القائمة والتقايس.',
          fr: 'Relie les deux intersections à la règle puis ajoute le codage officiel.',
          en: 'Connect the two arc intersections and stamp right-angle + equality ticks.',
        },
        hint: {
          ar: 'المستقيم المار بتقاطع الأقواس يمر بالمنتصف I (0, 0) عمودياً.',
          fr: 'La médiatrice relie les intersections et passe par le milieu (0, 0).',
          en: 'Connect the top and bottom arc intersections through midpoint (0, 0).',
        },
      },
    ],
    demoSteps: [
      {
        durationSec: 1.5,
        tool: 'compass',
        speech: {
          ar: 'نختار فتحة للبركار أكبر من نصف القطعة (5.5 سم) ونغرس الإبرة في النقطة A.',
          fr: 'On choisit une ouverture supérieure à la moitié de [AB] et on pique en A.',
          en: 'Open the Compass past half of AB (5.5 cm) and plant the needle at A.',
        },
        fromPose: { compass: { cx: -4, cy: 0, radiusCm: 5.5, armAngleDeg: -65, sweepStartDeg: -65, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: -4, cy: 0, radiusCm: 5.5, armAngleDeg: 65, sweepStartDeg: -65, sweeping: true, needlePlanted: true } },
        drawArc: { cx: -4, cy: 0, radiusCm: 5.5, startDeg: -65, endDeg: 65, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 1.0,
        tool: 'compass',
        isTransit: true,
        speech: {
          ar: 'نرفع البركار مع الحفاظ على نفس الفتحة (5.5 سم) وننقله إلى النقطة B.',
          fr: 'On déplace le compas en gardant la même ouverture (5,5 cm) vers le point B.',
          en: 'Lift the Compass keeping the exact same 5.5 cm radius and move to point B.',
        },
        fromPose: { compass: { cx: -4, cy: 0, radiusCm: 5.5, armAngleDeg: 65, sweepStartDeg: 65, sweeping: false, needlePlanted: false } },
        toPose: { compass: { cx: 4, cy: 0, radiusCm: 5.5, armAngleDeg: 115, sweepStartDeg: 115, sweeping: false, needlePlanted: true } },
      },
      {
        durationSec: 1.5,
        tool: 'compass',
        speech: {
          ar: 'نغرس الإبرة في B ونرسم قوساً يقطع القوس الأول في نقطتين.',
          fr: 'On pique en B et on coupe le premier arc en deux points.',
          en: 'Plant the needle at B and sweep an intersecting arc.',
        },
        fromPose: { compass: { cx: 4, cy: 0, radiusCm: 5.5, armAngleDeg: 115, sweepStartDeg: 115, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: 4, cy: 0, radiusCm: 5.5, armAngleDeg: 245, sweepStartDeg: 115, sweeping: true, needlePlanted: true } },
        drawArc: { cx: 4, cy: 0, radiusCm: 5.5, startDeg: 115, endDeg: 245, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 0.9,
        tool: 'ruler',
        isTransit: true,
        speech: {
          ar: 'نضع المسطرة بمحاذاة نقطتي تقاطع القوسين.',
          fr: 'On aligne la règle sur les deux intersections.',
          en: 'Align the Ruler with both arc intersections.',
        },
        fromPose: { ruler: { x: -3, y: -6, angleDeg: 90, lengthCm: 13 } },
        toPose: { ruler: { x: 0, y: -6, angleDeg: 90, lengthCm: 13 } },
      },
      {
        durationSec: 1.4,
        tool: 'pencil',
        speech: {
          ar: 'نمرّر القلم بمحاذاة المسطرة لنرسم الموسط العمودي للقطعة [AB].',
          fr: 'On trace à la règle la droite passant par les deux intersections.',
          en: 'Draw along the Ruler to form the perpendicular bisector of [AB].',
        },
        drawLine: { x1: 0, y1: -5.2, x2: 0, y2: 5.2, kind: 'line', style: 'solid', color: '#0f172a' },
      },
      {
        durationSec: 1.2,
        tool: 'mark',
        speech: {
          ar: 'نُشفر الشكل برمز الزاوية القائمة وعلامتي التقايس على نصفي القطعة!',
          fr: 'On ajoute l’angle droit et les marques d’égalité des deux moitiés !',
          en: 'Stamp the right-angle square and matching equality ticks on both halves!',
        },
        addMark: { type: 'right-angle', x: 0, y: 0, angleDeg: 0, color: '#dc2626' },
      },
      {
        durationSec: 0.7,
        tool: 'mark',
        speech: {
          ar: 'أقواس البناء المنقطة تبقى ظاهرة لإثبات طريقة عملنا!',
          fr: 'Les arcs de construction restent visibles pour prouver la méthode.',
          en: 'Construction arcs stay visible to show our exact geometric method.',
        },
        addMark: { type: 'equal-1', x: -2, y: 0, angleDeg: 0, color: '#059669' },
      },
      {
        durationSec: 0.7,
        tool: 'mark',
        speech: {
          ar: 'تساوى الطولان والأمر مكتمل!',
          fr: 'Et voici la seconde marque d’égalité !',
          en: 'Equal halves marked!',
        },
        addMark: { type: 'equal-1', x: 2, y: 0, angleDeg: 0, color: '#059669' },
      },
    ],
    verify: (sheet: SheetState) => {
      const drawn = userLines(sheet);
      const arcs = userArcs(sheet);
      const base = sheet.lines[0];
      const hasArcFromA = arcs.some((a) => dist2D(a.cx, a.cy, -4, 0) <= 0.45 && a.radiusCm > 4.1);
      const hasArcFromB = arcs.some((a) => dist2D(a.cx, a.cy, 4, 0) <= 0.45 && a.radiusCm > 4.1);
      const bisector = drawn.find(
        (l) =>
          Math.abs(angleBetweenLinesDeg(l, base) - 90) <= 3.5 &&
          pointToInfiniteLineDist(0, 0, l.x1, l.y1, l.x2, l.y2) <= 0.45 &&
          dist2D(l.x1, l.y1, l.x2, l.y2) >= 4.0,
      );
      const hasRight = sheet.marks.some((m) => m.type === 'right-angle' && dist2D(m.x, m.y, 0, 0) <= 0.9);
      const checks = [
        {
          label: { ar: 'أقواس بناء من A و B', fr: 'Arcs de construction en A et B', en: 'Compass arcs from A and B' },
          ok: hasArcFromA && hasArcFromB,
        },
        {
          label: { ar: 'يمرّ من المنتصف عمودياً', fr: 'Passe par le milieu à 90°', en: 'Perpendicular through midpoint' },
          ok: Boolean(bisector),
        },
        {
          label: { ar: 'التشفير (زاوية قائمة)', fr: 'Codage angle droit', en: 'Right-angle coding mark' },
          ok: hasRight,
        },
      ];
      const passed = Boolean(bisector && hasArcFromA && hasArcFromB);
      return {
        passed,
        stars: passed ? (hasRight ? 3 : 2) : 0,
        checks,
        feedback: passed
          ? {
              ar: 'عمل رائع! الموسط العمودي وأقواس البركار محفوظة بدقة.',
              fr: 'Bravo ! La médiatrice et ses arcs de compas sont exacts.',
              en: 'Well done! The perpendicular bisector and compass arcs are accurate.',
            }
          : {
              ar: 'تذكّر رسم قوسين متقاطعين من A و B بنفس الفتحة ثم الوصل بينهما.',
              fr: 'Trace les deux arcs depuis A et B avec le même rayon puis relie-les.',
              en: 'Sweep intersecting arcs from A and B with the same radius, then connect them.',
            },
      };
    },
  },
  {
    id: 'angle-bisector',
    order: 4,
    badgeCode: '∠/2',
    title: {
      ar: 'منصّف الزاوية',
      fr: 'Bissectrice d’un angle',
      en: 'Angle Bisector',
    },
    subtitle: {
      ar: 'قسمة الزاوية [xOy] إلى زاويتين متقايستين بالبركار',
      fr: 'Partager l’angle [xOy] en deux angles égaux au compas',
      en: 'Divide angle [xOy] into two equal angles using the Compass',
    },
    initialSheet: {
      points: [{ id: 'pt-o4', x: -5, y: -3, label: 'O', locked: true, role: 'given' }],
      lines: [
        { id: 'ray-ox', x1: -5, y1: -3, x2: 7, y2: -3, kind: 'segment', style: 'solid', color: '#1e293b', locked: true },
        { id: 'ray-oy', x1: -5, y1: -3, x2: 1, y2: 7.39, kind: 'segment', style: 'solid', color: '#1e293b', locked: true },
      ],
      arcs: [],
      marks: [],
    },
    initialPoses: {
      compass: { cx: -5, cy: -3, radiusCm: 4.5, armAngleDeg: 0, sweepStartDeg: 0, sweeping: false, needlePlanted: true },
      visibleTools: { ruler: false, setSquare: false, protractor: false, compass: true },
    },
    steps: [
      {
        id: 'ang-1',
        recommendedTool: 'compass',
        instruction: {
          ar: 'ضع إبرة البركار في رأس الزاوية O وارسم قوساً يقطع ضلعي الزاوية.',
          fr: 'Pique le compas sur le sommet O et coupe les deux côtés de l’angle.',
          en: 'Plant Compass at vertex O and sweep an arc crossing both rays.',
        },
        hint: {
          ar: 'المركز O (-5, -3)، نصف القطر 4.5 سم، من 0° إلى 60°.',
          fr: 'Centre en O (-5, -3), R = 4,5 cm, de 0° à 60°.',
          en: 'Center at O (-5, -3), R = 4.5 cm, sweep across both rays.',
        },
      },
      {
        id: 'ang-2',
        recommendedTool: 'compass',
        instruction: {
          ar: 'من نقطتي التقاطع على الضلعين، ارسم قوسين متقاطعين داخل الزاوية.',
          fr: 'Depuis les deux points sur les côtés, trace deux arcs qui se croisent.',
          en: 'From each ray intersection, sweep two intersecting arcs inside the angle.',
        },
        hint: {
          ar: 'استعمل فتحة 4 سم من كل من نقطتي التقاطع.',
          fr: 'Garde R = 4 cm depuis les deux points d’intersection.',
          en: 'Use R = 4 cm from both intersection points.',
        },
      },
      {
        id: 'ang-3',
        recommendedTool: 'pencil',
        instruction: {
          ar: 'صل الرأس O بنقطة تقاطع القوسين لتحصل على المنصّف (زاوية 30°).',
          fr: 'Relie le sommet O à l’intersection des arcs pour tracer la bissectrice.',
          en: 'Draw the ray from O through the arc intersection (30° bisector).',
        },
        hint: {
          ar: 'اسحب القلم من O (-5, -3) مروراً بتقاطع القوسين.',
          fr: 'Trace un segment de O (-5, -3) à travers l’intersection.',
          en: 'Draw from O (-5, -3) through the arc intersection.',
        },
      },
    ],
    demoSteps: [
      {
        durationSec: 1.4,
        tool: 'compass',
        speech: {
          ar: 'نغرس البركار في الرأس O ونرسم قوساً يقطع ضلعي الزاوية في نقطتين متساوتي البعد.',
          fr: 'On pique en O et on trace un arc coupant les deux côtés.',
          en: 'Plant the Compass at O and mark equal distances on both rays.',
        },
        fromPose: { compass: { cx: -5, cy: -3, radiusCm: 4.5, armAngleDeg: -8, sweepStartDeg: -8, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: -5, cy: -3, radiusCm: 4.5, armAngleDeg: 68, sweepStartDeg: -8, sweeping: true, needlePlanted: true } },
        drawArc: { cx: -5, cy: -3, radiusCm: 4.5, startDeg: -8, endDeg: 68, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 0.9,
        tool: 'compass',
        isTransit: true,
        speech: {
          ar: 'ننقل إبرة البركار إلى نقطة التقاطع الأولى على الضلع السفلي.',
          fr: 'On déplace la pointe vers la première intersection sur le côté inférieur.',
          en: 'Lift and move the needle to the first intersection on the lower ray.',
        },
        fromPose: { compass: { cx: -5, cy: -3, radiusCm: 4.5, armAngleDeg: 68, sweepStartDeg: 68, sweeping: false, needlePlanted: false } },
        toPose: { compass: { cx: -0.5, cy: -3, radiusCm: 4.5, armAngleDeg: 25, sweepStartDeg: 25, sweeping: false, needlePlanted: true } },
      },
      {
        durationSec: 1.2,
        tool: 'compass',
        speech: {
          ar: 'نرسم قوساً داخل الزاوية انطلاقاً من الضلع السفلي.',
          fr: 'On trace un arc à l’intérieur de l’angle.',
          en: 'Sweep an arc inside the angle from the lower ray intersection.',
        },
        fromPose: { compass: { cx: -0.5, cy: -3, radiusCm: 4.5, armAngleDeg: 25, sweepStartDeg: 25, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: -0.5, cy: -3, radiusCm: 4.5, armAngleDeg: 85, sweepStartDeg: 25, sweeping: true, needlePlanted: true } },
        drawArc: { cx: -0.5, cy: -3, radiusCm: 4.5, startDeg: 25, endDeg: 85, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 0.9,
        tool: 'compass',
        isTransit: true,
        speech: {
          ar: 'بنفس الفتحة، ننتقل إلى نقطة التقاطع الثانية على الضلع العلوي.',
          fr: 'Avec le même rayon, on pique sur la seconde intersection.',
          en: 'Keeping the same radius, move the needle to the upper ray intersection.',
        },
        fromPose: { compass: { cx: -0.5, cy: -3, radiusCm: 4.5, armAngleDeg: 85, sweepStartDeg: 85, sweeping: false, needlePlanted: false } },
        toPose: { compass: { cx: -2.75, cy: 0.897, radiusCm: 4.5, armAngleDeg: -20, sweepStartDeg: -20, sweeping: false, needlePlanted: true } },
      },
      {
        durationSec: 1.2,
        tool: 'compass',
        speech: {
          ar: 'نرسم القوس الثاني لنقاطع القوس الأول ونحدّد نقطة التناظر.',
          fr: 'On trace le second arc pour croiser le premier.',
          en: 'Sweep the second arc to intersect the first inside the angle.',
        },
        fromPose: { compass: { cx: -2.75, cy: 0.897, radiusCm: 4.5, armAngleDeg: -20, sweepStartDeg: -20, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: -2.75, cy: 0.897, radiusCm: 4.5, armAngleDeg: 40, sweepStartDeg: -20, sweeping: true, needlePlanted: true } },
        drawArc: { cx: -2.75, cy: 0.897, radiusCm: 4.5, startDeg: -20, endDeg: 40, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 0.9,
        tool: 'ruler',
        isTransit: true,
        speech: {
          ar: 'نضع المسطرة بين الرأس O ونقطة تقاطع القوسين.',
          fr: 'On place la règle entre le sommet O et l’intersection des arcs.',
          en: 'Align the Ruler from vertex O through the arc intersection.',
        },
        fromPose: { ruler: { x: -6.5, y: -5, angleDeg: 10, lengthCm: 13 } },
        toPose: { ruler: { x: -5, y: -3, angleDeg: 30, lengthCm: 13 } },
      },
      {
        durationSec: 1.4,
        tool: 'pencil',
        speech: {
          ar: 'أخيراً نمرّر القلم بمحاذاة المسطرة فنقسم الزاوية 60° إلى زاويتين متقايستين (30° لكل منهما).',
          fr: 'On trace le long de la règle : l’angle de 60° est coupé en deux angles de 30° !',
          en: 'Trace along the Ruler to bisect 60° into two equal 30° angles.',
        },
        drawLine: { x1: -5, y1: -3, x2: 3.66, y2: 2, kind: 'segment', style: 'solid', color: '#0f172a' },
      },
    ],
    verify: (sheet: SheetState) => {
      const drawn = userLines(sheet);
      const arcs = userArcs(sheet);
      const ox = sheet.lines[0];
      const hasVertexArc = arcs.some((a) => dist2D(a.cx, a.cy, -5, -3) <= 0.45);
      const bisector = drawn.find((l) => {
        const nearO = dist2D(l.x1, l.y1, -5, -3) <= 0.45 || dist2D(l.x2, l.y2, -5, -3) <= 0.45;
        const ang = angleBetweenLinesDeg(l, ox);
        return nearO && Math.abs(ang - 30) <= 4.0 && dist2D(l.x1, l.y1, l.x2, l.y2) >= 3.0;
      });
      const checks = [
        {
          label: { ar: 'قوس البناء من الرأس O', fr: 'Arc depuis le sommet O', en: 'Construction arc from O' },
          ok: hasVertexArc,
        },
        {
          label: { ar: 'أقواس التقاطع داخل الزاوية', fr: 'Arcs sécants intérieurs', en: 'Inner intersecting arcs' },
          ok: arcs.length >= 2,
        },
        {
          label: { ar: 'نصف المستقيم المنصّف (30°)', fr: 'Demi-droite bissectrice (30°)', en: 'Bisector ray at 30°' },
          ok: Boolean(bisector),
        },
      ];
      const passed = Boolean(bisector && arcs.length >= 2);
      return {
        passed,
        stars: passed ? 3 : bisector ? 2 : 0,
        checks,
        feedback: passed
          ? {
              ar: 'أحسنت! منصّف الزاوية يقسم الزاوية تماماً إلى نصفين متساويين.',
              fr: 'Bravo ! La bissectrice partage parfaitement l’angle en deux.',
              en: 'Great work! Your angle bisector splits the angle accurately in half.',
            }
          : {
              ar: 'ارسم قوساً من O ثم قوسين متقاطعين من الضلعين، وصل O بالتقاطع.',
              fr: 'Trace d’abord l’arc en O puis deux arcs sécants avant de relier.',
              en: 'Draw the arc at O, two intersecting arcs from the sides, then connect from O.',
            },
      };
    },
  },
  {
    id: 'triangle',
    order: 5,
    badgeCode: '△',
    title: {
      ar: 'بناء مثلث بأطوال معلومة',
      fr: 'Construction d’un triangle',
      en: 'Triangle Construction',
    },
    subtitle: {
      ar: 'بناء المثلث ABC حيث AB = 6 سم، AC = 5 سم، BC = 4 سم بالبركار',
      fr: 'Construire ABC avec AB = 6 cm, AC = 5 cm, BC = 4 cm',
      en: 'Construct △ABC with AB = 6 cm, AC = 5 cm, BC = 4 cm',
    },
    initialSheet: {
      points: [
        { id: 'pt-a5', x: -3, y: -2.5, label: 'A', locked: true, role: 'given' },
        { id: 'pt-b5', x: 3, y: -2.5, label: 'B', locked: true, role: 'given' },
      ],
      lines: [
        {
          id: 'seg-ab5',
          x1: -3,
          y1: -2.5,
          x2: 3,
          y2: -2.5,
          kind: 'segment',
          style: 'solid',
          color: '#1e293b',
          locked: true,
        },
      ],
      arcs: [],
      marks: [],
    },
    initialPoses: {
      compass: { cx: -3, cy: -2.5, radiusCm: 5.0, armAngleDeg: 55, sweepStartDeg: 55, sweeping: false, needlePlanted: true },
      visibleTools: { ruler: false, setSquare: false, protractor: false, compass: true },
    },
    steps: [
      {
        id: 'tri-1',
        recommendedTool: 'compass',
        instruction: {
          ar: 'افتح البركار على 5 سم، ضع الإبرة في A وارسم قوساً للأعلى.',
          fr: 'Ouvre le compas à 5 cm, pique en A et trace un arc vers le haut.',
          en: 'Set Compass radius to 5.0 cm, plant at A and sweep an upward arc.',
        },
        hint: {
          ar: 'نصف القطر R = 5.0 سم والمركز A (-3, -2.5).',
          fr: 'R = 5,0 cm avec centre en A (-3, -2,5).',
          en: 'Radius R = 5.0 cm centered at A (-3, -2.5).',
        },
      },
      {
        id: 'tri-2',
        recommendedTool: 'compass',
        instruction: {
          ar: 'اضبط البركار على 4 سم، ضع الإبرة في B واقطع القوس الأول لتحديد الرأس C.',
          fr: 'Règle le compas à 4 cm, pique en B et coupe l’arc pour trouver C.',
          en: 'Set Compass radius to 4.0 cm, plant at B and intersect the first arc to locate C.',
        },
        hint: {
          ar: 'نصف القطر R = 4.0 سم والمركز B (3, -2.5).',
          fr: 'R = 4,0 cm avec centre en B (3, -2,5).',
          en: 'Radius R = 4.0 cm centered at B (3, -2.5).',
        },
      },
      {
        id: 'tri-3',
        recommendedTool: 'pencil',
        instruction: {
          ar: 'صل A بـ C و B بـ C لتحصل على المثلث ABC!',
          fr: 'Relie A à C et B à C pour former le triangle ABC !',
          en: 'Connect A to C and B to C to complete triangle ABC!',
        },
        hint: {
          ar: 'المغناطيس الذكي سيجذب قلمك مباشرة إلى تقاطع القوسين.',
          fr: 'L’aimant attire le crayon directement sur le sommet C.',
          en: 'Magnetic snap locks straight onto the arc intersection C.',
        },
      },
    ],
    demoSteps: [
      {
        durationSec: 1.4,
        tool: 'compass',
        speech: {
          ar: 'الضلع AC طوله 5 سم، لذلك نفتح البركار 5 سم ونرسم قوساً من A.',
          fr: 'AC mesure 5 cm : on ouvre le compas à 5 cm et on trace depuis A.',
          en: 'Side AC is 5 cm, so set Compass to 5.0 cm and sweep from A.',
        },
        fromPose: { compass: { cx: -3, cy: -2.5, radiusCm: 5.0, armAngleDeg: 15, sweepStartDeg: 15, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: -3, cy: -2.5, radiusCm: 5.0, armAngleDeg: 75, sweepStartDeg: 15, sweeping: true, needlePlanted: true } },
        drawArc: { cx: -3, cy: -2.5, radiusCm: 5.0, startDeg: 15, endDeg: 75, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 1.0,
        tool: 'compass',
        isTransit: true,
        speech: {
          ar: 'نرفع البركار إلى النقطة B ونُغيّر فتحته تدريجياً إلى 4 سم (طول الضلع BC).',
          fr: 'On déplace le compas en B tout en ajustant l’ouverture à 4 cm.',
          en: 'Lift the Compass to B while smoothly adjusting its radius from 5.0 cm to 4.0 cm.',
        },
        fromPose: { compass: { cx: -3, cy: -2.5, radiusCm: 5.0, armAngleDeg: 75, sweepStartDeg: 75, sweeping: false, needlePlanted: false } },
        toPose: { compass: { cx: 3, cy: -2.5, radiusCm: 4.0, armAngleDeg: 100, sweepStartDeg: 100, sweeping: false, needlePlanted: true } },
      },
      {
        durationSec: 1.4,
        tool: 'compass',
        speech: {
          ar: 'نغرس الإبرة في B ونرسم قوساً يقطع القوس الأول في الرأس C.',
          fr: 'On pique en B et on coupe le premier arc pour obtenir le sommet C.',
          en: 'Plant at B and sweep a 4.0 cm arc to intersect at vertex C.',
        },
        fromPose: { compass: { cx: 3, cy: -2.5, radiusCm: 4.0, armAngleDeg: 100, sweepStartDeg: 100, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: 3, cy: -2.5, radiusCm: 4.0, armAngleDeg: 165, sweepStartDeg: 100, sweeping: true, needlePlanted: true } },
        drawArc: { cx: 3, cy: -2.5, radiusCm: 4.0, startDeg: 100, endDeg: 165, style: 'construction', color: '#2563eb' },
      },
      {
        durationSec: 1.0,
        tool: 'mark',
        speech: {
          ar: 'نُسمّي نقطة التقاطع C.',
          fr: 'On nomme l’intersection C.',
          en: 'Label the vertex C.',
        },
        addPoint: { x: 0.75, y: 0.807, label: 'C', role: 'user' },
      },
      {
        durationSec: 0.9,
        tool: 'ruler',
        isTransit: true,
        speech: {
          ar: 'نحاذي المسطرة بين النقطة A والرأس C.',
          fr: 'On aligne la règle entre A et le sommet C.',
          en: 'Align the Ruler between A and vertex C.',
        },
        fromPose: { ruler: { x: -5, y: -4.5, angleDeg: 15, lengthCm: 13 } },
        toPose: { ruler: { x: -3, y: -2.5, angleDeg: 41.41, lengthCm: 13 } },
      },
      {
        durationSec: 1.2,
        tool: 'pencil',
        speech: {
          ar: 'نرسم الضلع [AC] بطول 5 سم بمحاذاة المسطرة!',
          fr: 'On trace le côté [AC] de 5 cm le long de la règle !',
          en: 'Draw side [AC] = 5 cm cleanly along the Ruler!',
        },
        drawLine: { x1: -3, y1: -2.5, x2: 0.75, y2: 0.807, kind: 'segment', style: 'solid', color: '#0f172a' },
      },
      {
        durationSec: 0.9,
        tool: 'ruler',
        isTransit: true,
        speech: {
          ar: 'ندير المسطرة لمحاذاة النقطتين C و B.',
          fr: 'On oriente la règle entre C et B.',
          en: 'Rotate and align the Ruler along C and B.',
        },
        fromPose: { ruler: { x: -3, y: -2.5, angleDeg: 41.41, lengthCm: 13 } },
        toPose: { ruler: { x: 0.75, y: 0.807, angleDeg: -55.77, lengthCm: 13 } },
      },
      {
        durationSec: 1.1,
        tool: 'pencil',
        speech: {
          ar: 'وها هو الضلع الأخير [BC] بطول 4 سم يكتمل به المثلث!',
          fr: 'Et voici le côté [BC] de 4 cm qui achève le triangle !',
          en: 'And side [BC] = 4 cm completes triangle ABC!',
        },
        drawLine: { x1: 0.75, y1: 0.807, x2: 3, y2: -2.5, kind: 'segment', style: 'solid', color: '#0f172a' },
      },
    ],
    verify: (sheet: SheetState) => {
      const arcs = userArcs(sheet);
      const lines = userLines(sheet);
      // C for A(-3,-2.5) R=5 and B(3,-2.5) R=4 -> x = 0.75, y = -2.5 + 3.307 = 0.807 (or -5.807)
      const cx = 0.75;
      const cyTop = 0.807;
      const cyBot = -5.807;

      const hasArc5 = arcs.some((a) => dist2D(a.cx, a.cy, -3, -2.5) <= 0.4 && Math.abs(a.radiusCm - 5) <= 0.35);
      const hasArc4 = arcs.some((a) => dist2D(a.cx, a.cy, 3, -2.5) <= 0.4 && Math.abs(a.radiusCm - 4) <= 0.35);

      const connectsToC = (cy: number) => {
        const hasAC = lines.some(
          (l) =>
            (dist2D(l.x1, l.y1, -3, -2.5) <= 0.45 && dist2D(l.x2, l.y2, cx, cy) <= 0.5) ||
            (dist2D(l.x2, l.y2, -3, -2.5) <= 0.45 && dist2D(l.x1, l.y1, cx, cy) <= 0.5),
        );
        const hasBC = lines.some(
          (l) =>
            (dist2D(l.x1, l.y1, 3, -2.5) <= 0.45 && dist2D(l.x2, l.y2, cx, cy) <= 0.5) ||
            (dist2D(l.x2, l.y2, 3, -2.5) <= 0.45 && dist2D(l.x1, l.y1, cx, cy) <= 0.5),
        );
        return hasAC && hasBC;
      };

      const triDone = connectsToC(cyTop) || connectsToC(cyBot);
      const checks = [
        {
          label: { ar: 'قوس من A بنصف قطر 5 سم', fr: 'Arc depuis A (R = 5 cm)', en: 'Arc from A (R = 5 cm)' },
          ok: hasArc5,
        },
        {
          label: { ar: 'قوس من B بنصف قطر 4 سم', fr: 'Arc depuis B (R = 4 cm)', en: 'Arc from B (R = 4 cm)' },
          ok: hasArc4,
        },
        {
          label: { ar: 'الضلعان [AC] و [BC]', fr: 'Côtés [AC] et [BC] tracés', en: 'Sides AC and BC connected' },
          ok: triDone,
        },
      ];
      const passed = triDone && hasArc5 && hasArc4;
      return {
        passed,
        stars: passed ? 3 : triDone ? 2 : 0,
        checks,
        feedback: passed
          ? {
              ar: 'أبدعت! مثلث ABC بأطواله الدقيقة 6 و 5 و 4 سم!',
              fr: 'Bravo ! Le triangle ABC (6, 5, 4 cm) est construit avec rigueur !',
              en: 'Brilliant! Triangle ABC (6, 5, 4 cm) is constructed accurately!',
            }
          : {
              ar: 'استخدم البركار بفتحة 5 سم من A و 4 سم من B ثم صل نقطة التقاطع بـ A و B.',
              fr: 'Trace les deux arcs (5 cm en A, 4 cm en B) puis relie les sommets.',
              en: 'Draw 5 cm arc from A and 4 cm arc from B, then connect both to the intersection.',
            },
      };
    },
  },
  {
    id: 'circle-square',
    order: 6,
    badgeCode: '◯□',
    title: {
      ar: 'الدائرة والمربع',
      fr: 'Cercle et Carré',
      en: 'Circle & Square',
    },
    subtitle: {
      ar: 'رسم دائرة مركزها O وشعاعها 4 سم وبناء مربع محاط بها',
      fr: 'Tracer un cercle de centre O (R = 4 cm) et un carré inscrit',
      en: 'Draw circle center O (R = 4 cm) and an inscribed square',
    },
    initialSheet: {
      points: [{ id: 'pt-o6', x: 0, y: 0, label: 'O', locked: true, role: 'given' }],
      lines: [
        {
          id: 'diam-ac',
          x1: -4,
          y1: 0,
          x2: 4,
          y2: 0,
          kind: 'segment',
          style: 'construction',
          color: '#64748b',
          locked: true,
        },
      ],
      arcs: [],
      marks: [],
    },
    initialPoses: {
      compass: { cx: 0, cy: 0, radiusCm: 4.0, armAngleDeg: 0, sweepStartDeg: 0, sweeping: false, needlePlanted: true },
      setSquare: { x: 0, y: 0, angleDeg: 0, flipped: false, legCm: 9 },
      visibleTools: { ruler: false, setSquare: false, protractor: false, compass: true },
    },
    steps: [
      {
        id: 'cs-1',
        recommendedTool: 'compass',
        instruction: {
          ar: 'اضبط البركار على شعاع 4 سم من المركز O وارسم الدائرة الكاملة.',
          fr: 'Règle le compas à 4 cm sur O et trace le cercle complet.',
          en: 'Set Compass radius to 4.0 cm at O and draw the full circle.',
        },
        hint: {
          ar: 'اضغط "رسم دائرة كاملة" بعد ضبط الفتحة على 4.0 سم في O.',
          fr: 'Clique sur "Tracer un cercle entier" avec R = 4,0 cm en O.',
          en: 'Use "Draw Full Circle" centered at O with R = 4.0 cm.',
        },
      },
      {
        id: 'cs-2',
        recommendedTool: 'setSquare',
        instruction: {
          ar: 'ارسم القطر العمودي من (0, -4) إلى (0, 4) بالكوس ليتعامد مع القطر الأفقي.',
          fr: 'Trace le diamètre vertical perpendiculaire passant par O.',
          en: 'Draw the perpendicular vertical diameter through O from (0,-4) to (0,4).',
        },
        hint: {
          ar: 'ضع الكوس في O (0, 0) وسطّر القطر العمودي داخل الدائرة.',
          fr: 'Pose l’équerre en O (0, 0) et trace le diamètre vertical.',
          en: 'Align Set Square at O (0, 0) and trace the vertical diameter.',
        },
      },
      {
        id: 'cs-3',
        recommendedTool: 'pencil',
        instruction: {
          ar: 'صل الرؤوس الأربعة على محيط الدائرة لتحصل على المربع مع رمز الزاوية القائمة في O.',
          fr: 'Relie les 4 sommets sur le cercle pour former le carré inscrit.',
          en: 'Connect the 4 points around the circle to form the inscribed square.',
        },
        hint: {
          ar: 'صل (-4,0) بـ (0,4)، و(0,4) بـ (4,0)، و(4,0) بـ (0,-4)، و(0,-4) بـ (-4,0).',
          fr: 'Relie les 4 extrémités des deux diamètres.',
          en: 'Join the 4 diameter endpoints on the circle.',
        },
      },
    ],
    demoSteps: [
      {
        durationSec: 1.7,
        tool: 'compass',
        speech: {
          ar: 'نضبط البركار على 4 سم في المركز O ونرسم الدائرة كاملة.',
          fr: 'On règle le compas à 4 cm en O et on trace le cercle complet.',
          en: 'Set Compass to 4.0 cm at O and draw the full circle.',
        },
        fromPose: { compass: { cx: 0, cy: 0, radiusCm: 4.0, armAngleDeg: 0, sweepStartDeg: 0, sweeping: false, needlePlanted: true } },
        toPose: { compass: { cx: 0, cy: 0, radiusCm: 4.0, armAngleDeg: 360, sweepStartDeg: 0, sweeping: true, needlePlanted: true } },
        drawArc: { cx: 0, cy: 0, radiusCm: 4.0, startDeg: 0, endDeg: 360, style: 'solid', color: '#0f172a' },
      },
      {
        durationSec: 1.0,
        tool: 'setSquare',
        isTransit: true,
        speech: {
          ar: 'نضع الضلع القائم للكوس عند المركز O (-4.5 أسفل) ليمتد على طول القطر العمودي.',
          fr: 'On place le côté droit de l’équerre aligné avec le centre O.',
          en: 'Align the Set Square vertical leg along center O to span the vertical diameter.',
        },
        fromPose: { setSquare: { x: -4.5, y: -4.5, angleDeg: 0, flipped: false, legCm: 9 } },
        toPose: { setSquare: { x: 0, y: -4.5, angleDeg: 0, flipped: false, legCm: 9 } },
      },
      {
        durationSec: 1.2,
        tool: 'pencil',
        speech: {
          ar: 'نرسم القطر الثاني عمودياً بمحاذاة ضلع الكوس لأن قطري المربع متعامدان ومتقايسان!',
          fr: 'On trace le second diamètre perpendiculaire le long de l’équerre.',
          en: 'Draw the perpendicular diameter along the Set Square because a square’s diagonals are equal and perpendicular.',
        },
        drawLine: { x1: 0, y1: -4, x2: 0, y2: 4, kind: 'segment', style: 'construction', color: '#64748b' },
      },
      {
        durationSec: 0.7,
        tool: 'mark',
        speech: {
          ar: 'نضع رمز التعامد عند تقاطع القطرين في المركز O.',
          fr: 'On marque l’angle droit au centre O.',
          en: 'Mark the right angle at center O.',
        },
        addMark: { type: 'right-angle', x: 0, y: 0, angleDeg: 0, color: '#dc2626' },
      },
      {
        durationSec: 2.2,
        tool: 'pencil',
        speech: {
          ar: 'الآن نصل أطراف القطرين الأربعة لنحصل على مربع كامل داخل الدائرة!',
          fr: 'On relie les quatre points sur le cercle pour former le carré !',
          en: 'Connect the four endpoints on the circle to complete the square!',
        },
        drawLine: { x1: -4, y1: 0, x2: 0, y2: 4, kind: 'segment', style: 'solid', color: '#0f172a' },
      },
      {
        durationSec: 0.7,
        tool: 'pencil',
        speech: { ar: 'الضلع الثاني...', fr: 'Deuxième côté...', en: 'Second side...' },
        drawLine: { x1: 0, y1: 4, x2: 4, y2: 0, kind: 'segment', style: 'solid', color: '#0f172a' },
      },
      {
        durationSec: 0.7,
        tool: 'pencil',
        speech: { ar: 'الضلع الثالث...', fr: 'Troisième côté...', en: 'Third side...' },
        drawLine: { x1: 4, y1: 0, x2: 0, y2: -4, kind: 'segment', style: 'solid', color: '#0f172a' },
      },
      {
        durationSec: 0.7,
        tool: 'pencil',
        speech: { ar: 'والضلع الرابع! مربع متكامل داخل الدائرة.', fr: 'Et le quatrième côté !', en: 'And the fourth side!' },
        drawLine: { x1: 0, y1: -4, x2: -4, y2: 0, kind: 'segment', style: 'solid', color: '#0f172a' },
      },
    ],
    verify: (sheet: SheetState) => {
      const arcs = userArcs(sheet);
      const lines = userLines(sheet);
      const hasCircle = arcs.some(
        (a) => dist2D(a.cx, a.cy, 0, 0) <= 0.4 && Math.abs(a.radiusCm - 4) <= 0.35 && Math.abs(a.endDeg - a.startDeg) >= 340,
      );
      const hasDiagV = lines.some(
        (l) => pointToInfiniteLineDist(0, 0, l.x1, l.y1, l.x2, l.y2) <= 0.4 && Math.abs(l.x2 - l.x1) <= 0.45 && dist2D(l.x1, l.y1, l.x2, l.y2) >= 6.5,
      );
      const corners: [number, number][] = [
        [-4, 0],
        [0, 4],
        [4, 0],
        [0, -4],
      ];
      const hasSide = (p1: [number, number], p2: [number, number]) =>
        lines.some(
          (l) =>
            (dist2D(l.x1, l.y1, p1[0], p1[1]) <= 0.5 && dist2D(l.x2, l.y2, p2[0], p2[1]) <= 0.5) ||
            (dist2D(l.x2, l.y2, p1[0], p1[1]) <= 0.5 && dist2D(l.x1, l.y1, p2[0], p2[1]) <= 0.5),
        );
      const sidesOk =
        hasSide(corners[0], corners[1]) &&
        hasSide(corners[1], corners[2]) &&
        hasSide(corners[2], corners[3]) &&
        hasSide(corners[3], corners[0]);

      const checks = [
        { label: { ar: 'دائرة مركزها O وشعاعها 4 سم', fr: 'Cercle centre O (R = 4 cm)', en: 'Circle center O (R = 4 cm)' }, ok: hasCircle },
        { label: { ar: 'القطر العمودي', fr: 'Diamètre perpendiculaire', en: 'Perpendicular diameter' }, ok: hasDiagV },
        { label: { ar: 'أضلاع المربع الأربعة', fr: 'Les 4 côtés du carré', en: 'All 4 square sides' }, ok: sidesOk },
      ];
      const passed = hasCircle && hasDiagV && sidesOk;
      return {
        passed,
        stars: passed ? 3 : hasCircle && sidesOk ? 2 : 0,
        checks,
        feedback: passed
          ? {
              ar: 'عمل هندسي بديع! الدائرة والمربع المتعامد القطرين متقنان.',
              fr: 'Magnifique ! Le cercle et son carré inscrit sont parfaits.',
              en: 'Splendid! Your circle and inscribed square are spot on.',
            }
          : {
              ar: 'ارسم الدائرة (شعاع 4 سم)، ثم القطر العمودي، ثم صل الرؤوس الأربعة على الدائرة.',
              fr: 'Trace le cercle (4 cm), le diamètre vertical, puis relie les 4 sommets.',
              en: 'Draw the 4 cm circle, vertical diameter, and connect the 4 circle points.',
            },
      };
    },
  },
];
