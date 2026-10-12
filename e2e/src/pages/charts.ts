import { Locator, Page, expect } from '@playwright/test'

// Every diagram renders through the shared UI library's ChartContainer, which
// marks its root with data-chart.
export function chartContainers(scope: Page | Locator): Locator {
  return scope.locator('[data-chart]')
}

// Asserts that each chart actually drew something, not merely that its card
// mounted. A chart that never receives its size from ResponsiveContainer keeps
// the empty .recharts-wrapper but renders no SVG surface, so the card looks
// blank while every heading around it is still present. That happened twice
// (#1091, #1533) and again when the UI library singleton came from a remote
// that bundled its own recharts copy.
export async function expectChartsDrawn(scope: Page | Locator, expectedCount: number) {
  const charts = chartContainers(scope)
  await expect(charts).toHaveCount(expectedCount, { timeout: 15_000 })

  for (let i = 0; i < expectedCount; i++) {
    const chart = charts.nth(i)
    await expect(chart.locator('svg.recharts-surface')).toBeVisible()
    await expect(
      chart.locator('.recharts-bar-rectangle path, .recharts-pie-sector path').first(),
    ).toBeVisible()
  }
}
