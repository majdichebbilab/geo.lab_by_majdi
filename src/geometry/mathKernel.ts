import {
  GeoArc,
  GeoLine,
  SheetState,
  SheetType,
  SnapResult,
  ToolPoses,
} from '../types/geometry';

export const PAPER_HALF_W = 14; // cm (-14..14 => 28cm)
export const PAPER_HALF_H = 10; // cm (-10..10 => 20cm)
export const CM_TO_WORLD = 0.1;

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

export function dist2D(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function clampToPaper(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(-PAPER_HALF_W + 0.3, Math.min(PAPER_HALF_W - 0.3, x)),
    y: Math.max(-PAPER_HALF_H + 0.3, Math.min(PAPER_HALF_H - 0.3, y)),
  };
}

export function pointToSegmentDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { dist: number; projX: number; projY: number; t: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-8) {
    return { dist: dist2D(px, py, x1, y1), projX: x1, projY: y1, t: 0 };
  }
  const tRaw = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  const t = Math.max(0, Math.min(1, tRaw));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return { dist: dist2D(px, py, projX, projY), projX, projY, t };
}

export function pointToInfiniteLineDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1e-8) return dist2D(px, py, x1, y1);
  return Math.abs((px - x1) * dy - (py - y1) * dx) / len;
}

export function lineLineIntersection(
  l1: GeoLine,
  l2: GeoLine,
): { x: number; y: number } | null {
  const x1 = l1.x1;
  const y1 = l1.y1;
  const x2 = l1.x2;
  const y2 = l1.y2;
  const x3 = l2.x1;
  const y3 = l2.y1;
  const x4 = l2.x2;
  const y4 = l2.y2;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-5) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (l1.kind === 'segment' && (t < -0.02 || t > 1.02)) return null;
  if (l2.kind === 'segment' && (u < -0.02 || u > 1.02)) return null;

  const ix = x1 + t * (x2 - x1);
  const iy = y1 + t * (y2 - y1);
  if (Math.abs(ix) > PAPER_HALF_W || Math.abs(iy) > PAPER_HALF_H) return null;
  return { x: ix, y: iy };
}

function isAngleInArc(angleDeg: number, startDeg: number, endDeg: number): boolean {
  const span = Math.abs(endDeg - startDeg);
  if (span >= 359.5) return true;
  const a = normalizeDeg(angleDeg);
  const s = normalizeDeg(startDeg);
  const e = normalizeDeg(endDeg);
  if (endDeg >= startDeg) {
    if (s <= e) return a >= s - 4 && a <= e + 4;
    return a >= s - 4 || a <= e + 4;
  } else {
    if (e <= s) return a >= e - 4 && a <= s + 4;
    return a >= e - 4 || a <= s + 4;
  }
}

export function arcArcIntersections(a1: GeoArc, a2: GeoArc): { x: number; y: number }[] {
  const d = dist2D(a1.cx, a1.cy, a2.cx, a2.cy);
  if (d < 1e-4 || d > a1.radiusCm + a2.radiusCm + 0.02 || d < Math.abs(a1.radiusCm - a2.radiusCm) - 0.02) {
    return [];
  }
  const r1 = a1.radiusCm;
  const r2 = a2.radiusCm;
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const hSq = Math.max(0, r1 * r1 - a * a);
  const h = Math.sqrt(hSq);

  const xm = a1.cx + (a * (a2.cx - a1.cx)) / d;
  const ym = a1.cy + (a * (a2.cy - a1.cy)) / d;
  const rx = (-(a2.cy - a1.cy) * h) / d;
  const ry = ((a2.cx - a1.cx) * h) / d;

  const candidates =
    h < 1e-3
      ? [{ x: xm, y: ym }]
      : [
          { x: xm + rx, y: ym + ry },
          { x: xm - rx, y: ym - ry },
        ];

  return candidates.filter((pt) => {
    const ang1 = radToDeg(Math.atan2(pt.y - a1.cy, pt.x - a1.cx));
    const ang2 = radToDeg(Math.atan2(pt.y - a2.cy, pt.x - a2.cx));
    return (
      isAngleInArc(ang1, a1.startDeg, a1.endDeg) &&
      isAngleInArc(ang2, a2.startDeg, a2.endDeg) &&
      Math.abs(pt.x) <= PAPER_HALF_W &&
      Math.abs(pt.y) <= PAPER_HALF_H
    );
  });
}

export function lineArcIntersections(line: GeoLine, arc: GeoArc): { x: number; y: number }[] {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const fx = line.x1 - arc.cx;
  const fy = line.y1 - arc.cy;

  const A = dx * dx + dy * dy;
  if (A < 1e-8) return [];
  const B = 2 * (fx * dx + fy * dy);
  const C = fx * fx + fy * fy - arc.radiusCm * arc.radiusCm;
  const disc = B * B - 4 * A * C;
  if (disc < -1e-4) return [];

  const sqrtD = Math.sqrt(Math.max(0, disc));
  const ts = sqrtD < 1e-4 ? [-B / (2 * A)] : [(-B - sqrtD) / (2 * A), (-B + sqrtD) / (2 * A)];

  const hits: { x: number; y: number }[] = [];
  for (const t of ts) {
    if (line.kind === 'segment' && (t < -0.02 || t > 1.02)) continue;
    const ix = line.x1 + t * dx;
    const iy = line.y1 + t * dy;
    const ang = radToDeg(Math.atan2(iy - arc.cy, ix - arc.cx));
    if (
      isAngleInArc(ang, arc.startDeg, arc.endDeg) &&
      Math.abs(ix) <= PAPER_HALF_W &&
      Math.abs(iy) <= PAPER_HALF_H
    ) {
      hits.push({ x: ix, y: iy });
    }
  }
  return hits;
}

export function computeSnapPoint(
  rawX: number,
  rawY: number,
  sheet: SheetState,
  poses: ToolPoses,
  snapEnabled: boolean,
  sheetType: SheetType,
  allowEdgeSnap = true,
): SnapResult {
  if (!snapEnabled) {
    return { x: rawX, y: rawY, kind: null };
  }

  const POINT_THRESHOLD = 0.52;
  const EDGE_THRESHOLD = 0.45;
  let best: SnapResult | null = null;
  let bestDist = POINT_THRESHOLD;

  // 1. Existing vertices & labeled points
  for (const pt of sheet.points) {
    const d = dist2D(rawX, rawY, pt.x, pt.y);
    if (d < bestDist) {
      bestDist = d;
      best = { x: pt.x, y: pt.y, kind: 'point', label: pt.label };
    }
  }

  // 2. Segment endpoints and midpoints
  for (const l of sheet.lines) {
    const ends = [
      { x: l.x1, y: l.y1 },
      { x: l.x2, y: l.y2 },
    ];
    for (const e of ends) {
      const d = dist2D(rawX, rawY, e.x, e.y);
      if (d < bestDist) {
        bestDist = d;
        best = { x: e.x, y: e.y, kind: 'point' };
      }
    }
    if (l.kind === 'segment') {
      const mx = (l.x1 + l.x2) / 2;
      const my = (l.y1 + l.y2) / 2;
      const dMid = dist2D(rawX, rawY, mx, my);
      if (dMid < bestDist) {
        bestDist = dMid;
        best = { x: mx, y: my, kind: 'midpoint' };
      }
    }
  }

  // 3. Arc-Arc intersections
  for (let i = 0; i < sheet.arcs.length; i++) {
    for (let j = i + 1; j < sheet.arcs.length; j++) {
      const hits = arcArcIntersections(sheet.arcs[i], sheet.arcs[j]);
      for (const h of hits) {
        const d = dist2D(rawX, rawY, h.x, h.y);
        if (d < bestDist) {
          bestDist = d;
          best = { x: h.x, y: h.y, kind: 'intersection' };
        }
      }
    }
  }

  // 4. Line-Line intersections
  for (let i = 0; i < sheet.lines.length; i++) {
    for (let j = i + 1; j < sheet.lines.length; j++) {
      const hit = lineLineIntersection(sheet.lines[i], sheet.lines[j]);
      if (hit) {
        const d = dist2D(rawX, rawY, hit.x, hit.y);
        if (d < bestDist) {
          bestDist = d;
          best = { x: hit.x, y: hit.y, kind: 'intersection' };
        }
      }
    }
  }

  // 5. Line-Arc intersections
  for (const l of sheet.lines) {
    for (const a of sheet.arcs) {
      const hits = lineArcIntersections(l, a);
      for (const h of hits) {
        const d = dist2D(rawX, rawY, h.x, h.y);
        if (d < bestDist) {
          bestDist = d;
          best = { x: h.x, y: h.y, kind: 'intersection' };
        }
      }
    }
  }

  // 6. Protractor center & degree ticks if visible
  if (poses.visibleTools.protractor) {
    const dCenter = dist2D(rawX, rawY, poses.protractor.x, poses.protractor.y);
    if (dCenter < bestDist) {
      bestDist = dCenter;
      best = { x: poses.protractor.x, y: poses.protractor.y, kind: 'point' };
    }
  }

  if (best) return best;

  // 7. Physical straightedge snapping (Ruler edge & Set Square legs)
  if (allowEdgeSnap) {
    let bestEdgeDist = EDGE_THRESHOLD;
    let edgeSnap: SnapResult | null = null;

    if (poses.visibleTools.ruler) {
      const r = poses.ruler;
      const rad = degToRad(r.angleDeg);
      const x2 = r.x + r.lengthCm * Math.cos(rad);
      const y2 = r.y + r.lengthCm * Math.sin(rad);
      const seg = pointToSegmentDist(rawX, rawY, r.x, r.y, x2, y2);
      if (seg.dist < bestEdgeDist) {
        bestEdgeDist = seg.dist;
        edgeSnap = {
          x: seg.projX,
          y: seg.projY,
          kind: 'ruler-edge',
          edgeAngleDeg: r.angleDeg,
          distanceAlongEdgeCm: Math.round(seg.t * r.lengthCm * 10) / 10,
        };
      }
    }

    if (poses.visibleTools.setSquare) {
      const sq = poses.setSquare;
      const rad = degToRad(sq.angleDeg);
      const flipSign = sq.flipped ? -1 : 1;
      // Horizontal leg
      const hx2 = sq.x + sq.legCm * Math.cos(rad);
      const hy2 = sq.y + sq.legCm * Math.sin(rad);
      const segH = pointToSegmentDist(rawX, rawY, sq.x, sq.y, hx2, hy2);
      if (segH.dist < bestEdgeDist) {
        bestEdgeDist = segH.dist;
        edgeSnap = {
          x: segH.projX,
          y: segH.projY,
          kind: 'ruler-edge',
          edgeAngleDeg: sq.angleDeg,
          distanceAlongEdgeCm: Math.round(segH.t * sq.legCm * 10) / 10,
        };
      }
      // Perpendicular leg
      const perpRad = rad + (flipSign * Math.PI) / 2;
      const vx2 = sq.x + sq.legCm * Math.cos(perpRad);
      const vy2 = sq.y + sq.legCm * Math.sin(perpRad);
      const segV = pointToSegmentDist(rawX, rawY, sq.x, sq.y, vx2, vy2);
      if (segV.dist < bestEdgeDist) {
        bestEdgeDist = segV.dist;
        edgeSnap = {
          x: segV.projX,
          y: segV.projY,
          kind: 'ruler-edge',
          edgeAngleDeg: sq.angleDeg + flipSign * 90,
          distanceAlongEdgeCm: Math.round(segV.t * sq.legCm * 10) / 10,
        };
      }
    }

    if (edgeSnap) return edgeSnap;
  }

  // 8. Subtle millimeter/cm grid snap when on grid paper
  if (sheetType !== 'plain') {
    const step = sheetType === 'dots' ? 1.0 : 0.5;
    const gx = Math.round(rawX / step) * step;
    const gy = Math.round(rawY / step) * step;
    if (dist2D(rawX, rawY, gx, gy) < 0.25) {
      return { x: gx, y: gy, kind: 'grid' };
    }
  }

  return { x: rawX, y: rawY, kind: null };
}

export function lineAngleRad(l: GeoLine): number {
  return Math.atan2(l.y2 - l.y1, l.x2 - l.x1);
}

export function angleBetweenLinesDeg(l1: GeoLine, l2: GeoLine): number {
  const a1 = lineAngleRad(l1);
  const a2 = lineAngleRad(l2);
  let diff = Math.abs(radToDeg(a1 - a2)) % 180;
  if (diff > 90) diff = 180 - diff;
  return diff;
}

export function userLines(sheet: SheetState): GeoLine[] {
  return sheet.lines.filter((l) => !l.locked);
}

export function userArcs(sheet: SheetState): GeoArc[] {
  return sheet.arcs.filter((a) => !a.locked);
}
