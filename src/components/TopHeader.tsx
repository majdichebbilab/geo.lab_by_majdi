import { Award } from 'lucide-react';
import { Translations } from '../i18n/translations';
import { Language } from '../types/geometry';

const TEACHER_LOGO_SRC =
  '/assets/aistudio/907839091_1760631539400894_1439018136014051481_n_639f1b42.jpg';

interface TopHeaderProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  t: Translations;
  totalStars: number;
  maxStars: number;
  onOpenCertificate: () => void;
}

export function TopHeader({
  lang,
  onChangeLang,
  t,
  totalStars,
  maxStars,
  onOpenCertificate,
}: TopHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 h-14 bg-white border-b border-slate-200 shrink-0 z-20">
      {/* Zone 1: Single-line Brand Title with Teacher Logo */}
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        <img
          src={TEACHER_LOGO_SRC}
          alt={t.brandTitle}
          className="w-10 h-10 rounded-full object-cover border-2 border-red-600/80 shadow-xs shrink-0"
        />
        <span className="font-display text-base md:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap truncate">
          {t.brandTitle}
        </span>
      </div>

      {/* Zone 2: Clean Trilingual Language Segmented Control */}
      <nav
        aria-label="Language switcher"
        className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0"
      >
        {(
          [
            { id: 'ar', label: 'العربية' },
            { id: 'fr', label: 'Français' },
            { id: 'en', label: 'English' },
          ] as { id: Language; label: string }[]
        ).map((item) => {
          const active = lang === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeLang(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Single Primary Certificate Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenCertificate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs md:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>{t.controls.certificateBtn}</span>
          <span className="font-mono-num text-amber-100 text-xs">
            {totalStars}/{maxStars}
          </span>
        </button>
      </div>
    </header>
  );
}
