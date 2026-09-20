import { test, expect } from '@playwright/test';

test('core commercial flows persist in browser', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/');
  await expect(page.getByText('VENDA.AI · V1.7.8 QA FUNCIONAL')).toBeVisible();

  await page.getByRole('button', { name: /Clientes/ }).first().click();
  await page.getByRole('button', { name: /Novo cliente/i }).click();
  await page.getByLabel('Nome do cliente').fill('Cliente QA');
  await page.getByLabel('Telefone do cliente').fill('(61) 99999-0000');
  await page.getByLabel('Serviço de interesse / último serviço').selectOption({ label: /Botox Capilar/ });
  await page.getByRole('button', { name: /Salvar cliente/i }).click();
  await expect(page.getByText('Cliente QA')).toBeVisible();
  await expect(page.getByText(/Botox Capilar/)).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: /Clientes/ }).first().click();
  await expect(page.getByText('Cliente QA')).toBeVisible();
  await page.getByRole('button', { name: /Conversar/ }).last().click();
  await expect(page.getByText('Cliente QA')).toBeVisible();
  await page.getByPlaceholder('Responder...').fill('Histórico Cliente QA');
  await page.getByRole('button', { name: /Registrar mensagem/i }).click();
  await expect(page.getByText('Histórico Cliente QA')).toBeVisible();

  await page.getByRole('button', { name: /Conversas/ }).first().click();
  await page.getByRole('button', { name: /Bianca Souza/ }).click();
  await page.getByPlaceholder('Responder...').fill('Teste E2E persistente');
  await page.getByRole('button', { name: /Registrar mensagem/i }).click();
  await expect(page.getByText('Teste E2E persistente')).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: /Conversas/ }).first().click();
  await page.getByRole('button', { name: /Bianca Souza/ }).click();
  await expect(page.getByText('Teste E2E persistente')).toBeVisible();

  await page.getByRole('button', { name: /Agenda/ }).first().click();
  await page.getByRole('button', { name: 'Ver mensagem' }).first().click();
  await expect(page.getByText(/Mensagem de confirmação/)).toBeVisible();
  await page.getByRole('button', { name: /Registrar no histórico/i }).click();
  await expect(page.getByText(/Registrada no histórico comercial/)).toBeVisible();
});


test('won lead only becomes revenue after validation and feeds campaign ROI', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/');

  await page.getByRole('button', { name: /Campanhas & ROI/ }).first().click();
  await page.getByPlaceholder('Nome da campanha').fill('Campanha QA');
  await page.getByPlaceholder('Investimento R$').fill('100');
  await page.getByRole('button', { name: /Criar campanha/i }).click();

  await page.getByRole('button', { name: /Leads & Pipeline/ }).first().click();
  await page.getByPlaceholder('Nome', { exact: true }).fill('Lead ROI QA');
  await page.getByPlaceholder('Produto, serviço ou interesse').fill('Botox Capilar');
  await page.getByPlaceholder('Valor potencial R$').fill('500');
  await page.locator('select').filter({ has: page.locator('option', { hasText: 'Campanha QA' }) }).selectOption({ label: 'Campanha QA' });
  await page.getByRole('button', { name: /Registrar lead/i }).click();

  const leadRow = page.locator('.lead').filter({ hasText: 'Lead ROI QA' });
  await leadRow.locator('select').selectOption('GANHO');
  await expect(leadRow).toContainText('aguardando validação');

  await page.getByRole('button', { name: /Visão geral/ }).first().click();
  await expect(page.getByText('R$ 0', { exact: false }).first()).toBeVisible();

  page.once('dialog', async dialog => dialog.accept('500'));
  await page.getByRole('button', { name: /Leads & Pipeline/ }).first().click();
  await page.locator('.lead').filter({ hasText: 'Lead ROI QA' }).getByRole('button', { name: /Validar venda/i }).click();
  await expect(page.locator('.lead').filter({ hasText: 'Lead ROI QA' })).toContainText('Venda validada · R$ 500');

  await page.getByRole('button', { name: /Campanhas & ROI/ }).first().click();
  const campaignRow = page.locator('.lead').filter({ hasText: 'Campanha QA' });
  await expect(campaignRow).toContainText('Receita R$ 500');
  await expect(campaignRow).toContainText('400% ROI');
});
