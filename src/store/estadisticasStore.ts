import { create } from 'zustand';

export type EscalaTemporal = 'semanal' | 'mensual' | 'anual';

interface FiltrosEstadisticas {
  departamentoId?: string;
  tablaConfigId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

interface EstadisticasState {
  escalaTemporal: EscalaTemporal;
  filtros: FiltrosEstadisticas;
  yoyActivo: boolean;
  setEscalaTemporal: (escala: EscalaTemporal) => void;
  setFiltros: (filtros: Partial<FiltrosEstadisticas>) => void;
  resetFiltros: () => void;
  toggleYoY: () => void;
  setYoY: (activo: boolean) => void;
}

const filtrosIniciales: FiltrosEstadisticas = {};

export const useEstadisticasStore = create<EstadisticasState>(set => ({
  escalaTemporal: 'mensual',
  filtros: filtrosIniciales,
  yoyActivo: false,
  setEscalaTemporal: escalaTemporal => set({ escalaTemporal }),
  setFiltros: filtros =>
    set(s => ({ filtros: { ...s.filtros, ...filtros } })),
  resetFiltros: () => set({ filtros: filtrosIniciales }),
  toggleYoY: () => set(s => ({ yoyActivo: !s.yoyActivo })),
  setYoY: activo => set({ yoyActivo: activo }),
}));
