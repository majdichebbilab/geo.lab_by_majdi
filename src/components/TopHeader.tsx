import { Award } from 'lucide-react';
import { Translations } from '../i18n/translations';
import { Language } from '../types/geometry';

const TEACHER_LOGO_SRC = `${import.meta.env.BASE_URL}assets/aistudio/907839091_1760631539400894_1439018136014051481_n_639f1b42.jpg`;
const FACEBOOK_PAGE_URL =
  'https://www.facebook.com/profile.php?id=100063621936512';

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
    <header className="flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 h-16 bg-white border-b border-slate-200 shrink-0 z-20">
      {/* Zone 1: Teacher Logo + Brand Title & Facebook Page Link */}
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          title={FACEBOOK_PAGE_URL}
          className="flex flex-col items-center group shrink-0"
        >
          <img
            src={TEACHER_LOGO_SRC}
            alt={t.brandTitle}
            className="w-9 h-9 rounded-full object-cover border-2 border-red-600/80 shadow-xs group-hover:scale-105 transition-transform"
          />
          <span className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-[1px] rounded bg-[#1877F2] group-hover:bg-[#145dbf] text-white text-[9px] font-bold leading-tight shadow-2xs">
            <svg
              viewBox="0 0 24 24"
              className="w-2.5 h-2.5 fill-current shrink-0"
              aria-hidden="true"
            >
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </span>
        </a>
        <div className="flex flex-col min-w-0">
          <span className="font-display text-base md:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap truncate leading-tight">
            {t.brandTitle}
          </span>
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-[#1877F2] hover:text-[#145dbf] hover:underline truncate leading-tight"
          >
            {lang === 'ar'
              ? 'صفحة الأستاذ مجدي على فيسبوك'
              : lang === 'fr'
              ? 'Page Facebook · Prof. Majdi'
              : 'Facebook Page · Prof. Majdi'}
          </a>
        </div>
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
