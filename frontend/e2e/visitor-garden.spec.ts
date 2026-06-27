import { test, expect } from '@playwright/test'

test.describe('Jardim modo visitante', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('wg-tutorial-seen', '1')
    })
    await page.goto('/garden?visitor=true')
    await page.waitForLoadState('networkidle')
  })

  test('exibe os 6 vasos vazios', async ({ page }) => {
    const body = await page.locator('body').textContent()
    expect(body).toContain('VASO 1')
    expect(body).toContain('VASO 6')
  })

  test('exibe aviso de modo visitante', async ({ page }) => {
    const body = await page.locator('body').textContent()
    expect(body?.toLowerCase()).toContain('modo visitante')
  })

  test('exibe link da estufa no header', async ({ page }) => {
    const body = await page.locator('body').textContent()
    expect(body).toContain('Estufa')
  })

  test('planta uma tarefa via formulario', async ({ page }) => {
    await page.click('button:has-text("PLANTAR")', { timeout: 10000 })
    await page.waitForSelector('input[placeholder="nome..."]', { timeout: 5000 })
    await page.fill('input[placeholder="nome..."]', 'Missao do jardim')
    await page.keyboard.press('Enter')
    const body = await page.locator('body').textContent()
    expect(body).toContain('Missao do ja')
  })
})
