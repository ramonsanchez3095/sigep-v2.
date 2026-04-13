import {
  pgTable,
  uuid,
  varchar,
  boolean,
  integer,
  timestamp,
  decimal,
  json,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================
export const rolEnum = pgEnum('rol', ['ADMIN', 'EDITOR', 'VIEWER']);
export const campoEnum = pgEnum('campo', [
  'PERIODO_ANTERIOR',
  'PERIODO_ACTUAL',
]);

// ============================================
// USUARIOS Y AUTENTICACIÓN
// ============================================
export const usuarios = pgTable('usuarios', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  rol: rolEnum('rol').default('EDITOR').notNull(),
  color: varchar('color', { length: 20 }).default('#1e3a5f').notNull(),
  activo: boolean('activo').default(true).notNull(),
  totpSecret: varchar('totp_secret', { length: 500 }),
  totpEnabled: boolean('totp_enabled').default(false).notNull(),
  departamentoId: uuid('departamento_id').references(() => departamentos.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const permisos = pgTable(
  'permisos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tipo: varchar('tipo', { length: 50 }).notNull(),
    usuarioId: uuid('usuario_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  t => [unique().on(t.usuarioId, t.tipo)]
);

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usuarioId: uuid('usuario_id')
    .notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// DEPARTAMENTOS Y TABLAS
// ============================================
export const departamentos = pgTable('departamentos', {
  id: uuid('id').defaultRandom().primaryKey(),
  codigo: varchar('codigo', { length: 50 }).notNull().unique(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  color: varchar('color', { length: 20 }).default('#1e3a5f').notNull(),
  orden: integer('orden').default(0).notNull(),
  activo: boolean('activo').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tablasConfig = pgTable('tablas_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  tablaId: varchar('tabla_id', { length: 255 }).notNull().unique(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  orden: integer('orden').default(0).notNull(),
  activo: boolean('activo').default(true).notNull(),
  departamentoId: uuid('departamento_id')
    .notNull()
    .references(() => departamentos.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const datosComparativos = pgTable(
  'datos_comparativos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    filaId: varchar('fila_id', { length: 255 }).notNull(),
    label: varchar('label', { length: 500 }).notNull(),
    periodoAnterior: decimal('periodo_anterior', {
      precision: 15,
      scale: 2,
    })
      .default('0')
      .notNull(),
    periodoActual: decimal('periodo_actual', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    editable: boolean('editable').default(true).notNull(),
    orden: integer('orden').default(0).notNull(),
    tablaConfigId: uuid('tabla_config_id')
      .notNull()
      .references(() => tablasConfig.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  t => [unique().on(t.tablaConfigId, t.filaId)]
);

// ============================================
// HISTORIAL Y AUDITORÍA
// ============================================
export const historialCambios = pgTable('historial_cambios', {
  id: uuid('id').defaultRandom().primaryKey(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  campo: campoEnum('campo').notNull(),
  valorAnterior: decimal('valor_anterior', {
    precision: 15,
    scale: 2,
  }).notNull(),
  valorNuevo: decimal('valor_nuevo', { precision: 15, scale: 2 }).notNull(),
  filaId: varchar('fila_id', { length: 255 }).notNull(),
  filaLabel: varchar('fila_label', { length: 500 }).notNull(),
  usuarioId: uuid('usuario_id')
    .notNull()
    .references(() => usuarios.id),
  tablaConfigId: uuid('tabla_config_id')
    .notNull()
    .references(() => tablasConfig.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// SNAPSHOTS MENSUALES
// ============================================
export const snapshots = pgTable(
  'snapshots',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    mes: integer('mes').notNull(),
    anio: integer('anio').notNull(),
    datos: json('datos').notNull(),
    fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
    creadoPorId: uuid('creado_por_id')
      .notNull()
      .references(() => usuarios.id),
  },
  t => [unique().on(t.mes, t.anio)]
);

// ============================================
// CONFIGURACIÓN
// ============================================
export const configPeriodos = pgTable('config_periodos', {
  id: uuid('id').defaultRandom().primaryKey(),
  anteriorInicio: timestamp('anterior_inicio').notNull(),
  anteriorFin: timestamp('anterior_fin').notNull(),
  anteriorLabel: varchar('anterior_label', { length: 100 }).notNull(),
  actualInicio: timestamp('actual_inicio').notNull(),
  actualFin: timestamp('actual_fin').notNull(),
  actualLabel: varchar('actual_label', { length: 100 }).notNull(),
  activo: boolean('activo').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const configGlobal = pgTable('config_global', {
  id: uuid('id').defaultRandom().primaryKey(),
  edicionHabilitada: boolean('edicion_habilitada').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: varchar('updated_by', { length: 255 }),
});

// ============================================
// RELATIONS
// ============================================
export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  departamento: one(departamentos, {
    fields: [usuarios.departamentoId],
    references: [departamentos.id],
  }),
  permisos: many(permisos),
  historial: many(historialCambios),
  snapshots: many(snapshots),
  refreshTokens: many(refreshTokens),
}));

export const permisosRelations = relations(permisos, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [permisos.usuarioId],
    references: [usuarios.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [refreshTokens.usuarioId],
    references: [usuarios.id],
  }),
}));

export const departamentosRelations = relations(departamentos, ({ many }) => ({
  usuarios: many(usuarios),
  tablas: many(tablasConfig),
}));

export const tablasConfigRelations = relations(
  tablasConfig,
  ({ one, many }) => ({
    departamento: one(departamentos, {
      fields: [tablasConfig.departamentoId],
      references: [departamentos.id],
    }),
    datos: many(datosComparativos),
    historial: many(historialCambios),
  })
);

export const datosComparativosRelations = relations(
  datosComparativos,
  ({ one }) => ({
    tablaConfig: one(tablasConfig, {
      fields: [datosComparativos.tablaConfigId],
      references: [tablasConfig.id],
    }),
  })
);

export const historialCambiosRelations = relations(
  historialCambios,
  ({ one }) => ({
    usuario: one(usuarios, {
      fields: [historialCambios.usuarioId],
      references: [usuarios.id],
    }),
    tablaConfig: one(tablasConfig, {
      fields: [historialCambios.tablaConfigId],
      references: [tablasConfig.id],
    }),
  })
);

export const snapshotsRelations = relations(snapshots, ({ one }) => ({
  creadoPor: one(usuarios, {
    fields: [snapshots.creadoPorId],
    references: [usuarios.id],
  }),
}));

// ============================================
// ESTADÍSTICAS PRE-AGREGADAS
// ============================================
export const estadisticasDiarias = pgTable(
  'estadisticas_diarias',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    departamentoId: uuid('departamento_id')
      .notNull()
      .references(() => departamentos.id),
    tablaConfigId: uuid('tabla_config_id')
      .notNull()
      .references(() => tablasConfig.id, { onDelete: 'cascade' }),
    fecha: timestamp('fecha').notNull(),
    totalPeriodoAnterior: decimal('total_periodo_anterior', {
      precision: 15,
      scale: 2,
    })
      .default('0')
      .notNull(),
    totalPeriodoActual: decimal('total_periodo_actual', {
      precision: 15,
      scale: 2,
    })
      .default('0')
      .notNull(),
    cantidadCambios: integer('cantidad_cambios').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  t => [unique().on(t.tablaConfigId, t.fecha)]
);

export const estadisticasMensuales = pgTable(
  'estadisticas_mensuales',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    departamentoId: uuid('departamento_id')
      .notNull()
      .references(() => departamentos.id),
    tablaConfigId: uuid('tabla_config_id')
      .notNull()
      .references(() => tablasConfig.id, { onDelete: 'cascade' }),
    mes: integer('mes').notNull(),
    anio: integer('anio').notNull(),
    promedioDiario: decimal('promedio_diario', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    picoMaximo: decimal('pico_maximo', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    picoMinimo: decimal('pico_minimo', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    totalCambios: integer('total_cambios').default(0).notNull(),
    snapshotData: json('snapshot_data'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  t => [unique().on(t.tablaConfigId, t.mes, t.anio)]
);

export const estadisticasAnuales = pgTable(
  'estadisticas_anuales',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    departamentoId: uuid('departamento_id')
      .notNull()
      .references(() => departamentos.id),
    tablaConfigId: uuid('tabla_config_id')
      .notNull()
      .references(() => tablasConfig.id, { onDelete: 'cascade' }),
    anio: integer('anio').notNull(),
    totalAnualAnterior: decimal('total_anual_anterior', {
      precision: 15,
      scale: 2,
    })
      .default('0')
      .notNull(),
    totalAnualActual: decimal('total_anual_actual', {
      precision: 15,
      scale: 2,
    })
      .default('0')
      .notNull(),
    promedioMensual: decimal('promedio_mensual', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    tendencia: decimal('tendencia', { precision: 15, scale: 6 })
      .default('0')
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  t => [unique().on(t.tablaConfigId, t.anio)]
);

// Relations para estadísticas
export const estadisticasDiariasRelations = relations(
  estadisticasDiarias,
  ({ one }) => ({
    departamento: one(departamentos, {
      fields: [estadisticasDiarias.departamentoId],
      references: [departamentos.id],
    }),
    tablaConfig: one(tablasConfig, {
      fields: [estadisticasDiarias.tablaConfigId],
      references: [tablasConfig.id],
    }),
  })
);

export const estadisticasMensualesRelations = relations(
  estadisticasMensuales,
  ({ one }) => ({
    departamento: one(departamentos, {
      fields: [estadisticasMensuales.departamentoId],
      references: [departamentos.id],
    }),
    tablaConfig: one(tablasConfig, {
      fields: [estadisticasMensuales.tablaConfigId],
      references: [tablasConfig.id],
    }),
  })
);

export const estadisticasAnualesRelations = relations(
  estadisticasAnuales,
  ({ one }) => ({
    departamento: one(departamentos, {
      fields: [estadisticasAnuales.departamentoId],
      references: [departamentos.id],
    }),
    tablaConfig: one(tablasConfig, {
      fields: [estadisticasAnuales.tablaConfigId],
      references: [tablasConfig.id],
    }),
  })
);
