import {
  PAPER_HALF_H,
  PAPER_HALF_W,
  degToRad,
} from '../geometry/mathKernel';
import {
  CompassPose,
  GeoArc,
  GeoLine,
  GeoMark,
  GeoPoint,
  PreviewStroke,
  ProtractorPose,
  SheetState,
  SheetType,
  SnapResult,
} from '../types/geometry';

export const PAPER_PX_PER_CM = 80;
export const PAPER_CANVAS_W = PAPER_HALF_W * 2 * PAPER_PX_PER_CM; // 2240
export const PAPER_CANVAS_H = PAPER_HALF_H * 2 * PAPER_PX_PER_CM; // 1600

export function paperToCanvas(px: number, py: number): { cx: number; cy: number } {
  return {
    cx: (px + PAPER_HALF_W) * PAPER_PX_PER_CM,
    cy: (PAPER_HALF_H - py) * PAPER_PX_PER_CM,
  };
}

function drawLineEntity(ctx: CanvasRenderingContext2D, l: GeoLine) {
  let x1 = l.x1;
  let y1 = l.y1;
  let x2 = l.x2;
  let y2 = l.y2;

  if (l.kind === 'line') {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len > 1e-4) {
      const ux = dx / len;
      const uy = dy / len;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      x1 = mx - ux * 16;
      y1 = my - uy * 16;
      x2 = mx + ux * 16;
      y2 = my + uy * 16;
    }
  }

  const p1 = paperToCanvas(x1, y1);
  const p2 = paperToCanvas(x2, y2);

  ctx.save();
  ctx.strokeStyle = l.color;
  ctx.lineCap = 'round';
  if (l.style === 'construction') {
    ctx.lineWidth = 4.2;
    ctx.setLineDash([14, 10]);
  } else {
    ctx.lineWidth = 6.4;
    ctx.setLineDash([]);
  }
  ctx.beginPath();
  ctx.moveTo(p1.cx, p1.cy);
  ctx.lineTo(p2.cx, p2.cy);
  ctx.stroke();

  if (l.label) {
    ctx.setLineDash([]);
    const mid = paperToCanvas((l.x1 + l.x2) / 2, (l.y1 + l.y2) / 2);
    const labelX = Math.max(90, Math.min(PAPER_CANVAS_W - 110, p2.cx - 58));
    const labelY = Math.max(54, Math.min(PAPER_CANVAS_H - 48, p2.cy - 28));
    const lx = l.kind === 'line' ? labelX : mid.cx + 16;
    const ly = l.kind === 'line' ? labelY : mid.cy - 18;
    ctx.font = '800 38px "Outfit", "Cairo", sans-serif';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(253, 252, 249, 0.94)';
    ctx.lineWidth = 9;
    ctx.strokeText(l.label, lx, ly);
    ctx.fillStyle = l.color;
    ctx.fillText(l.label, lx, ly);
  }
  ctx.restore();
}

function drawArcEntity(ctx: CanvasRenderingContext2D, a: GeoArc) {
  const center = paperToCanvas(a.cx, a.cy);
  const rPx = a.radiusCm * PAPER_PX_PER_CM;

  // Canvas arc angle is clockwise from +X, whereas paper math angle is CCW from +X
  const startRad = -degToRad(a.startDeg);
  const endRad = -degToRad(a.endDeg);
  const anticlockwise = a.endDeg >= a.startDeg;

  ctx.save();
  ctx.strokeStyle = a.color;
  ctx.lineCap = 'round';
  if (a.style === 'construction') {
    ctx.lineWidth = 4.4;
    ctx.setLineDash([12, 9]);
  } else {
    ctx.lineWidth = 6.2;
    ctx.setLineDash([]);
  }
  ctx.beginPath();
  if (Math.abs(a.endDeg - a.startDeg) >= 359.5) {
    ctx.arc(center.cx, center.cy, rPx, 0, Math.PI * 2);
  } else {
    ctx.arc(center.cx, center.cy, rPx, startRad, endRad, anticlockwise);
  }
  ctx.stroke();
  ctx.restore();
}

function drawPointEntity(ctx: CanvasRenderingContext2D, pt: GeoPoint) {
  const c = paperToCanvas(pt.x, pt.y);
  const accent = pt.role === 'given' ? '#0f172a' : '#0284c7';
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;
  ctx.lineWidth = 4.2;
  ctx.lineCap = 'round';

  // Crisp geometric cross-tick
  const s = 12;
  ctx.beginPath();
  ctx.moveTo(c.cx - s, c.cy - s);
  ctx.lineTo(c.cx + s, c.cy + s);
  ctx.moveTo(c.cx + s, c.cy - s);
  ctx.lineTo(c.cx - s, c.cy + s);
  ctx.stroke();

  // Jewel outer ring + crisp white inner core
  ctx.beginPath();
  ctx.arc(c.cx, c.cy, 7.5, 0, Math.PI * 2);
  ctx.fillStyle = '#fdfcf9';
  ctx.fill();
  ctx.lineWidth = 3.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(c.cx, c.cy, 3.8, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();

  if (pt.label) {
    ctx.font = '800 40px "Outfit", "Cairo", sans-serif';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(253, 252, 249, 0.96)';
    ctx.lineWidth = 10;
    ctx.strokeText(pt.label, c.cx + 18, c.cy - 18);
    ctx.fillStyle = pt.role === 'given' ? '#0f172a' : '#0369a1';
    ctx.fillText(pt.label, c.cx + 18, c.cy - 18);
  }
  ctx.restore();
}

function drawMarkEntity(ctx: CanvasRenderingContext2D, m: GeoMark) {
  const c = paperToCanvas(m.x, m.y);
  ctx.save();
  ctx.translate(c.cx, c.cy);
  ctx.rotate(-degToRad(m.angleDeg));
  ctx.strokeStyle = m.color || '#dc2626';
  ctx.fillStyle = m.color || '#dc2626';
  ctx.lineWidth = 4.8;
  ctx.lineCap = 'round';

  if (m.type === 'right-angle') {
    const sz = 34;
    ctx.fillStyle = 'rgba(220, 38, 38, 0.18)';
    ctx.fillRect(0, -sz, sz, sz);
    ctx.beginPath();
    ctx.moveTo(0, -sz);
    ctx.lineTo(sz, -sz);
    ctx.lineTo(sz, 0);
    ctx.stroke();
  } else if (m.type === 'equal-1') {
    ctx.beginPath();
    ctx.moveTo(-9, 14);
    ctx.lineTo(9, -14);
    ctx.stroke();
  } else if (m.type === 'equal-2') {
    ctx.beginPath();
    ctx.moveTo(-14, 14);
    ctx.lineTo(2, -14);
    ctx.moveTo(-2, 14);
    ctx.lineTo(14, -14);
    ctx.stroke();
  } else if (m.type === 'angle-arc') {
    ctx.beginPath();
    ctx.arc(0, 0, 46, -Math.PI / 3, 0);
    ctx.stroke();
  } else if (m.type === 'point-label' && m.label) {
    ctx.rotate(degToRad(m.angleDeg));
    ctx.font = '800 38px "Outfit", "Cairo", sans-serif';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(253, 252, 249, 0.94)';
    ctx.lineWidth = 8;
    ctx.strokeText(m.label, 14, -14);
    ctx.fillText(m.label, 14, -14);
  }
  ctx.restore();
}

export function renderPaperToCanvas(
  ctx: CanvasRenderingContext2D,
  sheet: SheetState,
  sheetType: SheetType,
  preview: PreviewStroke | null,
  activeSnap: SnapResult | null,
  protractorGuide?: ProtractorPose | null,
  compassGuide?: CompassPose | null,
): void {
  const W = PAPER_CANVAS_W;
  const H = PAPER_CANVAS_H;

  // 1. Clean warm white paper background + subtle edge depth vignette
  ctx.fillStyle = '#fdfcf9';
  ctx.fillRect(0, 0, W, H);

  const edgeShadeTop = ctx.createLinearGradient(0, 0, 0, 36);
  edgeShadeTop.addColorStop(0, 'rgba(15, 23, 42, 0.055)');
  edgeShadeTop.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = edgeShadeTop;
  ctx.fillRect(0, 0, W, 36);

  const edgeShadeBot = ctx.createLinearGradient(0, H - 36, 0, H);
  edgeShadeBot.addColorStop(0, 'rgba(15, 23, 42, 0)');
  edgeShadeBot.addColorStop(1, 'rgba(15, 23, 42, 0.06)');
  ctx.fillStyle = edgeShadeBot;
  ctx.fillRect(0, H - 36, W, 36);

  // Subtle sheet border margin + architectural corner registration ticks
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
  ctx.lineWidth = 2.5;
  const tick = 22;
  ctx.beginPath();
  // Top-left
  ctx.moveTo(18, 18 + tick); ctx.lineTo(18, 18); ctx.lineTo(18 + tick, 18);
  // Top-right
  ctx.moveTo(W - 18 - tick, 18); ctx.lineTo(W - 18, 18); ctx.lineTo(W - 18, 18 + tick);
  // Bottom-left
  ctx.moveTo(18, H - 18 - tick); ctx.lineTo(18, H - 18); ctx.lineTo(18 + tick, H - 18);
  // Bottom-right
  ctx.moveTo(W - 18 - tick, H - 18); ctx.lineTo(W - 18, H - 18); ctx.lineTo(W - 18, H - 18 - tick);
  ctx.stroke();

  ctx.save();
  ctx.font = '600 18px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(100, 116, 139, 0.55)';
  ctx.fillText('28 × 20 cm · 1:1', W - 210, H - 30);
  ctx.restore();

  // 2. Grid pattern
  if (sheetType === 'millimeter') {
    // Faint 2mm subgrid for performance & clarity, bold 1cm grid
    const subStep = PAPER_PX_PER_CM / 5; // 2mm
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += subStep) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = 0; y <= H; y += subStep) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(2, 132, 199, 0.20)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x <= W; x += PAPER_PX_PER_CM) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = 0; y <= H; y += PAPER_PX_PER_CM) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();

    // Bold 5 cm architectural major grid accents centered around paper origin
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.34)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    const majorStep = PAPER_PX_PER_CM * 5;
    for (let x = W / 2 % majorStep; x <= W; x += majorStep) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = H / 2 % majorStep; y <= H; y += majorStep) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
  } else if (sheetType === 'dots') {
    ctx.fillStyle = 'rgba(100, 116, 139, 0.42)';
    for (let x = PAPER_PX_PER_CM; x < W; x += PAPER_PX_PER_CM) {
      for (let y = PAPER_PX_PER_CM; y < H; y += PAPER_PX_PER_CM) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3. Draw Construction Arcs first
  for (const arc of sheet.arcs) {
    drawArcEntity(ctx, arc);
  }

  // 4. Draw Lines & Segments
  for (const line of sheet.lines) {
    drawLineEntity(ctx, line);
  }

  // 5. Draw Exam Coding Marks
  for (const mark of sheet.marks) {
    drawMarkEntity(ctx, mark);
  }

  // 6. Draw Points & Vertex Labels
  for (const pt of sheet.points) {
    drawPointEntity(ctx, pt);
  }

  // 6b. Protractor Live Target Angle Ray
  if (protractorGuide) {
    const c = paperToCanvas(protractorGuide.x, protractorGuide.y);
    const totalRad = degToRad(protractorGuide.angleDeg + protractorGuide.measureDeg);
    const lenPx = (protractorGuide.radiusCm + 1.6) * PAPER_PX_PER_CM;
    const tx = c.cx + Math.cos(totalRad) * lenPx;
    const ty = c.cy - Math.sin(totalRad) * lenPx;

    ctx.save();
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.85)';
    ctx.lineWidth = 2.6;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.moveTo(c.cx, c.cy);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(tx, ty, 6.5, 0, Math.PI * 2);
    ctx.fill();

    const label = `${protractorGuide.measureDeg.toFixed(0)}°`;
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    const w = ctx.measureText(label).width + 20;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(tx + 10, ty - 20, w, 34);
    ctx.fillStyle = '#fef3c7';
    ctx.fillText(label, tx + 20, ty + 6);
    ctx.restore();
  }

  // 6c. Compass Live Orbital Radius Guide (when active & idle)
  if (compassGuide && (!preview || preview.kind !== 'arc')) {
    const c = paperToCanvas(compassGuide.cx, compassGuide.cy);
    const rPx = compassGuide.radiusCm * PAPER_PX_PER_CM;
    const armRad = degToRad(compassGuide.armAngleDeg);
    const tx = c.cx + Math.cos(armRad) * rPx;
    const ty = c.cy - Math.sin(armRad) * rPx;

    ctx.save();
    // Subtle full orbit guide ring
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.22)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(c.cx, c.cy, rPx, 0, Math.PI * 2);
    ctx.stroke();

    // Radius span spoke from needle to pencil tip
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(c.cx, c.cy);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Needle crosshair + center pinhole dimple
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.78)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(c.cx, c.cy, 8.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(220, 38, 38, 0.85)';
    ctx.beginPath();
    ctx.arc(c.cx, c.cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Radius callout pill
    const label = `R = ${compassGuide.radiusCm.toFixed(1)} cm`;
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    const w = ctx.measureText(label).width + 18;
    const lx = Math.max(24, Math.min(W - w - 24, (c.cx + tx) / 2 - w / 2));
    const ly = Math.max(36, Math.min(H - 24, (c.cy + ty) / 2 - 14));
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(lx, ly - 22, w, 30);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText(label, lx + 9, ly);
    ctx.restore();
  }

  // 7. Active Preview Stroke + Live CAD Length/Angle Callout
  if (preview) {
    ctx.save();
    ctx.strokeStyle = preview.style === 'solid' ? '#0f172a' : '#2563eb';
    ctx.lineWidth = preview.style === 'solid' ? 6.4 : 4.4;
    ctx.lineCap = 'round';
    ctx.setLineDash(preview.style === 'construction' ? [12, 9] : []);
    if (
      preview.kind === 'line' &&
      preview.x1 !== undefined &&
      preview.y1 !== undefined &&
      preview.x2 !== undefined &&
      preview.y2 !== undefined
    ) {
      const p1 = paperToCanvas(preview.x1, preview.y1);
      const p2 = paperToCanvas(preview.x2, preview.y2);
      ctx.beginPath();
      ctx.moveTo(p1.cx, p1.cy);
      ctx.lineTo(p2.cx, p2.cy);
      ctx.stroke();

      const lenCm = Math.hypot(preview.x2 - preview.x1, preview.y2 - preview.y1);
      if (lenCm >= 0.2) {
        let ang = (Math.atan2(preview.y2 - preview.y1, preview.x2 - preview.x1) * 180) / Math.PI;
        if (ang < 0) ang += 360;
        const callout = `${lenCm.toFixed(1)} cm · ${ang.toFixed(0)}°`;
        ctx.setLineDash([]);
        ctx.font = 'bold 25px "JetBrains Mono", monospace';
        const tw = ctx.measureText(callout).width + 22;
        const bx = Math.min(W - tw - 16, Math.max(16, p2.cx + 18));
        const by = Math.min(H - 48, Math.max(40, p2.cy - 22));
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx, by - 26, tw, 36);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillText(callout, bx + 11, by + 1);
      }
    } else if (
      preview.kind === 'arc' &&
      preview.cx !== undefined &&
      preview.cy !== undefined &&
      preview.radiusCm !== undefined
    ) {
      const c = paperToCanvas(preview.cx, preview.cy);
      const rPx = preview.radiusCm * PAPER_PX_PER_CM;
      // Faint orbital radius reference ring
      ctx.save();
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.24)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, rPx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Active swept arc segment
      const sDeg = preview.startDeg ?? 0;
      const eDeg = preview.endDeg ?? 0;
      const spanDeg = Math.abs(eDeg - sDeg);
      if (spanDeg >= 1) {
        ctx.beginPath();
        if (spanDeg >= 359.5) {
          ctx.arc(c.cx, c.cy, rPx, 0, Math.PI * 2);
        } else {
          ctx.arc(
            c.cx,
            c.cy,
            rPx,
            -degToRad(sDeg),
            -degToRad(eDeg),
            eDeg >= sDeg,
          );
        }
        ctx.stroke();
      }
      const callout = `R = ${preview.radiusCm.toFixed(1)} cm · ${spanDeg.toFixed(0)}°`;
      ctx.setLineDash([]);
      ctx.font = 'bold 25px "JetBrains Mono", monospace';
      const tw = ctx.measureText(callout).width + 22;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(c.cx - tw / 2, Math.max(24, c.cy - rPx - 46), tw, 36);
      ctx.fillStyle = '#fef3c7';
      ctx.fillText(callout, c.cx - tw / 2 + 11, Math.max(51, c.cy - rPx - 19));
    }
    ctx.restore();
  }

  // 8. Magnetic Snap Target Halo
  if (activeSnap && activeSnap.kind) {
    const s = paperToCanvas(activeSnap.x, activeSnap.y);
    ctx.save();
    ctx.strokeStyle = activeSnap.kind === 'ruler-edge' ? '#059669' : '#d97706';
    ctx.fillStyle =
      activeSnap.kind === 'ruler-edge'
        ? 'rgba(5, 150, 105, 0.16)'
        : 'rgba(217, 119, 6, 0.22)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(s.cx, s.cy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

export function renderLoupeCrop(
  targetCtx: CanvasRenderingContext2D,
  paperCanvas: HTMLCanvasElement,
  paperX: number,
  paperY: number,
  sizePx: number,
): void {
  const c = paperToCanvas(paperX, paperY);
  const zoom = 2.8;
  const srcSize = sizePx / zoom;

  targetCtx.clearRect(0, 0, sizePx, sizePx);
  targetCtx.save();
  targetCtx.beginPath();
  targetCtx.arc(sizePx / 2, sizePx / 2, sizePx / 2 - 2, 0, Math.PI * 2);
  targetCtx.clip();

  targetCtx.fillStyle = '#fdfcf9';
  targetCtx.fillRect(0, 0, sizePx, sizePx);

  targetCtx.drawImage(
    paperCanvas,
    c.cx - srcSize / 2,
    c.cy - srcSize / 2,
    srcSize,
    srcSize,
    0,
    0,
    sizePx,
    sizePx,
  );

  // Precision magnifying crosshairs
  targetCtx.strokeStyle = 'rgba(2, 132, 199, 0.72)';
  targetCtx.lineWidth = 1.25;
  targetCtx.beginPath();
  targetCtx.moveTo(sizePx / 2, 0);
  targetCtx.lineTo(sizePx / 2, sizePx);
  targetCtx.moveTo(0, sizePx / 2);
  targetCtx.lineTo(sizePx, sizePx / 2);
  targetCtx.stroke();

  targetCtx.beginPath();
  targetCtx.arc(sizePx / 2, sizePx / 2, 6, 0, Math.PI * 2);
  targetCtx.stroke();

  targetCtx.restore();
}
