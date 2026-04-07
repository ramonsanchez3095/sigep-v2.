# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke-auth-edit-history.spec.ts >> smoke auth -> edit -> history >> admin puede iniciar sesion, editar y ver historial
- Location: tests\e2e\smoke-auth-edit-history.spec.ts:11:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://127.0.0.1:3000/login", waiting until "load"

```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | const adminUsername = process.env.E2E_ADMIN_USERNAME;
  4  | const adminPassword = process.env.E2E_ADMIN_PASSWORD;
  5  | const departamentoPath = process.env.E2E_DEPARTAMENTO_PATH ?? '/d1';
  6  | const shouldRun = Boolean(adminUsername && adminPassword);
  7  | 
  8  | test.describe('smoke auth -> edit -> history', () => {
  9  |   test.skip(!shouldRun, 'Definir E2E_ADMIN_USERNAME y E2E_ADMIN_PASSWORD para ejecutar el smoke.');
  10 | 
  11 |   test('admin puede iniciar sesion, editar y ver historial', async ({ page }) => {
  12 |     test.setTimeout(90_000);
  13 | 
  14 |     const valorAnterior = '8765';
  15 |     const valorActual = '9876';
  16 |     const valorActualFormateado = new Intl.NumberFormat('es-AR').format(
  17 |       Number(valorActual)
  18 |     );
  19 | 
> 20 |     await page.goto('/login');
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  21 |     await expect(page.locator('body')).not.toContainText('Internal Server Error');
  22 |     await expect(page.getByText('SIGEP')).toBeVisible();
  23 |     await page.getByPlaceholder('Ingrese su usuario').fill(adminUsername!);
  24 |     await page.getByPlaceholder('Ingrese su contraseña').fill(adminPassword!);
  25 |     await page.getByRole('button', { name: 'Ingresar al Sistema' }).click();
  26 | 
  27 |     await expect(page).toHaveURL(/\/dashboard/);
  28 |     await expect(page.getByText('Dashboard General')).toBeVisible();
  29 | 
  30 |     await page.goto(departamentoPath);
  31 |     await expect(page.locator('button[title="Editar"]').first()).toBeVisible();
  32 | 
  33 |     const toggleEdicion = page.locator(
  34 |       'button[title="Habilitar edición"], button[title="Desactivar edición"]'
  35 |     );
  36 | 
  37 |     if ((await toggleEdicion.first().getAttribute('title')) === 'Habilitar edición') {
  38 |       await toggleEdicion.first().click();
  39 |     }
  40 | 
  41 |     await page.locator('button[title="Editar"]').first().click();
  42 | 
  43 |     const inputs = page.locator('tbody tr').first().locator('input[type="number"]');
  44 |     await expect(inputs).toHaveCount(2);
  45 |     await inputs.nth(0).fill(valorAnterior);
  46 |     await inputs.nth(1).fill(valorActual);
  47 |     await page.locator('button[title="Guardar"]').first().click();
  48 | 
  49 |     await expect(page.locator('button[title="Editar"]').first()).toBeVisible();
  50 | 
  51 |     await page.goto('/historial');
  52 |     await expect(page.getByText('Historial de Cambios')).toBeVisible();
  53 |     await expect(page.locator('tbody tr').first()).toBeVisible();
  54 |     await expect(page.getByText(valorActualFormateado).first()).toBeVisible();
  55 |   });
  56 | });
```