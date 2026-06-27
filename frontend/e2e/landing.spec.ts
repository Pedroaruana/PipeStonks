import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('exibe titulo WASTELAND GARDEN', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const body = await page.locator('body').textContent()
    expect(body).toContain('WASTELAND')
    expect(body).toContain('GARDEN')
  })

  test('tem botao jogar e links de auth', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const body = await page.locator('body').textContent()
    expect(body).toContain('JOGAR')
    expect(body).toContain('CRIAR CONTA')
    expect(body).toContain('ENTRAR')
  })

  test('botao JOGAR AGORA leva ao jardim visitante', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("JOGAR AGORA")')
    await expect(page).toHaveURL(/visitor=true/)
  })
})
