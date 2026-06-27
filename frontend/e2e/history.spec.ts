import { test, expect } from '@playwright/test'

test.describe('Estufa (History)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('wg-tutorial-seen', '1')
      // simula visitor store vazio para carregar history sem auth
      localStorage.setItem('wg-visitor', JSON.stringify({ state: { tasks: [] }, version: 0 }))
    })
  })

  test('pagina de history carrega com stats', async ({ page }) => {
    await page.goto('/history')
    await page.waitForLoadState('networkidle')
    const body = await page.locator('body').textContent()
    expect(body).toContain('ESTUFA')
    expect(body).toContain('COLHIDAS')
  })

  test('mostra contadores zerados sem plantas', async ({ page }) => {
    await page.goto('/history')
    await page.waitForLoadState('networkidle')
    const body = await page.locator('body').textContent()
    expect(body).toContain('O₂ GERADO')
    expect(body).toContain('DIAS CULTIVADOS')
  })

  test('tem link de volta pro jardim', async ({ page }) => {
    await page.goto('/history')
    await page.waitForLoadState('networkidle')
    const body = await page.locator('body').textContent()
    expect(body).toContain('JARDIM')
  })
})
