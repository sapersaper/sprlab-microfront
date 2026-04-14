/**
 * E2E tests for @sprlab/microfront
 * Requires all dev servers running: yarn dev (shell:4000, remote1:4001, remote2:4002)
 * and Nuxt 2 app on localhost:3000 for remote3 tests.
 *
 * Run with: npx tsx e2e/e2e.test.ts
 */
import { chromium, type Browser, type Page } from 'playwright'

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

async function waitForUrl(predicate: (url: string) => boolean, timeout = 5000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (predicate(page.url())) return
    await page.waitForTimeout(200)
  }
  throw new Error(`URL did not match within ${timeout}ms. Current: ${page.url()}`)
}

// ─── Setup ───

async function setup() {
  browser = await chromium.launch({ headless: false })
  page = await (await browser.newContext()).newPage()
}

async function teardown() {
  await browser.close()
}

async function freshPage() {
  const ctx = await browser.newContext()
  page = await ctx.newPage()
}

// ─── Tests ───

async function testShellLoads() {
  await freshPage()
  await page.goto('http://localhost:4000')
  await page.waitForTimeout(1000)
  const title = await page.title()
  if (!title) throw new Error('Shell did not load')
}

async function testRemote1Loads() {
  await freshPage()
  await page.goto('http://localhost:4000/remote1')
  await page.waitForTimeout(3000)

  const iframe = page.locator('iframe[title="Remote 1"]')
  const count = await iframe.count()
  if (count === 0) throw new Error('Remote 1 iframe not found')

  const isVisible = await iframe.isVisible()
  if (!isVisible) throw new Error('Remote 1 iframe not visible')
}

async function testRemote1IframeResizer() {
  await freshPage()
  await page.goto('http://localhost:4000/remote1')
  await page.waitForTimeout(5000)

  const height = await page.locator('iframe[title="Remote 1"]').evaluate(
    (el: HTMLIFrameElement) => el.offsetHeight
  )
  if (height <= 150) throw new Error(`Iframe height is ${height}px (not resized)`)
}

async function testRemote1Messaging() {
  await freshPage()
  await page.goto('http://localhost:4000/remote1')
  await page.waitForTimeout(3000)

  // Check that the shell shows messaging UI
  const buttonText = await page.textContent('button')
  if (!buttonText?.includes('Enviar')) throw new Error('Send button not found')
}

async function testRemote2Loads() {
  await freshPage()
  await page.goto('http://localhost:4000/remote2')
  await page.waitForTimeout(3000)

  const iframe = page.locator('iframe[title="Remote 2"]')
  const isVisible = await iframe.isVisible()
  if (!isVisible) throw new Error('Remote 2 iframe not visible')
}

async function testRemote2IframeResizer() {
  await freshPage()
  await page.goto('http://localhost:4000/remote2')
  await page.waitForTimeout(5000)

  const height = await page.locator('iframe[title="Remote 2"]').evaluate(
    (el: HTMLIFrameElement) => el.offsetHeight
  )
  if (height <= 150) throw new Error(`Iframe height is ${height}px (not resized)`)
}

async function testRemote2InitialRouteSync() {
  await freshPage()
  await page.goto('http://localhost:4000/remote2')
  await page.waitForTimeout(5000)

  // Remote2 redirects / -> /page1, shell should sync to /remote2/page1
  await waitForUrl((url) => url.includes('/remote2/page1'), 8000)
}

async function testRemote2NavigationSync() {
  await freshPage()
  await page.goto('http://localhost:4000/remote2')
  await page.waitForTimeout(5000)
  await waitForUrl((url) => url.includes('/remote2/page1'), 8000)

  // Click Page 2 inside iframe
  const iframe = page.frameLocator('iframe[title="Remote 2"]')
  await iframe.locator('a:has-text("Page 2")').click()
  await waitForUrl((url) => url.includes('/remote2/page2'), 8000)
}

async function testRemote2BackButton() {
  await freshPage()

  // Navigate: home -> remote2 -> page2
  await page.goto('http://localhost:4000')
  await page.waitForTimeout(1000)

  await page.click('a[href="/remote2"]')
  await page.waitForTimeout(5000)
  await waitForUrl((url) => url.includes('/remote2'), 8000)

  // Wait for penpal connection and initial route sync
  await waitForUrl((url) => url.includes('/remote2/page1'), 8000)

  // Click Page 2
  const iframe = page.frameLocator('iframe[title="Remote 2"]')
  await iframe.locator('a:has-text("Page 2")').click()
  await waitForUrl((url) => url.includes('/remote2/page2'), 8000)

  // Back should go to /remote2/page1 (single back, not double)
  await page.evaluate(() => window.history.back())
  await page.waitForTimeout(2000)

  const url = page.url()
  if (url.includes('/page2')) {
    throw new Error(`Still on page2 after back — double-back bug present. URL: ${url}`)
  }
  if (!url.includes('/remote2')) {
    throw new Error(`Expected /remote2, got: ${url}`)
  }
}

async function testRemote2SecondBackGoesHome() {
  // Continue from back button test — we're at /remote2/page1
  await page.evaluate(() => window.history.back())
  await page.waitForTimeout(2000)

  const pathname = new URL(page.url()).pathname
  if (pathname !== '/') {
    throw new Error(`Expected /, got: ${pathname}`)
  }
}

async function testRemote2ForwardNavigation() {
  // Continue — we're at /
  await page.evaluate(() => window.history.forward())
  await page.waitForTimeout(2000)

  if (!page.url().includes('/remote2')) {
    throw new Error(`Expected /remote2, got: ${page.url()}`)
  }
}

async function testRemote2HistoryEntries() {
  await freshPage()
  await page.goto('http://localhost:4000/remote2')
  await page.waitForTimeout(5000)
  await waitForUrl((url) => url.includes('/remote2/page1'), 8000)

  const historyBefore = await page.evaluate(() => window.history.length)

  // Click Page 2
  const iframe = page.frameLocator('iframe[title="Remote 2"]')
  await iframe.locator('a:has-text("Page 2")').click()
  await page.waitForTimeout(2000)

  const historyAfter = await page.evaluate(() => window.history.length)
  const added = historyAfter - historyBefore

  // Should add exactly 1 entry (shell push), not 2 (shell + iframe)
  if (added !== 1) {
    throw new Error(`Expected 1 history entry added, got ${added}`)
  }
}

async function testRemote2PushStatePatched() {
  await freshPage()
  await page.goto('http://localhost:4000/remote2')
  await page.waitForTimeout(3000)

  const iframe = page.frameLocator('iframe[title="Remote 2"]')
  const patched = await iframe.locator('body').evaluate(() => {
    const before = window.history.length
    window.history.pushState({}, '', window.location.href)
    const after = window.history.length
    return before === after
  })

  if (!patched) throw new Error('pushState not patched in iframe')
}

async function testRemote3Loads() {
  await freshPage()
  await page.goto('http://localhost:4000/remote3')
  await page.waitForTimeout(8000)

  const iframe = page.locator('iframe[title="Remote 3"]')
  const isVisible = await iframe.isVisible()
  if (!isVisible) throw new Error('Remote 3 iframe not visible')
}

async function testRemote3IframeResizer() {
  await freshPage()
  await page.goto('http://localhost:4000/remote3')
  await page.waitForTimeout(10000)

  const height = await page.locator('iframe[title="Remote 3"]').evaluate(
    (el: HTMLIFrameElement) => parseInt(el.style.height) || el.offsetHeight
  )
  if (height <= 150) throw new Error(`Iframe height is ${height}px (not resized)`)
}

async function testRemote3RouteSync() {
  await freshPage()
  await page.goto('http://localhost:4000/remote3')
  await page.waitForTimeout(8000)

  // Nuxt 2 home page is /, shell should show /remote3
  const url = page.url()
  if (!url.includes('/remote3')) {
    throw new Error(`Expected /remote3, got: ${url}`)
  }
}

async function testRemote3NavigationSync() {
  await freshPage()
  await page.goto('http://localhost:4000/remote3')
  await page.waitForTimeout(8000)

  // Click About link inside the iframe
  const iframe = page.frameLocator('iframe[title="Remote 3"]')
  await iframe.locator('a:has-text("About")').click()
  await waitForUrl((url) => url.includes('/remote3/about'), 8000)
}

async function testRemote3PushStatePatched() {
  await freshPage()
  await page.goto('http://localhost:4000/remote3')
  await page.waitForTimeout(8000)

  const iframe = page.frameLocator('iframe[title="Remote 3"]')
  const patched = await iframe.locator('body').evaluate(() => {
    const before = window.history.length
    window.history.pushState({}, '', window.location.href)
    const after = window.history.length
    return before === after
  })

  if (!patched) throw new Error('pushState not patched in Nuxt 2 iframe')
}

async function testRemote3BackButton() {
  await freshPage()
  await page.goto('http://localhost:4000/remote3')
  await page.waitForTimeout(8000)

  // Navigate to About
  const iframe = page.frameLocator('iframe[title="Remote 3"]')
  await iframe.locator('a:has-text("About")').click()
  await waitForUrl((url) => url.includes('/remote3/about'), 8000)

  // Back should go to /remote3
  await page.evaluate(() => window.history.back())
  await page.waitForTimeout(2000)

  const url = page.url()
  if (url.includes('/about')) {
    throw new Error(`Still on /about after back. URL: ${url}`)
  }
}

// ─── Runner ───

;(async () => {
  console.log('\n🧪 @sprlab/microfront E2E Tests\n')

  await setup()

  console.log('── Shell ──')
  await test('Shell loads', testShellLoads)

  console.log('\n── Remote 1 (Vue 3, messaging) ──')
  await test('Remote 1 loads in iframe', testRemote1Loads)
  await test('Remote 1 iframe resizes', testRemote1IframeResizer)
  await test('Remote 1 messaging UI visible', testRemote1Messaging)

  console.log('\n── Remote 2 (Vue 3, routing) ──')
  await test('Remote 2 loads in iframe', testRemote2Loads)
  await test('Remote 2 iframe resizes', testRemote2IframeResizer)
  await test('Remote 2 initial route sync (redirect)', testRemote2InitialRouteSync)
  await test('Remote 2 navigation sync (Page 2 click)', testRemote2NavigationSync)
  await test('Remote 2 pushState patched in iframe', testRemote2PushStatePatched)
  await test('Remote 2 single history entry per navigation', testRemote2HistoryEntries)
  await test('Remote 2 back button (single back)', testRemote2BackButton)
  await test('Remote 2 second back goes home', testRemote2SecondBackGoesHome)
  await test('Remote 2 forward navigation', testRemote2ForwardNavigation)

  console.log('\n── Remote 3 (Nuxt 2, legacy) ──')
  await test('Remote 3 loads in iframe', testRemote3Loads)
  await test('Remote 3 iframe resizes', testRemote3IframeResizer)
  await test('Remote 3 route loads correctly', testRemote3RouteSync)
  await test('Remote 3 navigation sync (About click)', testRemote3NavigationSync)
  await test('Remote 3 pushState patched in iframe', testRemote3PushStatePatched)
  await test('Remote 3 back button', testRemote3BackButton)

  await teardown()

  // Summary
  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${results.length} tests\n`)

  if (failed > 0) {
    console.log('Failed tests:')
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  ❌ ${r.name}: ${r.error}`)
    })
    process.exit(1)
  }
})()
