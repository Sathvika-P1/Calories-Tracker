import { expect, test } from '@playwright/test'

test('shows the app heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Calorie Tracker' })).toBeVisible()
})
