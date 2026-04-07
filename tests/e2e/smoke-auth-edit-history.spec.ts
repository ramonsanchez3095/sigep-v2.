import { expect, test } from '@playwright/test';

const adminUsername = process.env.E2E_ADMIN_USERNAME;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const departamentoPath = process.env.E2E_DEPARTAMENTO_PATH ?? '/d1';
const shouldRun = Boolean(adminUsername && adminPassword);

test.describe('smoke auth -> edit -> history', () => {
  test.skip(!shouldRun, 'Definir E2E_ADMIN_USERNAME y E2E_ADMIN_PASSWORD para ejecutar el smoke.');

  test('admin puede iniciar sesion, editar y ver historial', async ({ page }) => {
    test.setTimeout(90_000);

    const valorAnterior = '8765';
    const valorActual = '9876';
    const valorActualFormateado = new Intl.NumberFormat('es-AR').format(
      Number(valorActual)
    );

    await page.goto('/login');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    await expect(page.getByText('SIGEP')).toBeVisible();
    await page.getByPlaceholder('Ingrese su usuario').fill(adminUsername!);
    await page.getByPlaceholder('Ingrese su contraseña').fill(adminPassword!);
    await page.getByRole('button', { name: 'Ingresar al Sistema' }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    await expect(page.getByText('Dashboard General')).toBeVisible();

    await page.goto(departamentoPath);
    const toggleEdicion = page.locator(
      'button[title="Habilitar edición"], button[title="Desactivar edición"]'
    );
    await expect(toggleEdicion.first()).toBeVisible({ timeout: 30_000 });

    if ((await toggleEdicion.first().getAttribute('title')) === 'Habilitar edición') {
      await toggleEdicion.first().click();
    }

    await expect(page.locator('button[title="Editar"]').first()).toBeVisible({
      timeout: 30_000,
    });

    await page.locator('button[title="Editar"]').first().click();

    const inputs = page.locator('tbody tr').first().locator('input[type="number"]');
    await expect(inputs).toHaveCount(2);
    await inputs.nth(0).fill(valorAnterior);
    await inputs.nth(1).fill(valorActual);
    await page.locator('button[title="Guardar"]').first().click();

    await expect(page.locator('button[title="Editar"]').first()).toBeVisible();

    await page.goto('/historial');
    await expect(page.getByText('Historial de Cambios')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
    await expect(page.getByText(valorActualFormateado).first()).toBeVisible();
  });
});