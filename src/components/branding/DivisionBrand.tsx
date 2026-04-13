import clsx from 'clsx';
import { DivisionSeal } from '@/components/branding/DivisionSeal';

interface DivisionBrandProps {
  variant?: 'hero' | 'sidebar' | 'header';
  collapsed?: boolean;
  className?: string;
}

const divisionTitle = 'División Centro de Análisis Estratégico';
const sectionTitle = 'Sección Análisis de Información Delictual';

export function DivisionBrand({
  variant = 'sidebar',
  collapsed = false,
  className,
}: DivisionBrandProps) {
  if (variant === 'hero') {
    return (
      <section
        className={clsx(
          'division-hero relative overflow-hidden rounded-[28px] border border-[#d7ad45]/30 px-6 py-7 shadow-[0_24px_60px_rgba(15,29,48,0.18)] sm:px-8 sm:py-8 lg:px-10 lg:py-10',
          className
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(215,173,69,0.2),transparent_35%),linear-gradient(135deg,#11233c_0%,#1e3a5f_55%,#284a74_100%)]" />
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/10" />
        <div className="absolute bottom-5 left-5 h-24 w-24 rounded-full border border-white/10" />

        <div className="relative flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:gap-8 lg:text-left">
          <div className="shrink-0 rounded-[28px] bg-white/8 p-2.5 backdrop-blur-sm shadow-[0_18px_35px_rgba(0,0,0,0.18)] ring-1 ring-white/10">
            <DivisionSeal className="h-28 w-28 sm:h-36 sm:w-36 lg:h-40 lg:w-40" />
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-[#f2d47c]/35 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f7e7b2] backdrop-blur-sm">
              Policía de Tucumán · SIGEP
            </div>
            <h1 className="font-institutional mt-4 text-3xl font-black uppercase italic leading-[0.95] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.18)] sm:text-4xl lg:text-5xl xl:text-[3.6rem]">
              {divisionTitle}
            </h1>
            <div className="mx-auto mt-4 h-px w-36 bg-gradient-to-r from-transparent via-[#f2d47c] to-transparent lg:mx-0 lg:w-56" />
            <p className="font-institutional mt-4 text-lg font-bold uppercase italic tracking-[0.08em] text-[#f9efc7] sm:text-xl lg:text-2xl">
              {sectionTitle}
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-slate-200/95 lg:mx-0 lg:text-base">
              Plataforma institucional de análisis comparativo y seguimiento
              estadístico para centralizar la información delictual de la
              Policía de Tucumán.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'header') {
    return (
      <div
        className={clsx(
          'hidden xl:flex items-center gap-3 rounded-2xl border border-[#d7ad45]/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,247,250,0.96))] px-3 py-2 shadow-sm',
          className
        )}
      >
        <div className="rounded-2xl bg-white p-1 shadow-[0_8px_18px_rgba(15,29,48,0.08)] ring-1 ring-[#d7ad45]/20">
          <DivisionSeal className="h-11 w-11" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a7340]">
            Policía de Tucumán
          </p>
          <p className="truncate text-sm font-bold text-slate-900">
            {divisionTitle}
          </p>
          <p className="truncate text-xs text-slate-500">SIGEP institucional</p>
        </div>
      </div>
    );
  }

  if (collapsed) {
    return (
      <div className={clsx('flex items-center justify-center', className)}>
        <div className="rounded-[22px] bg-white/8 p-1.5 shadow-[0_12px_24px_rgba(0,0,0,0.2)] ring-1 ring-white/10 backdrop-blur-sm">
          <DivisionSeal className="h-11 w-11" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'rounded-[24px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-3.5 shadow-[0_16px_34px_rgba(0,0,0,0.18)] backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-[22px] bg-white/8 p-1.5 ring-1 ring-white/10">
          <DivisionSeal className="h-12 w-12" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f2d47c]">
            Policía de Tucumán
          </p>
          <h1 className="text-sm font-semibold leading-tight text-white">
            {divisionTitle}
          </h1>
        </div>
      </div>

      <div className="mt-3 border-t border-white/10 pt-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
          SIGEP
        </p>
        <p className="mt-1 text-xs leading-5 text-white/72">{sectionTitle}</p>
      </div>
    </div>
  );
}