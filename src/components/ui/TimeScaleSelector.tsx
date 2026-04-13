'use client';

import clsx from 'clsx';
import type { EscalaTemporal } from '@/store/estadisticasStore';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';

interface TimeScaleSelectorProps {
  value: EscalaTemporal;
  onChange: (escala: EscalaTemporal) => void;
}

const opciones: Array<{
  value: EscalaTemporal;
  label: string;
  icon: typeof Calendar;
}> = [
  { value: 'semanal', label: 'Semanal', icon: Calendar },
  { value: 'mensual', label: 'Mensual', icon: CalendarDays },
  { value: 'anual', label: 'Anual', icon: CalendarRange },
];

export function TimeScaleSelector({ value, onChange }: TimeScaleSelectorProps) {
  return (
    <div className="inline-flex rounded-xl bg-gray-100 p-1 gap-1">
      {opciones.map(op => {
        const Icon = op.icon;
        const activo = value === op.value;
        return (
          <button
            key={op.value}
            onClick={() => onChange(op.value)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activo
                ? 'bg-white text-policia-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            )}
          >
            <Icon size={16} />
            {op.label}
          </button>
        );
      })}
    </div>
  );
}
