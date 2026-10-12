import { test, expect } from '@playwright/test'
import { LoginPage } from '../../src/pages/LoginPage'
import { ROLES } from '../../src/data/roles'
import { BASE_URL } from '../../src/env'

// Logs in fresh instead of reusing a global-setup storageState: logging out ends
// the Keycloak session, which would invalidate a session other specs share.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Keycloak logout flow', () => {
  test('logging out ends the Keycloak session', async ({ page }) => {
    const login = new LoginPage(page)
    await login.gotoAndLogin(ROLES.admin)

    await page.getByRole('button', { name: 'User menu' }).click()
    await page.getByRole('menuitem', { name: 'Log out' }).click()

    // Keycloak redirects back to the landing page, not into a fresh session.
    await expect(page).toHaveURL(`${BASE_URL}/`)
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('jwt_token'))).toBeNull()

    // Logging in again must ask for credentials instead of reusing the SSO session.
    await page.getByRole('button', { name: 'Login' }).click()
    await login.expectLoginFormVisible()
  })
})
