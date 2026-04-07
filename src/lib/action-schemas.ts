import { z } from 'zod';

const uuidMessage = 'Id inválido';
const numericPattern = /^-?\d+(?:\.\d{1,2})?$/;
const canonicalUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const trimmedString = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(max, `${label} excede el tamaño permitido`);

const canonicalUuidSchema = trimmedString('El identificador', 36).regex(
  canonicalUuidPattern,
  uuidMessage
);

const decimalInputSchema = z
  .union([z.string(), z.number()])
  .transform(value => (typeof value === 'number' ? value.toString() : value.trim()))
  .refine(value => value.length > 0, 'El valor es obligatorio')
  .refine(value => numericPattern.test(value), 'El valor debe ser numérico y con hasta 2 decimales')
  .refine(value => Number(value) >= 0, 'El valor no puede ser negativo');

export const loginActionSchema = z.object({
  username: trimmedString('El usuario', 255),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .max(255, 'La contraseña excede el tamaño permitido'),
});

export const departamentoCodigoSchema = trimmedString('El código de departamento', 50).regex(
  /^[a-z0-9_-]+$/i,
  'Código de departamento inválido'
);

export const guardarDatosComparativosSchema = z.object({
  tablaConfigId: canonicalUuidSchema,
  filas: z
    .array(
      z.object({
        filaId: trimmedString('El identificador de fila', 255),
        label: trimmedString('La etiqueta', 500),
        periodoAnterior: decimalInputSchema,
        periodoActual: decimalInputSchema,
      })
    )
    .min(1, 'Debe enviar al menos una fila para guardar'),
});

export const crearPeriodoSchema = z
  .object({
    periodoAnterior: trimmedString('El período anterior', 100),
    periodoActual: trimmedString('El período actual', 100),
  })
  .refine(data => data.periodoAnterior !== data.periodoActual, {
    message: 'Los períodos deben ser distintos',
    path: ['periodoActual'],
  });

export const activarPeriodoSchema = z.object({
  id: canonicalUuidSchema,
});

export const crearUsuarioSchema = z.object({
  username: trimmedString('El usuario', 255).regex(
    /^[a-zA-Z0-9._-]+$/,
    'El usuario solo puede contener letras, números, punto, guion y guion bajo'
  ),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(255, 'La contraseña excede el tamaño permitido'),
  nombre: trimmedString('El nombre', 255),
  rol: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
  departamentoId: z.preprocess(
    value => (value === '' || value == null ? undefined : value),
    canonicalUuidSchema.optional()
  ),
});

export const toggleUsuarioActivoSchema = z.object({
  id: canonicalUuidSchema,
  activo: z.boolean(),
});

export const totpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'El código debe ser de 6 dígitos numéricos');

export const verifyTotpLoginSchema = z.object({
  userId: canonicalUuidSchema,
  code: totpCodeSchema,
});

export const resetTotpSchema = z.object({
  id: canonicalUuidSchema,
});

export const historialLimitSchema = z
  .union([z.number(), z.string()])
  .transform(value => Number(value))
  .refine(value => Number.isInteger(value), 'El límite debe ser un entero')
  .refine(value => value >= 1 && value <= 200, 'El límite debe estar entre 1 y 200');

export function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? 'Datos inválidos');
  }

  return result.data;
}