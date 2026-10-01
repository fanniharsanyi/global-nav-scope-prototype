import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5177/parchment-instui-scope-prototype/')
await p.locator('button', { hasText: /continue/i }).last().click()
await p.waitForTimeout(600)

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

// pick a different school
const radios = p.locator('input[name="ctx-scope"]')
const n = await radios.count()
for (let i = 0; i < n; i++) {
  if (!(await radios.nth(i).isChecked())) { await radios.nth(i).check(); break }
}
await p.waitForTimeout(400)
const msg = (await live.first().textContent()).trim()
console.log('after school change:', JSON.stringify(msg))
console.log('mentions service list update (want true):', /service list updated/i.test(msg))

// does the announced landing service match the actually checked one?
const checkedWs = await p.locator('input[name="ctx-ws"]:checked').count()
console.log('checked service radios (want 1):', checkedWs)
const label = await p.locator('input[name="ctx-ws"]:checked').locator('xpath=ancestor::label').locator('.scoperow__name').innerText()
console.log('actually selected service:', JSON.stringify(label.replace(/\s*Current\s*$/,'').trim()))
console.log('announcement agrees (want true):', msg.includes(label.replace(/\s*Current\s*$/,'').trim()))

await p.screenshot({ path: 'shots/me-14-live.png' })
await b.close()
