'use server';

import type { DB } from '@/db';
import {
  estadisticasDiarias,
  estadisticasMensuales,
  estadisticasAnuales,
  departamentos,
  tablasConfig,
} from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import {
  filtrosEstadisticasSchema,
  proyeccionSchema,
  parseOrThrow,
} from '@/lib/action-schemas';
import { proyectarSiguiente } from '@/lib/estadisticas-utils';

interface FiltrosEstadisticas {
  escala: 'semanal' | 'mensual' | 'anual';
  departamentoId?: string;
  tablaConfigId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

// ============================================
// ESTADÍSTICAS SEMANALES
// ============================================

export async function obtenerEstadisticasSemanalesWithDb(
  database: DB,
  filtros: FiltrosEstadisticas
) {
  const parsed = parseOrThrow(filtrosEstadisticasSchema, filtros);

  const ahora = new Date();
  const inicioSemanaActual = new Date(ahora);
  inicioSemanaActual.setDate(ahora.getDate() - ahora.getDay() + 1); // Lunes
  inicioSemanaActual.setHours(0, 0, 0, 0);

  const inicioSemanaAnterior = new Date(inicioSemanaActual);
  inicioSemanaAnterior.setDate(inicioSemanaAnterior.getDate() - 7);

  const finSemanaActual = new Date(inicioSemanaActual);
  finSemanaActual.setDate(finSemanaActual.getDate() + 6);
  finSemanaActual.setHours(23, 59, 59, 999);

  const conditions = [
    gte(estadisticasDiarias.fecha, inicioSemanaAnterior),
    lte(estadisticasDiarias.fecha, finSemanaActual),
  ];

  if (parsed.departamentoId) {
    conditions.push(eq(estadisticasDiarias.departamentoId, parsed.departamentoId));
  }
  if (parsed.tablaConfigId) {
    conditions.push(eq(estadisticasDiarias.tablaConfigId, parsed.tablaConfigId));
  }

  const filas = await database
    .select()
    .from(estadisticasDiarias)
    .where(and(...conditions))
    .orderBy(estadisticasDiarias.fecha);

  // Separar semana actual vs anterior
  const semanaAnterior = filas.filter(
    f => f.fecha < inicioSemanaActual
  );
  const semanaActual = filas.filter(
    f => f.fecha >= inicioSemanaActual
  );

  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Agrupar por día de la semana
  const datosGrafico = diasSemana.map((dia, i) => {
    const diaActual = semanaActual.filter(f => {
      const d = new Date(f.fecha);
      return ((d.getDay() + 6) % 7) === i; // Lun=0
    });
    const diaAnterior = semanaAnterior.filter(f => {
      const d = new Date(f.fecha);
      return ((d.getDay() + 6) % 7) === i;
    });

    return {
      nombre: dia,
      actual: diaActual.reduce((a, f) => a + parseFloat(f.totalPeriodoActual), 0),
      anterior: diaAnterior.reduce((a, f) => a + parseFloat(f.totalPeriodoActual), 0),
    };
  });

  const totalActual = semanaActual.reduce(
    (a, f) => a + parseFloat(f.totalPeriodoActual), 0
  );
  const totalAnterior = semanaAnterior.reduce(
    (a, f) => a + parseFloat(f.totalPeriodoActual), 0
  );
  const promedioDiario = semanaActual.length > 0
    ? totalActual / semanaActual.length
    : 0;
  const picoMaximo = semanaActual.length > 0
    ? Math.max(...semanaActual.map(f => parseFloat(f.totalPeriodoActual)))
    : 0;

  return {
    datosGrafico,
    kpis: {
      totalActual,
      totalAnterior,
      promedioDiario,
      picoMaximo,
      porcentajeCambio: totalAnterior > 0
        ? ((totalActual - totalAnterior) / totalAnterior) * 100
        : totalActual > 0 ? 100 : 0,
    },
  };
}

// ============================================
// ESTADÍSTICAS MENSUALES
// ============================================

export async function obtenerEstadisticasMensualesWithDb(
  database: DB,
  filtros: FiltrosEstadisticas
) {
  const parsed = parseOrThrow(filtrosEstadisticasSchema, filtros);

  const ahora = parsed.fechaDesde ?? new Date();
  const mes = ahora.getMonth() + 1;
  const anio = ahora.getFullYear();

  const fechaDesde = new Date(anio, mes - 1, 1);
  const fechaHasta = new Date(anio, mes, 0, 23, 59, 59);

  const conditions = [
    gte(estadisticasDiarias.fecha, fechaDesde),
    lte(estadisticasDiarias.fecha, fechaHasta),
  ];

  if (parsed.departamentoId) {
    conditions.push(eq(estadisticasDiarias.departamentoId, parsed.departamentoId));
  }
  if (parsed.tablaConfigId) {
    conditions.push(eq(estadisticasDiarias.tablaConfigId, parsed.tablaConfigId));
  }

  const filas = await database
    .select()
    .from(estadisticasDiarias)
    .where(and(...conditions))
    .orderBy(estadisticasDiarias.fecha);

  // Agrupar por día del mes
  const diasEnMes = new Date(anio, mes, 0).getDate();
  const datosGrafico = Array.from({ length: diasEnMes }, (_, i) => {
    const dia = i + 1;
    const filasDelDia = filas.filter(f => {
      const d = new Date(f.fecha);
      return d.getDate() === dia;
    });

    return {
      nombre: `${dia}`,
      valor: filasDelDia.reduce((a, f) => a + parseFloat(f.totalPeriodoActual), 0),
    };
  });

  const valores = datosGrafico.map(d => d.valor).filter(v => v > 0);
  const totalMes = valores.reduce((a, b) => a + b, 0);
  const promedioDiario = valores.length > 0 ? totalMes / valores.length : 0;
  const picoMaximo = valores.length > 0 ? Math.max(...valores) : 0;
  const picoMinimo = valores.length > 0 ? Math.min(...valores) : 0;

  return {
    datosGrafico,
    kpis: {
      totalMes,
      promedioDiario,
      picoMaximo,
      picoMinimo,
      diasConDatos: valores.length,
    },
    mesLabel: new Date(anio, mes - 1).toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric',
    }),
  };
}

// ============================================
// ESTADÍSTICAS ANUALES
// ============================================

export async function obtenerEstadisticasAnualesWithDb(
  database: DB,
  filtros: FiltrosEstadisticas
) {
  const parsed = parseOrThrow(filtrosEstadisticasSchema, filtros);

  const anio = parsed.fechaDesde
    ? parsed.fechaDesde.getFullYear()
    : new Date().getFullYear();

  const conditions = [eq(estadisticasMensuales.anio, anio)];

  if (parsed.departamentoId) {
    conditions.push(eq(estadisticasMensuales.departamentoId, parsed.departamentoId));
  }
  if (parsed.tablaConfigId) {
    conditions.push(eq(estadisticasMensuales.tablaConfigId, parsed.tablaConfigId));
  }

  const filas = await database
    .select()
    .from(estadisticasMensuales)
    .where(and(...conditions))
    .orderBy(estadisticasMensuales.mes);

  const mesesLabels = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];

  const datosGrafico = mesesLabels.map((label, i) => {
    const mes = i + 1;
    const filasDelMes = filas.filter(f => f.mes === mes);
    return {
      nombre: label,
      promedio: filasDelMes.reduce((a, f) => a + parseFloat(f.promedioDiario), 0),
      pico: filasDelMes.reduce(
        (a, f) => Math.max(a, parseFloat(f.picoMaximo)), 0
      ),
    };
  });

  // Obtener resumen anual
  const [resumenAnual] = await database
    .select()
    .from(estadisticasAnuales)
    .where(
      and(
        eq(estadisticasAnuales.anio, anio),
        ...(parsed.departamentoId
          ? [eq(estadisticasAnuales.departamentoId, parsed.departamentoId)]
          : []),
        ...(parsed.tablaConfigId
          ? [eq(estadisticasAnuales.tablaConfigId, parsed.tablaConfigId)]
          : [])
      )
    )
    .limit(1);

  return {
    datosGrafico,
    kpis: {
      totalAnual: parseFloat(resumenAnual?.totalAnualActual ?? '0'),
      promedioMensual: parseFloat(resumenAnual?.promedioMensual ?? '0'),
      tendencia: parseFloat(resumenAnual?.tendencia ?? '0'),
    },
    anio,
  };
}

// ============================================
// COMPARATIVA INTERANUAL (YoY)
// ============================================

export async function obtenerComparativaYoYWithDb(
  database: DB,
  filtros: FiltrosEstadisticas
) {
  const parsed = parseOrThrow(filtrosEstadisticasSchema, filtros);

  const anioActual = parsed.fechaDesde
    ? parsed.fechaDesde.getFullYear()
    : new Date().getFullYear();
  const anioAnterior = anioActual - 1;

  const buildConditions = (anio: number) => {
    const conds = [eq(estadisticasMensuales.anio, anio)];
    if (parsed.departamentoId) {
      conds.push(eq(estadisticasMensuales.departamentoId, parsed.departamentoId));
    }
    if (parsed.tablaConfigId) {
      conds.push(eq(estadisticasMensuales.tablaConfigId, parsed.tablaConfigId));
    }
    return conds;
  };

  const [filasActual, filasAnterior] = await Promise.all([
    database
      .select()
      .from(estadisticasMensuales)
      .where(and(...buildConditions(anioActual)))
      .orderBy(estadisticasMensuales.mes),
    database
      .select()
      .from(estadisticasMensuales)
      .where(and(...buildConditions(anioAnterior)))
      .orderBy(estadisticasMensuales.mes),
  ]);

  const mesesLabels = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];

  const datosGrafico = mesesLabels.map((label, i) => {
    const mes = i + 1;
    const actual = filasActual
      .filter(f => f.mes === mes)
      .reduce((a, f) => a + parseFloat(f.promedioDiario), 0);
    const anterior = filasAnterior
      .filter(f => f.mes === mes)
      .reduce((a, f) => a + parseFloat(f.promedioDiario), 0);

    return {
      nombre: label,
      [`${anioActual}`]: actual,
      [`${anioAnterior}`]: anterior,
    };
  });

  const totalActual = filasActual.reduce(
    (a, f) => a + parseFloat(f.promedioDiario), 0
  );
  const totalAnterior = filasAnterior.reduce(
    (a, f) => a + parseFloat(f.promedioDiario), 0
  );

  return {
    datosGrafico,
    anioActual,
    anioAnterior,
    kpis: {
      totalActual,
      totalAnterior,
      variacionYoY: totalAnterior > 0
        ? ((totalActual - totalAnterior) / totalAnterior) * 100
        : 0,
    },
  };
}

// ============================================
// PROYECCIÓN
// ============================================

export async function obtenerProyeccionWithDb(
  database: DB,
  input: { departamentoId?: string; tablaConfigId?: string; mesesHistoricos?: number }
) {
  const parsed = parseOrThrow(proyeccionSchema, input);

  const conditions = [];
  if (parsed.departamentoId) {
    conditions.push(eq(estadisticasMensuales.departamentoId, parsed.departamentoId));
  }
  if (parsed.tablaConfigId) {
    conditions.push(eq(estadisticasMensuales.tablaConfigId, parsed.tablaConfigId));
  }

  const filas = await database
    .select()
    .from(estadisticasMensuales)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(estadisticasMensuales.anio), desc(estadisticasMensuales.mes))
    .limit(parsed.mesesHistoricos);

  // Revertir para tener en orden cronológico
  const filasOrdenadas = filas.reverse();

  if (filasOrdenadas.length < 2) {
    return { datosGrafico: [], proyeccion: null, mesesUsados: 0 };
  }

  // Construir puntos para regresión
  const puntos = filasOrdenadas.map((f, i) => ({
    x: i + 1,
    y: parseFloat(f.promedioDiario),
  }));

  const resultado = proyectarSiguiente(puntos);

  const mesesLabels = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];

  const datosGrafico: Array<{ nombre: string; valor: number; tipo: 'historico' | 'proyeccion' }> = filasOrdenadas.map(f => ({
    nombre: `${mesesLabels[f.mes - 1]} ${f.anio}`,
    valor: parseFloat(f.promedioDiario),
    tipo: 'historico' as const,
  }));

  // Agregar punto proyectado
  const ultimaFila = filasOrdenadas[filasOrdenadas.length - 1];
  const siguienteMes = ultimaFila.mes === 12 ? 1 : ultimaFila.mes + 1;
  const siguienteAnio = ultimaFila.mes === 12
    ? ultimaFila.anio + 1
    : ultimaFila.anio;

  datosGrafico.push({
    nombre: `${mesesLabels[siguienteMes - 1]} ${siguienteAnio} (proy.)`,
    valor: Math.max(0, resultado.valor),
    tipo: 'proyeccion' as const,
  });

  return {
    datosGrafico,
    proyeccion: {
      valor: Math.max(0, resultado.valor),
      tendencia: resultado.tendencia,
      mes: siguienteMes,
      anio: siguienteAnio,
    },
    mesesUsados: filasOrdenadas.length,
  };
}

// ============================================
// DISTRIBUCIÓN POR DEPARTAMENTO
// ============================================

export async function obtenerDistribucionDepartamentosWithDb(database: DB) {
  const depts = await database
    .select()
    .from(departamentos)
    .orderBy(departamentos.orden);

  const distribucion = await Promise.all(
    depts.map(async dept => {
      const tablas = await database
        .select({ id: tablasConfig.id })
        .from(tablasConfig)
        .where(eq(tablasConfig.departamentoId, dept.id));

      // Obtener último dato diario de cada tabla
      let total = 0;
      for (const tabla of tablas) {
        const [ultimo] = await database
          .select()
          .from(estadisticasDiarias)
          .where(eq(estadisticasDiarias.tablaConfigId, tabla.id))
          .orderBy(desc(estadisticasDiarias.fecha))
          .limit(1);
        if (ultimo) {
          total += parseFloat(ultimo.totalPeriodoActual);
        }
      }

      return {
        nombre: dept.nombre,
        valor: total,
        color: dept.color,
      };
    })
  );

  return distribucion.filter(d => d.valor > 0);
}

// ============================================
// OBTENER DEPARTAMENTOS Y TABLAS (para filtros)
// ============================================

export async function obtenerOpcionesFiltros(database: DB) {
  const depts = await database
    .select({
      id: departamentos.id,
      nombre: departamentos.nombre,
      codigo: departamentos.codigo,
    })
    .from(departamentos)
    .orderBy(departamentos.orden);

  const tablas = await database
    .select({
      id: tablasConfig.id,
      nombre: tablasConfig.nombre,
      departamentoId: tablasConfig.departamentoId,
    })
    .from(tablasConfig)
    .orderBy(tablasConfig.orden);

  return { departamentos: depts, tablas };
}

// ============================================
// WRAPPERS PÚBLICOS (con deps inyectadas)
// ============================================

async function getDb() {
  const { db } = await import('@/db');
  return db;
}

export async function obtenerEstadisticasSemanales(filtros: FiltrosEstadisticas) {
  return obtenerEstadisticasSemanalesWithDb(await getDb(), filtros);
}

export async function obtenerEstadisticasMensuales(filtros: FiltrosEstadisticas) {
  return obtenerEstadisticasMensualesWithDb(await getDb(), filtros);
}

export async function obtenerEstadisticasAnuales(filtros: FiltrosEstadisticas) {
  return obtenerEstadisticasAnualesWithDb(await getDb(), filtros);
}

export async function obtenerComparativaYoY(filtros: FiltrosEstadisticas) {
  return obtenerComparativaYoYWithDb(await getDb(), filtros);
}

export async function obtenerProyeccion(
  input: { departamentoId?: string; tablaConfigId?: string; mesesHistoricos?: number }
) {
  return obtenerProyeccionWithDb(await getDb(), input);
}

export async function obtenerDistribucionDepartamentos() {
  return obtenerDistribucionDepartamentosWithDb(await getDb());
}

export async function obtenerFiltros() {
  return obtenerOpcionesFiltros(await getDb());
}
