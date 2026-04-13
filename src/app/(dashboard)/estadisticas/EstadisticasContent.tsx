'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useEstadisticasStore } from '@/store/estadisticasStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { TimeScaleSelector } from '@/components/ui/TimeScaleSelector';
import { FilterBar } from '@/components/ui/FilterBar';
import { ChartContainer, BarChartComparativo, PieChartComponent, LineChartComponent, AreaChartComponent } from '@/components/charts/Charts';
import { TrendChart } from '@/components/charts/TrendChart';
import {
  obtenerEstadisticasSemanales,
  obtenerEstadisticasMensuales,
  obtenerEstadisticasAnuales,
  obtenerComparativaYoY,
  obtenerProyeccion,
  obtenerDistribucionDepartamentos,
} from '@/actions/estadisticas';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { ExportButtonsEstadisticas } from '@/components/export/ExportButtons';

interface Props {
  departamentos: Array<{ id: string; nombre: string; codigo: string }>;
  tablas: Array<{ id: string; nombre: string; departamentoId: string }>;
  userDepartamentoId?: string;
  esSuperAdmin: boolean;
}

type DatosSemanales = Awaited<ReturnType<typeof obtenerEstadisticasSemanales>>;
type DatosMensuales = Awaited<ReturnType<typeof obtenerEstadisticasMensuales>>;
type DatosAnuales = Awaited<ReturnType<typeof obtenerEstadisticasAnuales>>;
type DatosYoY = Awaited<ReturnType<typeof obtenerComparativaYoY>>;
type DatosProyeccion = Awaited<ReturnType<typeof obtenerProyeccion>>;
type DatosDistribucion = Awaited<ReturnType<typeof obtenerDistribucionDepartamentos>>;

export default function EstadisticasContent({
  departamentos,
  tablas,
  userDepartamentoId,
  esSuperAdmin,
}: Props) {
  const {
    escalaTemporal,
    filtros,
    yoyActivo,
    setEscalaTemporal,
    setFiltros,
    resetFiltros,
    toggleYoY,
  } = useEstadisticasStore();

  const [isPending, startTransition] = useTransition();

  // Data states
  const [datosSemanales, setDatosSemanales] = useState<DatosSemanales | null>(null);
  const [datosMensuales, setDatosMensuales] = useState<DatosMensuales | null>(null);
  const [datosAnuales, setDatosAnuales] = useState<DatosAnuales | null>(null);
  const [datosYoY, setDatosYoY] = useState<DatosYoY | null>(null);
  const [datosProyeccion, setDatosProyeccion] = useState<DatosProyeccion | null>(null);
  const [distribucion, setDistribucion] = useState<DatosDistribucion>([]);

  // Si no es super admin, forzar filtro por su departamento
  const departamentoIdEfectivo = esSuperAdmin
    ? filtros.departamentoId
    : userDepartamentoId;

  const cargarDatos = useCallback(() => {
    startTransition(async () => {
      const filtrosBase = {
        escala: escalaTemporal as 'semanal' | 'mensual' | 'anual',
        departamentoId: departamentoIdEfectivo,
        tablaConfigId: filtros.tablaConfigId,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
      };

      try {
        // Cargar datos según escala temporal
        if (escalaTemporal === 'semanal') {
          const datos = await obtenerEstadisticasSemanales(filtrosBase);
          setDatosSemanales(datos);
        } else if (escalaTemporal === 'mensual') {
          const datos = await obtenerEstadisticasMensuales(filtrosBase);
          setDatosMensuales(datos);
        } else {
          const datos = await obtenerEstadisticasAnuales(filtrosBase);
          setDatosAnuales(datos);
        }

        // YoY si está activo
        if (yoyActivo) {
          const yoy = await obtenerComparativaYoY(filtrosBase);
          setDatosYoY(yoy);
        }

        // Proyección
        const proy = await obtenerProyeccion({
          departamentoId: departamentoIdEfectivo,
          tablaConfigId: filtros.tablaConfigId,
        });
        setDatosProyeccion(proy);

        // Distribución
        const dist = await obtenerDistribucionDepartamentos();
        setDistribucion(dist);
      } catch {
        // Silently handle - data may not exist yet
      }
    });
  }, [escalaTemporal, departamentoIdEfectivo, filtros, yoyActivo]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // KPIs según escala
  const kpis = (() => {
    if (escalaTemporal === 'semanal' && datosSemanales) {
      return {
        total: datosSemanales.kpis.totalActual,
        anterior: datosSemanales.kpis.totalAnterior,
        promedio: datosSemanales.kpis.promedioDiario,
        pico: datosSemanales.kpis.picoMaximo,
        porcentaje: datosSemanales.kpis.porcentajeCambio,
      };
    }
    if (escalaTemporal === 'mensual' && datosMensuales) {
      return {
        total: datosMensuales.kpis.totalMes,
        anterior: undefined,
        promedio: datosMensuales.kpis.promedioDiario,
        pico: datosMensuales.kpis.picoMaximo,
        porcentaje: undefined,
      };
    }
    if (escalaTemporal === 'anual' && datosAnuales) {
      return {
        total: datosAnuales.kpis.totalAnual,
        anterior: undefined,
        promedio: datosAnuales.kpis.promedioMensual,
        pico: undefined,
        porcentaje: undefined,
      };
    }
    return null;
  })();

  const fmtNum = (n: number) => new Intl.NumberFormat('es-AR').format(Math.round(n));

  // Datos para exportación
  const exportData = (() => {
    if (escalaTemporal === 'semanal' && datosSemanales) {
      return {
        datos: datosSemanales.datosGrafico.map(d => ({ nombre: d.nombre, actual: d.actual, anterior: d.anterior })),
        columnas: ['nombre', 'actual', 'anterior'],
        kpis: {
          'Total Actual': fmtNum(datosSemanales.kpis.totalActual),
          'Total Anterior': fmtNum(datosSemanales.kpis.totalAnterior),
          'Promedio Diario': fmtNum(datosSemanales.kpis.promedioDiario),
          'Pico Máximo': fmtNum(datosSemanales.kpis.picoMaximo),
        } as Record<string, string>,
      };
    }
    if (escalaTemporal === 'mensual' && datosMensuales) {
      return {
        datos: datosMensuales.datosGrafico.map(d => ({ nombre: d.nombre, valor: d.valor })),
        columnas: ['nombre', 'valor'],
        kpis: {
          'Total Mes': fmtNum(datosMensuales.kpis.totalMes),
          'Promedio Diario': fmtNum(datosMensuales.kpis.promedioDiario),
          'Pico Máximo': fmtNum(datosMensuales.kpis.picoMaximo),
        } as Record<string, string>,
      };
    }
    if (escalaTemporal === 'anual' && datosAnuales) {
      return {
        datos: datosAnuales.datosGrafico.map(d => ({ nombre: d.nombre, promedio: d.promedio, pico: d.pico })),
        columnas: ['nombre', 'promedio', 'pico'],
        kpis: {
          'Total Anual': fmtNum(datosAnuales.kpis.totalAnual),
          'Promedio Mensual': fmtNum(datosAnuales.kpis.promedioMensual),
        } as Record<string, string>,
      };
    }
    return null;
  })();

  const filtrosLabel = [
    departamentoIdEfectivo ? departamentos.find(d => d.id === departamentoIdEfectivo)?.nombre : null,
    filtros.tablaConfigId ? tablas.find(t => t.id === filtros.tablaConfigId)?.nombre : null,
  ].filter(Boolean).join(' · ') || 'Sin filtros';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <PageHeader
        titulo="Estadísticas"
        subtitulo="Análisis de datos en diferentes escalas temporales"
        icon={<BarChart3 size={28} />}
        color="#6366f1"
      >
        <button
          onClick={cargarDatos}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={16} className={isPending ? 'animate-spin' : ''} />
          {isPending ? 'Cargando...' : 'Actualizar'}
        </button>
        {exportData && (
          <ExportButtonsEstadisticas
            escala={escalaTemporal}
            filtrosLabel={filtrosLabel}
            datos={exportData.datos}
            columnas={exportData.columnas}
            kpis={exportData.kpis}
            yoyDatos={datosYoY?.datosGrafico?.map(d => ({ ...d }))}
            yoyColumnas={datosYoY ? ['nombre', `${datosYoY.anioActual}`, `${datosYoY.anioAnterior}`] : undefined}
            proyeccionDatos={datosProyeccion?.datosGrafico?.map(d => ({ nombre: d.nombre, valor: d.valor, tipo: d.tipo }))}
          />
        )}
      </PageHeader>

      {/* Controles */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TimeScaleSelector
            value={escalaTemporal}
            onChange={setEscalaTemporal}
          />
        </div>
        <FilterBar
          departamentos={esSuperAdmin ? departamentos : []}
          tablas={tablas}
          departamentoId={departamentoIdEfectivo}
          tablaConfigId={filtros.tablaConfigId}
          yoyActivo={yoyActivo}
          onDepartamentoChange={id => setFiltros({ departamentoId: id })}
          onTablaChange={id => setFiltros({ tablaConfigId: id })}
          onYoYToggle={toggleYoY}
          onReset={resetFiltros}
        />
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            titulo={escalaTemporal === 'semanal' ? 'Total Semanal' : escalaTemporal === 'mensual' ? 'Total Mensual' : 'Total Anual'}
            valor={kpis.total}
            valorAnterior={kpis.anterior}
            porcentaje={kpis.porcentaje != null ? Math.round(kpis.porcentaje) : undefined}
            color="#6366f1"
            icon={<Activity size={20} />}
          />
          <StatCard
            titulo="Promedio Diario"
            valor={kpis.promedio}
            color="#0ea5e9"
            icon={<TrendingUp size={20} />}
          />
          {kpis.pico != null && (
            <StatCard
              titulo="Pico Máximo"
              valor={kpis.pico}
              color="#f59e0b"
              icon={<Zap size={20} />}
            />
          )}
          {datosYoY && yoyActivo && (
            <StatCard
              titulo="Variación YoY"
              valor={`${datosYoY.kpis.variacionYoY > 0 ? '+' : ''}${datosYoY.kpis.variacionYoY.toFixed(1)}%`}
              porcentaje={Math.round(datosYoY.kpis.variacionYoY)}
              color="#8b5cf6"
              icon={<ArrowUpDown size={20} />}
            />
          )}
          {datosProyeccion?.proyeccion && (
            <StatCard
              titulo="Proyección Próx. Mes"
              valor={datosProyeccion.proyeccion.valor}
              subtitulo={`Tendencia: ${datosProyeccion.proyeccion.tendencia > 0 ? '+' : ''}${datosProyeccion.proyeccion.tendencia.toFixed(2)}`}
              color="#10b981"
              icon={<TrendingUp size={20} />}
            />
          )}
        </div>
      )}

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico según escala temporal */}
        {escalaTemporal === 'semanal' && datosSemanales && (
          <ChartContainer titulo="Comparativa Semanal (Actual vs. Anterior)">
            <BarChartComparativo
              datos={datosSemanales.datosGrafico}
              colorAnterior="#94a3b8"
              colorActual="#6366f1"
              height={320}
            />
          </ChartContainer>
        )}

        {escalaTemporal === 'mensual' && datosMensuales && (
          <ChartContainer titulo={`Actividad Diaria — ${datosMensuales.mesLabel}`}>
            <AreaChartComponent
              datos={datosMensuales.datosGrafico.map(d => ({
                nombre: d.nombre,
                valor: d.valor,
              }))}
              areas={[{ key: 'valor', nombre: 'Total Diario', color: '#6366f1' }]}
              height={320}
            />
          </ChartContainer>
        )}

        {escalaTemporal === 'anual' && datosAnuales && (
          <ChartContainer titulo={`Tendencia Anual — ${datosAnuales.anio}`}>
            <LineChartComponent
              datos={datosAnuales.datosGrafico.map(d => ({
                nombre: d.nombre,
                promedio: d.promedio,
                pico: d.pico,
              }))}
              lineas={[
                { key: 'promedio', nombre: 'Promedio', color: '#6366f1' },
                { key: 'pico', nombre: 'Pico', color: '#f59e0b' },
              ]}
              height={320}
            />
          </ChartContainer>
        )}

        {/* Distribución por departamento */}
        {distribucion.length > 0 && (
          <ChartContainer titulo="Distribución por Departamento">
            <PieChartComponent datos={distribucion} height={320} />
          </ChartContainer>
        )}
      </div>

      {/* YoY Chart */}
      {yoyActivo && datosYoY && (
        <ChartContainer titulo={`Comparativa Interanual: ${datosYoY.anioActual} vs ${datosYoY.anioAnterior}`}>
          <LineChartComponent
            datos={datosYoY.datosGrafico}
            lineas={[
              { key: `${datosYoY.anioActual}`, nombre: `${datosYoY.anioActual}`, color: '#6366f1' },
              { key: `${datosYoY.anioAnterior}`, nombre: `${datosYoY.anioAnterior}`, color: '#94a3b8' },
            ]}
            height={350}
          />
        </ChartContainer>
      )}

      {/* Proyección */}
      {datosProyeccion && datosProyeccion.datosGrafico.length > 0 && (
        <div className="space-y-2">
          <ChartContainer titulo="Análisis Predictivo">
            <TrendChart
              datos={datosProyeccion.datosGrafico}
              height={350}
            />
          </ChartContainer>
          <div className="flex items-center gap-2 px-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
              <TrendingUp size={12} />
              Proyección basada en {datosProyeccion.mesesUsados} meses de datos
            </span>
            <span className="text-xs text-gray-400">
              Método: regresión lineal simple
            </span>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!isPending && !kpis && (
        <div className="card p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            Sin datos estadísticos
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Las estadísticas se generan automáticamente cuando se editan datos comparativos.
            También puede ejecutar un recálculo manual desde la configuración de administrador.
          </p>
        </div>
      )}
    </div>
  );
}
