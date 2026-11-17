import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Award, Download, Printer, Star, X } from 'lucide-react';
import { Translations, pickText } from '../i18n/translations';
import { CurriculumLesson, Language } from '../types/geometry';

const TEACHER_LOGO_SRC = `${import.meta.env.BASE_URL}assets/aistudio/907839091_1760631539400894_1439018136014051481_n_639f1b42.jpg`;

interface CertificateModalProps {
  open: boolean;
  onClose: () => void;
  lang: Language;
  t: Translations;
  pupilName: string;
  onChangePupilName: (name: string) => void;
  lessons: CurriculumLesson[];
  completedLessons: Record<string, number>;
}

export function CertificateModal({
  open,
  onClose,
  lang,
  t,
  pupilName,
  onChangePupilName,
  lessons,
  completedLessons,
}: CertificateModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const displayName = pupilName.trim() || t.certificate.defaultPupil;
  const completedCount = Object.keys(completedLessons).length;
  const totalStars = Object.values(completedLessons).reduce((a, b) => a + b, 0);
  const dateStr = new Date().toLocaleDateString(
    lang === 'ar' ? 'ar-TN' : lang === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    canvas.height = 980;
    const ctx = canvas.getContext('2d')!;

    // Warm ivory certificate parchment
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(0, 0, 1400, 980);

    // Ornate double border
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 14;
    ctx.strokeRect(36, 36, 1328, 908);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.strokeRect(56, 56, 1288, 868);

    // Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 54px "Cairo", "Outfit", sans-serif';
    ctx.fillText(t.certificate.heading, 700, 168);

    ctx.fillStyle = '#475569';
    ctx.font = '600 28px "Cairo", "Plus Jakarta Sans", sans-serif';
    ctx.fillText(t.certificate.subheading, 700, 224);

    // Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(260, 265);
    ctx.lineTo(1140, 265);
    ctx.stroke();

    // Awarded to
    ctx.fillStyle = '#334155';
    ctx.font = '600 28px "Cairo", sans-serif';
    ctx.fillText(t.certificate.awardedTo, 700, 340);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 64px "Cairo", "Outfit", sans-serif';
    ctx.fillText(displayName, 700, 428);

    // Body text wrapped cleanly
    ctx.fillStyle = '#334155';
    ctx.font = '500 26px "Cairo", "Plus Jakarta Sans", sans-serif';
    const words = t.certificate.bodyText.split(' ');
    let line = '';
    let y = 515;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > 1000) {
        ctx.fillText(line, 700, y);
        line = w;
        y += 42;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, 700, y);

    // Stats box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(300, 625, 800, 105);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(300, 625, 800, 105);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 30px "Cairo", sans-serif';
    ctx.fillText(
      `${t.certificate.completedCount}: ${completedCount}/${lessons.length}    ·    ${t.certificate.starsEarned}: ${totalStars}/${lessons.length * 3} ★`,
      700,
      688,
    );

    // Signature & Seal
    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 30px "Cairo", sans-serif';
    ctx.fillText(t.certificate.signedBy, 360, 825);
    ctx.fillStyle = '#64748b';
    ctx.font = '500 22px "Cairo", sans-serif';
    ctx.fillText(t.certificate.teacherRole, 360, 862);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px "Cairo", sans-serif';
    ctx.fillText(`${t.certificate.dateLabel}: ${dateStr}`, 1020, 835);

    const exportWithSeal = (logoImg?: HTMLImageElement) => {
      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(700, 832, 62, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(logoImg, 638, 770, 124, 124);
        ctx.restore();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(700, 832, 62, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Fallback Gold Seal
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(700, 832, 54, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(700, 832, 44, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('★', 700, 845);
      }

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `geometry_lab_certificate_${displayName.replace(/\s+/g, '_')}.png`;
      a.click();
    };

    const logoImg = new Image();
    logoImg.onload = () => exportWithSeal(logoImg);
    logoImg.onerror = () => exportWithSeal();
    logoImg.src = TEACHER_LOGO_SRC;
  };

  const BackIcon = lang === 'ar' ? ArrowRight : ArrowLeft;
  const backLabel =
    lang === 'ar' ? 'العودة إلى المختبر' : lang === 'fr' ? 'Retour au labo' : 'Back to Lab';

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92dvh] flex flex-col overflow-hidden">
        {/* Pinned Modal Controls Header (always visible on every screen size) */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Award className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 truncate">
              {t.certificate.heading}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              <BackIcon className="w-3.5 h-3.5" />
              <span>{backLabel}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
              aria-label={t.certificate.closeBtn}
              title={t.certificate.closeBtn}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 lab-scroll">
          {/* Pupil Name Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={pupilName}
              onChange={(e) => onChangePupilName(e.target.value)}
              placeholder={t.controls.pupilNamePlaceholder}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="button"
              onClick={handleDownloadPng}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>{t.certificate.downloadPng}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>{t.certificate.printBtn}</span>
            </button>
          </div>

          {completedCount === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2 font-medium">
              {t.certificate.lockedNotice}
            </p>
          )}

          {/* Printable Certificate Preview */}
          <div
            id="certificate-print-area"
            className="bg-[#fffdf7] border-8 border-emerald-800 rounded-xl p-6 md:p-8 text-center relative"
          >
            <div className="border-2 border-amber-500 rounded-lg p-5 md:p-7 space-y-4">
              <div className="flex justify-center">
                <img
                  src={TEACHER_LOGO_SRC}
                  alt={t.certificate.signedBy}
                  className="w-20 h-20 rounded-full object-cover border-2 border-amber-500 shadow-md"
                />
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-emerald-900">
                  {t.certificate.heading}
                </h3>
                <p className="text-xs md:text-sm font-semibold text-slate-500 mt-1">
                  {t.certificate.subheading}
                </p>
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-600">
                  {t.certificate.awardedTo}
                </p>
                <p className="font-display text-2xl md:text-3xl font-bold text-slate-900 mt-1">
                  {displayName}
                </p>
              </div>

              <p className="text-xs md:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
                {t.certificate.bodyText}
              </p>

              {/* Completed Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-start">
                {lessons.map((l) => {
                  const stars = completedLessons[l.id] || 0;
                  return (
                    <div
                      key={l.id}
                      className={`px-2.5 py-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                        stars > 0
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="font-semibold truncate">
                        {pickText(l.title, lang)}
                      </span>
                      <span className="flex items-center gap-0.5 font-mono-num shrink-0">
                        {stars > 0 ? `${stars}` : '0'}
                        <Star
                          className={`w-3 h-3 ${
                            stars > 0
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer Signatures */}
              <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <div className="text-start">
                  <div className="font-bold text-emerald-900 text-sm">
                    {t.certificate.signedBy}
                  </div>
                  <div className="text-slate-500">{t.certificate.teacherRole}</div>
                </div>
                <div className="text-end">
                  <div className="font-semibold">{t.certificate.dateLabel}</div>
                  <div className="font-mono-num text-slate-500">{dateStr}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Back Button for convenient navigation after scrolling */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
            >
              <BackIcon className="w-4 h-4" />
              <span>{backLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
