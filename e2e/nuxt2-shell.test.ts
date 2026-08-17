/**
 * E2E tests for the Nuxt 2 shell (@sprlab/microfront/nuxt2/shell).
 *
 * Requires:
 *   yarn dev:nuxt2-shell
 *
 * which starts the Nuxt 2 shell on 4008 plus the Vue 3 remotes it hosts:
 *   4001 connection, 4002 route, 4004 fullHeight
 *
 * Run with: yarn test:e2e:nuxt2-shell
 *
 * Kept separate from e2e/e2e.test.ts, which targets a shell layout that no longer
 * exists (/remote1, /remote2, /remote3) and fails wholesale.
 */
import { chromium, type Browser, type Page } from 'playwright'

const SHELL = 'http://localhost:4008'

let browser: Browser
let page: Page
const results: { name: string; passed: boolean; error?: string }[] = []

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ name, passed: true })
    console.log(`  ✅ ${name}`)
  } catch (e: any) {
    results.push({ name, passed: false, error: e.message })
    console.log(`  ❌ ${name}: ${e.message}`)
  }
}

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message)
}

async function freshPage() {
  const ctx = await browser.newContext()
  page = await ctx.newPage()
}

async function goto(path: string) {
  await freshPage()
  await page.goto(SHELL + path)
  // give penpal time to connect and report the remote's route
  await page.waitForTimeout(3000)
}

/** Tags the iframe so we can later prove it was never re-created */
async function tagIframe(title: string) {
  await page.locator(`iframe[title="${title}"]`).evaluate((el: HTMLIFrameElement) => {
    el.dataset.e2eProbe = 'tagged'
    ;(window as any).__e2eWindow = el.contentWindow
  })
}

/** True when the iframe is the same element AND the same document as when tagged */
async function iframeSurvived(title: string): Promise<boolean> {
  return page.locator(`iframe[title="${title}"]`).evaluate(
    (el: HTMLIFrameElement) =>
      el.dataset.e2eProbe === 'tagged' && el.contentWindow === (window as any).__e2eWindow,
  )
}

// ─── SSR ───
// The reason this example runs in universal mode. penpal reads the `crypto` global
// while its module initialises, and Nuxt evaluates the server bundle in a vm sandbox
// without it, so importing the shell entry at module scope used to return a 500.

async function testSsrConnectionPage() {
  const res = await fetch(`${SHELL}/connection`)
  const html = await res.text()

  assert(res.status === 200, `Expected 200, got ${res.status}`)
  assert(
    !/crypto is not defined/i.test(html),
    'SSR crashed with "crypto is not defined" — the shell entry is being evaluated on the server',
  )
  assert(
    html.includes('Connecting to Remote'),
    'Connection page markup was not server-rendered',
  )
}

async function testSsrRoutePage() {
  const res = await fetch(`${SHELL}/route`)
  const html = await res.text()

  assert(res.status === 200, `Expected 200, got ${res.status}`)
  assert(!/crypto is not defined/i.test(html), 'SSR crashed with "crypto is not defined"')
  assert(html.includes('Shell path'), 'Route page markup was not server-rendered')
}

async function testSsrDeepLinkIsRouted() {
  // /route/page2 must resolve through the catch-all child, not 404
  const res = await fetch(`${SHELL}/route/page2`)
  const html = await res.text()

  assert(res.status === 200, `Expected 200, got ${res.status}`)
  assert(
    !html.includes('This page could not be found'),
    '/route/page2 did not match a route — is pages/route/_.vue missing?',
  )
}

// ─── Route sync ───

async function testInitialRouteSync() {
  await goto('/route')
  // the remote redirects / to /page1 and reports it back over penpal
  assert(
    page.url().endsWith('/route/page1'),
    `Shell URL did not follow the remote. Got: ${page.url()}`,
  )
}

async function testShellNavigationDrivesRemote() {
  await goto('/route')
  await tagIframe('Route Example')

  await page.click('a[href="/route/page2"]')
  await page.waitForTimeout(1500)

  assert(page.url().endsWith('/route/page2'), `Shell URL is ${page.url()}`)

  const heading = await page
    .frameLocator('iframe[title="Route Example"]')
    .locator('h2')
    .textContent()
  assert(heading?.includes('Page 2'), `Remote did not navigate. Heading: ${heading}`)
}

async function testIframeSurvivesNavigation() {
  await goto('/route')
  await tagIframe('Route Example')

  await page.click('a[href="/route/page2"]')
  await page.waitForTimeout(1500)
  assert(
    await iframeSurvived('Route Example'),
    'Iframe was re-created on navigation — the NuxtChild key is not stable',
  )

  await page.click('a[href="/route/page1"]')
  await page.waitForTimeout(1500)
  assert(await iframeSurvived('Route Example'), 'Iframe was re-created going back to page1')
}

async function testRemoteNavigationDrivesShell() {
  await goto('/route')
  await tagIframe('Route Example')

  await page
    .frameLocator('iframe[title="Route Example"]')
    .getByRole('link', { name: 'Page 2' })
    .click()
  await page.waitForTimeout(1500)

  assert(page.url().endsWith('/route/page2'), `Shell URL is ${page.url()}`)
  assert(
    await iframeSurvived('Route Example'),
    'Iframe was re-created after navigating inside it',
  )
}

async function testNoDuplicatedPath() {
  await goto('/route/page2')
  assert(
    !page.url().includes('/page2/page2') && !page.url().includes('/route/route'),
    `Path was duplicated: ${page.url()}`,
  )
  assert(page.url().endsWith('/route/page2'), `Shell URL is ${page.url()}`)
}

async function testDeepLinkLoadsRemoteAtSubPath() {
  await goto('/route/page2')

  const heading = await page
    .frameLocator('iframe[title="Route Example"]')
    .locator('h2')
    .textContent()
  assert(heading?.includes('Page 2'), `Remote did not deep-link. Heading: ${heading}`)
}

async function testBackAndForward() {
  await goto('/route')
  await tagIframe('Route Example')

  await page.click('a[href="/route/page2"]')
  await page.waitForTimeout(1500)

  await page.goBack()
  await page.waitForTimeout(1500)
  assert(page.url().endsWith('/route/page1'), `After back, URL is ${page.url()}`)
  assert(await iframeSurvived('Route Example'), 'Iframe was re-created on back')

  await page.goForward()
  await page.waitForTimeout(1500)
  assert(page.url().endsWith('/route/page2'), `After forward, URL is ${page.url()}`)
  assert(await iframeSurvived('Route Example'), 'Iframe was re-created on forward')
}

// ─── Connection status and messaging ───
// createRemoteMessenger exposes status as a plain property precisely so Vue 2 can
// track it; these fail if it ever goes back to being a closure-backed getter.

async function testStatusReachesConnected() {
  await goto('/connection')
  const status = await page.locator('[data-test-id="status"]').textContent()
  assert(status?.trim() === 'Connected', `Status is "${status?.trim()}"`)
}

async function testMessagingShellToRemote() {
  await goto('/connection')
  await page.click('[data-test-id="send"]')
  await page.waitForTimeout(1000)

  const remoteText = await page
    .frameLocator('iframe[title="Connection Example"]')
    .locator('p')
    .first()
    .textContent()
  assert(
    remoteText?.includes('Shell counter: 1'),
    `Remote did not receive the message. Got: ${remoteText}`,
  )
}

async function testMessagingRemoteToShell() {
  await goto('/connection')
  await page
    .frameLocator('iframe[title="Connection Example"]')
    .getByRole('button', { name: /Send to Shell/ })
    .click()
  await page.waitForTimeout(1000)

  const received = await page.locator('[data-test-id="received"]').textContent()
  assert(
    received?.includes('Received from Remote: 1'),
    `Shell did not receive the message. Got: ${received}`,
  )
}

// ─── fullHeight ───

async function testFullHeightFillsContainer() {
  await goto('/fullheight')

  const { iframeH, containerH } = await page
    .locator('iframe[title="FullHeight Example"]')
    .evaluate((el: HTMLIFrameElement) => ({
      iframeH: el.offsetHeight,
      containerH: (el.parentElement as HTMLElement).offsetHeight,
    }))

  assert(iframeH > 300, `Iframe is only ${iframeH}px tall`)
  assert(
    Math.abs(iframeH - containerH) <= 2,
    `Iframe (${iframeH}px) does not fill its container (${containerH}px)`,
  )
}

async function testFullHeightGrowsForTallContent() {
  await goto('/fullheight')

  await page
    .frameLocator('iframe[title="FullHeight Example"]')
    .getByRole('link', { name: 'Tall Content' })
    .click()
  await page.waitForTimeout(2000)

  const { iframeH, containerH } = await page
    .locator('iframe[title="FullHeight Example"]')
    .evaluate((el: HTMLIFrameElement) => ({
      iframeH: el.offsetHeight,
      containerH: (el.parentElement as HTMLElement).offsetHeight,
    }))

  assert(
    iframeH > containerH,
    `Iframe (${iframeH}px) did not grow past its container (${containerH}px)`,
  )
}

// ─── Runner ───

;(async () => {
  console.log('\n🧪 Nuxt 2 shell E2E\n')

  browser = await chromium.launch({ headless: true })

  console.log('── SSR (universal mode) ──')
  await test('Connection page server-renders without the crypto crash', testSsrConnectionPage)
  await test('Route page server-renders', testSsrRoutePage)
  await test('Deep link /route/page2 resolves to a route', testSsrDeepLinkIsRouted)

  console.log('\n── Route sync ──')
  await test('Initial route sync (remote reports its path)', testInitialRouteSync)
  await test('Shell navigation drives the remote', testShellNavigationDrivesRemote)
  await test('Iframe survives navigation (stable NuxtChild key)', testIframeSurvivesNavigation)
  await test('Remote navigation drives the shell URL', testRemoteNavigationDrivesShell)
  await test('No duplicated path segments', testNoDuplicatedPath)
  await test('Deep link loads the remote at the sub-path', testDeepLinkLoadsRemoteAtSubPath)
  await test('Back and forward keep the iframe alive', testBackAndForward)

  console.log('\n── Connection status and messaging ──')
  await test('Status reaches connected (Vue 2 reactivity)', testStatusReachesConnected)
  await test('Messaging shell → remote', testMessagingShellToRemote)
  await test('Messaging remote → shell', testMessagingRemoteToShell)

  console.log('\n── fullHeight ──')
  await test('Iframe fills its container', testFullHeightFillsContainer)
  await test('Iframe grows for tall content', testFullHeightGrowsForTallContent)

  await browser.close()

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${results.length}\n`)

  if (failed > 0) {
    console.log('Failed tests:')
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.log(`  ❌ ${r.name}: ${r.error}`))
    process.exit(1)
  }
})()
