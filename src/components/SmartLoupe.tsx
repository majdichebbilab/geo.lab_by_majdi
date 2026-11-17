import { useEffect, useRef } from 'react';
import { Translations } from '../i18n/translations';
import { renderLoupeCrop } from '../three/paperRenderer';
import { LoupeState } from '../types/geometry';

interface SmartLoupeProps {
  loupe: LoupeState;
  paperCanvas: HTMLCanvasElement | null;
  t: Translations;
}

export function SmartLoupe({ loupe, paperCanvas, t }: SmartLoupeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!loupe.active || !paperCanvas || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    renderLoupeCrop(ctx, paperCanvas, loupe.paperX, loupe.paperY, 132);
  }, [loupe.active, loupe.paperX, loupe.paperY, paperCanvas]);

  if (!loupe.active) return null;

  return (
    <div
      className="pointer-events-none absolute z-30 flex flex-col items-center"
      style={{
        left: `${Math.max(12, loupe.screenX - 66)}px`,
        top: `${Math.max(12, loupe.screenY - 156)}px`,
      }}
    >
      <div className="w-[136px] h-[136px] rounded-full border-4 border-sky-600 bg-white shadow-xl overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} width={132} height={132} className="w-[132px] h-[132px]" />
      </div>
      <div className="mt-1 px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-[11px] font-mono-num shadow-md whitespace-nowrap">
        {loupe.paperX.toFixed(1)} , {loupe.paperY.toFixed(1)} {t.status.cmUnit}
        {loupe.snapLabel ? ` · ${loupe.snapLabel}` : ''}
      </div>
    </div>
  );
}
