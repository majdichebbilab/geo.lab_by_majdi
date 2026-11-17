import * as THREE from 'three';

export function createChalkboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 680;
  const ctx = canvas.getContext('2d')!;

  // Rich emerald slate base
  const grad = ctx.createLinearGradient(0, 0, 1400, 680);
  grad.addColorStop(0, '#184433');
  grad.addColorStop(0.5, '#1e503c');
  grad.addColorStop(1, '#163d2d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1400, 680);

  // Subtle chalk dust texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let i = 0; i < 60; i++) {
    const x = (i * 173) % 1400;
    const y = (i * 97) % 680;
    ctx.beginPath();
    ctx.arc(x, y, 36 + (i % 40), 0, Math.PI * 2);
    ctx.fill();
  }

  // Main Arabic Chalkboard Header
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 252, 235, 0.94)';
  ctx.font = 'bold 58px "Cairo", sans-serif';
  ctx.fillText('مختبر الهندسة - إعداد الأستاذ مجدي', 700, 130);

  // Chalk underline
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.72)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(260, 162);
  ctx.lineTo(1140, 162);
  ctx.stroke();

  // Subtitle
  ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
  ctx.font = '600 32px "Cairo", sans-serif';
  ctx.fillText('السنة السادسة أساسي · التوازي · التعامد · المنصفات · المثلثات', 700, 224);

  // Chalk geometric sketches (Left: Right triangle with right angle mark)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(150, 520);
  ctx.lineTo(420, 520);
  ctx.lineTo(150, 320);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.85)';
  ctx.strokeRect(150, 485, 35, 35);

  // Center: Compass & Circle sketch
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.72)';
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(700, 440, 115, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.moveTo(700, 440);
  ctx.lineTo(815, 440);
  ctx.stroke();
  ctx.font = '600 26px "Outfit", sans-serif';
  ctx.fillStyle = 'rgba(253, 224, 71, 0.9)';
  ctx.fillText('R = 4 cm', 755, 422);

  // Right: Parallel lines sketch
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.68)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(990, 370);
  ctx.lineTo(1260, 370);
  ctx.moveTo(990, 490);
  ctx.lineTo(1260, 490);
  ctx.stroke();
  ctx.font = '600 28px "Outfit", sans-serif';
  ctx.fillStyle = 'rgba(167, 243, 208, 0.88)';
  ctx.fillText("(D) // (D')", 1125, 440);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createWoodDeskTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const baseGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  baseGrad.addColorStop(0, '#c6935f');
  baseGrad.addColorStop(0.5, '#cf9e6b');
  baseGrad.addColorStop(1, '#bd8955');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle plank seams + organic wood grain fibers
  for (let p = 1; p < 4; p++) {
    const py = (p * 1024) / 4;
    ctx.fillStyle = 'rgba(78, 44, 18, 0.24)';
    ctx.fillRect(0, py - 1.5, 1024, 3);
  }

  for (let i = 0; i < 180; i++) {
    const y = (i / 180) * 1024;
    ctx.strokeStyle =
      i % 3 === 0 ? 'rgba(110, 62, 24, 0.16)' : 'rgba(248, 222, 188, 0.13)';
    ctx.lineWidth = 1.6 + (i % 4);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      340,
      y + ((i % 7) - 3) * 4,
      680,
      y - ((i % 5) - 2) * 5,
      1024,
      y,
    );
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createWoodDeskGrainMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#b8b8b8';
  ctx.fillRect(0, 0, 512, 512);

  for (let p = 1; p < 4; p++) {
    const py = (p * 512) / 4;
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, py - 1, 512, 2);
  }

  for (let i = 0; i < 140; i++) {
    const y = (i / 140) * 512;
    ctx.strokeStyle = i % 2 === 0 ? '#969696' : '#d8d8d8';
    ctx.lineWidth = 1.2 + (i % 3);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      170,
      y + ((i % 7) - 3) * 2.5,
      340,
      y - ((i % 5) - 2) * 3,
      512,
      y,
    );
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createDraftingMatTexture(): THREE.CanvasTexture {
  const w = 1600;
  const h = 1200;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createRadialGradient(w * 0.5, h * 0.42, 140, w * 0.5, h * 0.5, w * 0.74);
  bg.addColorStop(0, '#334155');
  bg.addColorStop(0.65, '#1e293b');
  bg.addColorStop(1, '#0f172a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle architectural grid along the drafting mat bezel
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  ctx.lineWidth = 1.5;
  const step = 48;
  ctx.beginPath();
  for (let x = 0; x <= w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Outer perimeter ruler graduation ticks on the dark slate mat bezel
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.34)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 64; x <= w - 64; x += 24) {
    const major = (x - 64) % 96 === 0;
    const len = major ? 16 : 8;
    ctx.moveTo(x, 18);
    ctx.lineTo(x, 18 + len);
    ctx.moveTo(x, h - 18);
    ctx.lineTo(x, h - 18 - len);
  }
  for (let y = 64; y <= h - 64; y += 24) {
    const major = (y - 64) % 96 === 0;
    const len = major ? 16 : 8;
    ctx.moveTo(18, y);
    ctx.lineTo(18 + len, y);
    ctx.moveTo(w - 18, y);
    ctx.lineTo(w - 18 - len, y);
  }
  ctx.stroke();

  // Crisp inner metallic trim line
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.32)';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, w - 40, h - 40);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createPaperBumpTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const data = img.data;

  // Deterministic pseudo-noise for fine drafting vellum grain
  let seed = 1337;
  for (let i = 0; i < data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const val = 118 + ((seed >>> 24) % 24);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 6);
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    4,
    size / 2,
    size / 2,
    size / 2,
  );
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.48)');
  grad.addColorStop(0.45, 'rgba(15, 23, 42, 0.22)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createKnurlBumpTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#d4d4d4';
  ctx.lineWidth = 2;
  for (let x = -size; x < size * 2; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + size, size);
    ctx.moveTo(x + size, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  return tex;
}

export function createToolContactShadowTexture(
  shape: 'rect' | 'triangle' | 'semicircle',
): THREE.CanvasTexture {
  const w = 256;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.filter = 'blur(12px)';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';

  if (shape === 'rect') {
    ctx.fillRect(22, 34, w - 44, h - 68);
  } else if (shape === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(26, h - 26);
    ctx.lineTo(w - 26, h - 26);
    ctx.lineTo(26, 26);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(w / 2, h - 28, w * 0.41, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createRulerTexture(lengthCm = 15): THREE.CanvasTexture {
  const pxPerCm = 120;
  const width = lengthCm * pxPerCm + 120;
  const height = 280;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(248, 250, 252, 0.85)');
  grad.addColorStop(0.18, 'rgba(224, 242, 254, 0.74)');
  grad.addColorStop(1, 'rgba(203, 213, 225, 0.78)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Crisp beveled top ruler edge highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.fillRect(0, 0, width, 10);

  const offset = 60;
  ctx.strokeStyle = '#0f172a';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.font = 'bold 34px "JetBrains Mono", monospace';

  const totalMm = lengthCm * 10;
  for (let mm = 0; mm <= totalMm; mm++) {
    const x = offset + (mm / 10) * pxPerCm;
    const isCm = mm % 10 === 0;
    const isHalf = mm % 5 === 0;
    const tickH = isCm ? 72 : isHalf ? 50 : 30;
    ctx.lineWidth = isCm ? 3.5 : isHalf ? 2.4 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, tickH);
    ctx.stroke();

    if (isCm) {
      ctx.fillText(String(mm / 10), x, 114);
    }
  }

  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 26px "Cairo", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('مختبر الأستاذ مجدي · cm', width - 36, 238);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createSetSquareTexture(legCm = 9): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, size, size, 0);
  grad.addColorStop(0, 'rgba(186, 230, 253, 0.66)');
  grad.addColorStop(1, 'rgba(224, 242, 254, 0.56)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const pxPerCm = size / legCm;
  ctx.strokeStyle = '#0c4a6e';
  ctx.fillStyle = '#0c4a6e';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';

  // Bottom horizontal edge graduations
  for (let mm = 0; mm <= legCm * 10; mm++) {
    const x = (mm / 10) * pxPerCm;
    const isCm = mm % 10 === 0;
    const isHalf = mm % 5 === 0;
    const h = isCm ? 46 : isHalf ? 30 : 18;
    ctx.lineWidth = isCm ? 3.2 : isHalf ? 2 : 1.3;
    ctx.beginPath();
    ctx.moveTo(x, size);
    ctx.lineTo(x, size - h);
    ctx.stroke();
    if (isCm && mm > 0 && mm < legCm * 10) {
      ctx.textAlign = 'center';
      ctx.fillText(String(mm / 10), x, size - 56);
    }
  }

  // Left vertical edge graduations
  for (let mm = 0; mm <= legCm * 10; mm++) {
    const y = size - (mm / 10) * pxPerCm;
    const isCm = mm % 10 === 0;
    const isHalf = mm % 5 === 0;
    const w = isCm ? 46 : isHalf ? 30 : 18;
    ctx.lineWidth = isCm ? 3.2 : isHalf ? 2 : 1.3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    if (isCm && mm > 0 && mm < legCm * 10) {
      ctx.textAlign = 'left';
      ctx.fillText(String(mm / 10), 54, y + 9);
    }
  }

  // Crisp 90° corner indicator
  ctx.strokeStyle = '#dc2626';
  ctx.fillStyle = 'rgba(220, 38, 38, 0.14)';
  ctx.lineWidth = 4;
  ctx.fillRect(14, size - 62, 48, 48);
  ctx.strokeRect(14, size - 62, 48, 48);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createProtractorTexture(): THREE.CanvasTexture {
  const w = 1280;
  const h = 675;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h - 40;
  const rOuter = 575;
  const rInner = 390;

  const grad = ctx.createRadialGradient(cx, cy, 180, cx, cy, rOuter);
  grad.addColorStop(0, 'rgba(255, 251, 235, 0.52)');
  grad.addColorStop(1, 'rgba(254, 243, 199, 0.72)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter, Math.PI, 0, false);
  ctx.closePath();
  ctx.fill();

  // Outer rim ring
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter - 2, Math.PI, 0, false);
  ctx.stroke();

  // Inner reference arc
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, rInner, Math.PI, 0, false);
  ctx.stroke();

  // Center crosshair
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(cx - 32, cy);
  ctx.lineTo(cx + 32, cy);
  ctx.moveTo(cx, cy - 32);
  ctx.lineTo(cx, cy + 16);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let deg = 0; deg <= 180; deg += 1) {
    const rad = (deg * Math.PI) / 180;
    const is10 = deg % 10 === 0;
    const is5 = deg % 5 === 0;
    const len = is10 ? 42 : is5 ? 28 : 15;
    const x1 = cx + Math.cos(rad) * rOuter;
    const y1 = cy - Math.sin(rad) * rOuter;
    const x2 = cx + Math.cos(rad) * (rOuter - len);
    const y2 = cy - Math.sin(rad) * (rOuter - len);

    ctx.strokeStyle = is10 ? '#0f172a' : 'rgba(15, 23, 42, 0.72)';
    ctx.lineWidth = is10 ? 2.8 : is5 ? 1.8 : 1.1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (is10) {
      // Subtle radial guide tick on inner ring
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * (rInner - 18), cy - Math.sin(rad) * (rInner - 18));
      ctx.lineTo(cx + Math.cos(rad) * rInner, cy - Math.sin(rad) * rInner);
      ctx.stroke();

      // Outer scale (0 -> 180 right-to-left)
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText(
        String(deg),
        cx + Math.cos(rad) * (rOuter - 72),
        cy - Math.sin(rad) * (rOuter - 72),
      );

      // Inner reverse scale (180 -> 0)
      if (deg > 0 && deg < 180) {
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 19px "JetBrains Mono", monospace';
        ctx.fillText(
          String(180 - deg),
          cx + Math.cos(rad) * (rInner + 28),
          cy - Math.sin(rad) * (rInner + 28),
        );
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
