import { expect, test } from '@playwright/test'

test('a real browser registers against the emulators and reaches the Gezi workspace', async ({ page }) => {
  const unique = Date.now()
  await page.goto('/register')
  await page.getByLabel('Ad soyad').fill('E2E Sahibi')
  await page.getByLabel('Kullanıcı adı').fill(`e2e_owner_${unique}`.slice(0, 24))
  await page.getByLabel('E-posta').fill(`owner-${unique}@example.test`)
  await page.getByLabel('Şifre').fill('test-password')
  await page.getByRole('button', { name: 'Hesap oluştur' }).click()

  await expect(page).toHaveURL(/\/app\/trips$/)
  await expect(page.getByRole('heading', { name: 'Geziler' })).toBeVisible()
})
