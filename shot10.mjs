import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5177/global-nav-scope-prototype/')
await p.locator('button', { hasText: /continue/i }).last().click()
await p.waitForTimeout(600)
// product picker: present only when the demo account has Mastery/Canvas
if (await p.locator('.prod__btn').count()) {
  await p.locator('.prod__btn').first().click(); await p.waitForTimeout(900)
}
// the walkthrough blocks clicks, so dismiss it before auditing
if (await p.locator('.tour').count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(400) }

// open the context modal
await p.locator('.gnav__institution--ctx').click()
await p.waitForTimeout(500)

const live = p.locator("[data-ctx-live]")
console.log('live regions (want 1):', await live.count())
console.log('present at open, empty (want ""):', JSON.stringify((await live.first().textContent()).trim()))

// type in search
await p.getByPlaceholder(/search districts/i).fill('meri')
await p.waitForTimeout(300)
console.log('after search:', JSON.stringify((await live.first().textContent()).trim()))

await p.getByPlaceholder(/search districts/i).fill('')
await p.waitForTimeout(300)
console.log('after clear:', JSON.stringify((await live.first().textContent()).trim()))

// pick a different service; the school column must follow and say so
const radios = p.locator('input[name="ctx-ws"]')
const n = await radios.count()
for (let i = 0; i < n; i++) {
  if (!(await radios.nth(i).isChecked())) { await radios.nth(i).check(); break }
}
await p.waitForTimeout(400)
const msg = (await live.first().textContent()).trim()
console.log('after service change:', JSON.stringify(msg))
console.log('mentions school list update (want true):', /school list updated/i.test(msg))

// does the announced landing school match the actually checked one?
const checkedScope = await p.locator('input[name="ctx-scope"]:checked').count()
console.log('checked school radios (want 1):', checkedScope)
const label = await p.locator('input[name="ctx-scope"]:checked').locator('xpath=ancestor::label').locator('.scoperow__name').innerText()
console.log('actually selected school:', JSON.stringify(label.replace(/\s*Current\s*$/,'').trim()))
console.log('announcement agrees (want true):', msg.includes(label.replace(/\s*Current\s*$/,'').trim()))

await p.screenshot({ path: 'shots/me-14-live.png' })
await b.close()
