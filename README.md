This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing

Comandos principales:

```bash
npm run test:unit
npm run test:integration
npm run e2e:doctor
npm run e2e:seed:recovery
npm run test:e2e:smoke
```

Guía de recuperación local y endurecimiento del entorno E2E:

- Ver [docs/e2e-recovery.md](docs/e2e-recovery.md)

## Operación

Migraciones de base de datos:

```bash
npx drizzle-kit migrate
```

Sincronizacion no destructiva de D1:

```bash
npm run d1:sync
```

- Completa la estructura avanzada de D1 en `tablas_config` y `datos_comparativos`.
- Conserva los valores existentes cuando encuentra filas legacy equivalentes.
- No elimina filas antiguas; las deja preservadas para auditoria o recuperacion.

Seed completo de datos iniciales:

```bash
npm run db:seed
```

Rollup programado de estadísticas:

- El endpoint es `/api/cron/estadisticas`.
- Requiere el header `Authorization: Bearer <CRON_SECRET>`.
- En Vercel, [vercel.json](vercel.json) programa una ejecución diaria a las `03:00 UTC`.
- Para producción, definir `CRON_SECRET` en las variables de entorno del proyecto desplegado con el mismo valor usado por el cron.
