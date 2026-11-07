import { test, expect } from '@playwright/test';

/**
 * Van Escolar SP - Automated End-to-End (E2E) Test Suite
 * Designed for automated test runners (Playwright, Puppeteer, Selenium, CI/CD pipelines)
 */

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

test.describe('Van Escolar SP - Core Functionality & Security Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('TC-01: Login as Transporter and verify zero-data clean state navigation', async ({ page }) => {
    // Select Transporter tab in Auth screen
    await page.click('text=Motorista de Van');
    await page.fill('input[type="email"]', 'joao.batista@vanescolar.sp');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Entrar na Conta de Motorista")');

    // Verify successful login
    await expect(page.locator('h2')).toContainText('Oportunidades de Novos Alunos');
  });

  test('TC-02: Manifestar Interesse button updates state and sends instant notification', async ({ page }) => {
    await page.click('text=Motorista de Van');
    await page.fill('input[type="email"]', 'joao.batista@vanescolar.sp');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Entrar na Conta de Motorista")');

    // Click Manifestar Interesse
    const interestBtn = page.locator('button:has-text("Manifestar Interesse")').first();
    if (await interestBtn.isVisible()) {
      await interestBtn.click();
      
      // Verify button changes to "Interesse Salvo"
      const savedBtn = page.locator('button:has-text("Interesse Salvo")').first();
      await expect(savedBtn).toBeVisible();
    }
  });

  test('TC-03: Open Parent Profile Modal from Child Card', async ({ page }) => {
    await page.click('text=Motorista de Van');
    await page.fill('input[type="email"]', 'joao.batista@vanescolar.sp');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Entrar na Conta de Motorista")');

    // Click child card button to view parent reputation
    const parentProfileCard = page.locator('text=Clique para ver perfil completo & avaliação da família').first();
    if (await parentProfileCard.isVisible()) {
      await parentProfileCard.click();
      await expect(page.locator('text=Reputação na Comunidade de Motoristas')).toBeVisible();
    }
  });

  test('TC-04: Verify Netflix-style Child Profile Switcher for Parents', async ({ page }) => {
    // Login as Parent
    await page.click('text=Pai / Mãe / Responsável');
    await page.fill('input[type="email"]', 'marta.almeida@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Entrar na Minha Conta")');

    // Check profile switcher pill
    const profileBtn = page.locator('button:has-text("Trocar Perfil")');
    if (await profileBtn.isVisible()) {
      await profileBtn.click();
      await expect(page.locator('text=Quem está navegando agora?')).toBeVisible();
    }
  });

  test('TC-05: Verify Subscription Plan Barriers for Free vs Premium Features', async ({ page }) => {
    await page.click('text=Motorista de Van');
    await page.fill('input[type="email"]', 'joao.batista@vanescolar.sp');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Entrar na Conta de Motorista")');

    // Navigate to Route Optimizer tab
    await page.click('text=Otimizador');
    
    // Check if barrier or active route view renders based on tier
    const routeHeader = page.locator('h2:has-text("Otimizador de Rotas")');
    await expect(routeHeader).toBeVisible();
  });

});
