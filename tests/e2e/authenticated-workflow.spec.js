import { expect, test } from '@playwright/test'

async function registerUser(browser, label) {
  const context = await browser.newContext()
  const page = await context.newPage()
  const unique = `${label}_${Date.now()}`
  const username = unique.slice(0, 24)
  const email = `${unique}@example.test`
  await page.goto('/register')
  await page.getByLabel('Ad soyad').fill(`E2E ${label}`)
  await page.getByLabel('Kullanıcı adı').fill(username)
  await page.getByLabel('E-posta').fill(email)
  await page.getByLabel('Şifre').fill('test-password')
  const signUpResponse = page.waitForResponse((response) => response.url().includes('accounts:signUp'))
  await page.getByRole('button', { name: 'Hesap oluştur' }).click()
  await expect(page).toHaveURL(/\/app\/trips$/)
  const uid = (await (await signUpResponse).json()).localId
  return { context, page, uid, username }
}

async function inviteTripMember(ownerPage, member, role) {
  await ownerPage.getByLabel('Katılımcı kullanıcı adı').fill(member.username)
  await ownerPage.getByLabel('Katılımcı rolü').selectOption(role)
  await ownerPage.getByRole('button', { name: 'Davet gönder' }).click()
  await expect(ownerPage.getByText(`@${member.username}`, { exact: true })).toBeVisible()

  await member.page.goto('/app/people')
  await expect(member.page.getByText('E2E Bangkok', { exact: true })).toBeVisible()
  await member.page.getByRole('button', { name: 'Geziye katıl' }).click()
  await expect(member.page.getByText('Gezi daveti kabul edildi.')).toBeVisible()
}

async function createPlan(page, { title, scope = 'personal' }) {
  await page.getByRole('button', { name: 'Plan ekle' }).click()
  await page.getByLabel('Plan türü').selectOption(scope)
  await page.getByLabel('Başlık').fill(title)
  await page.getByRole('button', { name: scope === 'shared' && title.startsWith('Editor') ? 'Öneri gönder' : 'Kaydet' }).click()
}

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

test('owner, editor and viewer complete proposal, drag, resize, join and leave flows', async ({ browser }) => {
  test.setTimeout(120_000)
  const owner = await registerUser(browser, 'owner')
  const editor = await registerUser(browser, 'editor')
  const viewer = await registerUser(browser, 'viewer')

  await owner.page.getByRole('button', { name: 'Yeni Gezi' }).click()
  await owner.page.getByLabel('Gezi adı').fill('E2E Bangkok')
  await owner.page.getByRole('button', { name: 'Oluştur' }).click()
  await owner.page.getByRole('link', { name: /E2E Bangkok/ }).click()
  const tripPath = new URL(owner.page.url()).pathname.split('/').slice(0, 4).join('/')
  await owner.page.goto(`${tripPath}/details`)
  await expect(owner.page.getByRole('heading', { name: 'Gezi Detayları' })).toBeVisible()
  await owner.page.setViewportSize({ width: 390, height: 844 })
  await expect(owner.page.getByRole('navigation', { name: 'Ana navigasyon' })).toBeVisible()
  await expect(owner.page.getByRole('link', { name: 'Profilim' })).toBeInViewport()
  expect(await owner.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await owner.page.screenshot({ path: 'test-results/design-mobile.png', fullPage: true })
  await owner.page.setViewportSize({ width: 1440, height: 1000 })
  await owner.page.screenshot({ path: 'test-results/design-desktop.png', fullPage: true })
  await inviteTripMember(owner.page, editor, 'editor')
  await inviteTripMember(owner.page, viewer, 'viewer')

  await editor.page.goto(`${tripPath}/calendar`)
  await createPlan(editor.page, { title: 'Editor ortak önerisi', scope: 'shared' })
  await expect(editor.page.getByText('Değişiklik önerisi gönderildi.')).toBeVisible()
  await expect(editor.page.getByText('1 değişiklik karar bekliyor')).toBeVisible()

  await owner.page.goto(`${tripPath}/calendar`)
  await expect(owner.page.getByText('1 değişiklik karar bekliyor')).toBeVisible()
  await owner.page.getByRole('button', { name: 'Onayla' }).click()
  await expect(owner.page.getByText('1 değişiklik karar bekliyor')).toBeHidden()
  await expect(owner.page.getByRole('heading', { name: 'Editor ortak önerisi' })).toBeVisible()
  const calendarDownload = owner.page.waitForEvent('download')
  await owner.page.getByRole('button', { name: 'Takvimi dışa aktar' }).click()
  expect((await calendarDownload).suggestedFilename()).toBe('e2e-bangkok.ics')

  await viewer.page.goto(`${tripPath}/calendar`)
  await viewer.page.getByRole('button', { name: 'Plan ekle' }).click()
  await expect(viewer.page.getByLabel('Plan türü').locator('option[value="shared"]')).toHaveCount(0)
  await viewer.page.getByLabel('Başlık').fill('Viewer kişisel planı')
  await viewer.page.getByRole('button', { name: 'Kaydet' }).click()
  await expect(viewer.page.getByRole('heading', { name: 'Viewer kişisel planı' })).toBeVisible()

  await createPlan(owner.page, { title: 'Sürüklenecek ortak plan', scope: 'shared' })
  await owner.page.getByRole('heading', { name: 'Sürüklenecek ortak plan' }).click()
  await owner.page.getByLabel('Belge başlığı').fill('Uçuş rezervasyonu')
  await owner.page.getByLabel('Rezervasyon numarası').fill('E2E-ABC-123')
  await owner.page.getByLabel('Belge görünürlüğü').selectOption('trip')
  await owner.page.getByRole('button', { name: 'Belge ekle' }).click()
  await expect(owner.page.getByText('E2E-ABC-123', { exact: true })).toBeVisible()
  await owner.page.getByRole('button', { name: 'Kapat' }).click()
  await owner.page.getByRole('heading', { name: 'Sürüklenecek ortak plan' }).click()
  await owner.page.getByRole('button', { name: 'Çoğalt', exact: true }).click()
  await expect(owner.page.getByRole('heading', { name: 'Plan Öğesini çoğalt' })).toBeVisible()
  await owner.page.getByLabel('Başlık').fill('Ortak plan kopyası')
  await owner.page.getByRole('button', { name: 'Kaydet' }).click()
  await expect(owner.page.getByRole('heading', { name: 'Ortak plan kopyası' })).toBeVisible()
  const movable = owner.page.locator('article[title^="Sürüklenecek ortak plan"]')
  const board = owner.page.getByTestId('calendar-time-board')
  await expect(movable).toBeVisible()
  await expect(movable).toHaveClass(/cursor-grab/)
  const before = await movable.boundingBox()
  await movable.evaluate((element) => { element.setPointerCapture = () => {} })
  await movable.dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'mouse', button: 0, clientX: before.x + before.width / 2, clientY: before.y + before.height / 2 })
  await board.dispatchEvent('pointermove', { pointerId: 7, pointerType: 'mouse', clientX: before.x + before.width / 2 + 100, clientY: before.y + before.height / 2 + 48 })
  await board.dispatchEvent('pointerup', { pointerId: 7, pointerType: 'mouse', clientX: before.x + before.width / 2 + 100, clientY: before.y + before.height / 2 + 48 })
  await expect(owner.page.getByText('Takvim güncellendi.')).toBeVisible()

  const resized = await movable.boundingBox()
  await movable.locator('[data-resize-edge="end"]').dispatchEvent('pointerdown', { pointerId: 8, pointerType: 'mouse', button: 0, clientX: resized.x + resized.width / 2, clientY: resized.y + resized.height - 2 })
  await board.dispatchEvent('pointermove', { pointerId: 8, pointerType: 'mouse', clientX: resized.x + resized.width / 2, clientY: resized.y + resized.height + 24 })
  await board.dispatchEvent('pointerup', { pointerId: 8, pointerType: 'mouse', clientX: resized.x + resized.width / 2, clientY: resized.y + resized.height + 24 })
  await expect(movable).toBeVisible()

  await editor.page.reload()
  await editor.page.getByRole('heading', { name: 'Viewer kişisel planı' }).click()
  await editor.page.getByRole('button', { name: 'Katılım isteği gönder' }).click()
  await expect(editor.page.getByText('Katılım isteği gönderildi.')).toBeVisible()

  await viewer.page.reload()
  await viewer.page.getByRole('heading', { name: 'Viewer kişisel planı' }).click()
  await viewer.page.getByRole('button', { name: 'Kabul' }).click()
  await expect(viewer.page.getByText('İstek kabul edildi.')).toBeVisible()

  await editor.page.reload()
  await editor.page.getByRole('heading', { name: 'Viewer kişisel planı' }).click()
  editor.page.once('dialog', (dialog) => dialog.accept())
  await editor.page.getByRole('button', { name: 'Bu plandan ayrıl' }).click()
  await expect(editor.page.getByText('Plan Öğesinden ayrıldın.')).toBeVisible()

  await owner.page.goto('/app/trips')
  await owner.page.getByRole('button', { name: 'Geziyi çoğalt' }).click()
  await owner.page.getByLabel('Kopya Gezi adı').fill('E2E Bangkok kopyası')
  await owner.page.getByLabel('Kopya başlangıç tarihi').fill('2027-01-15')
  await owner.page.getByRole('button', { name: 'Çoğalt', exact: true }).click()
  await expect(owner.page).toHaveURL(/\/app\/trips\/[^/]+\/today$/)
  await expect(owner.page.getByRole('heading', { name: 'E2E Bangkok kopyası' })).toBeVisible()

  await owner.page.evaluate(() => navigator.serviceWorker.ready)
  await owner.page.reload()
  await expect.poll(() => owner.page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
  expect(await owner.page.evaluate(() => {
    const tripId = location.pathname.split('/')[3]
    return Object.keys(localStorage).some((key) => key.startsWith('peregrin:offline:v1:') && key.endsWith(`:${tripId}`))
  })).toBe(true)
  await owner.context.setOffline(true)
  await owner.page.reload()
  await expect(owner.page.getByRole('status')).toContainText('Çevrimdışısın')
  await expect(owner.page.getByRole('heading', { name: 'E2E Bangkok kopyası' })).toBeVisible()
  await expect(owner.page.getByText('Editor ortak önerisi').first()).toBeVisible()
  await owner.context.setOffline(false)

  await Promise.all([owner.context.close(), editor.context.close(), viewer.context.close()])
})
