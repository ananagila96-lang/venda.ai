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
