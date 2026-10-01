import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await (await b.newContext({viewport:{width:1500,height:1000}})).newPage()
const errs = []
p.on('pageerror', e => errs.push(e.message))
await p.goto('http://localhost:5177/global-nav-scope-prototype/')
for (const s of await p.locator('button[role=switch]').all())
  if (await s.getAttribute('aria-checked') === 'false') await s.click()
await p.locator('button', { hasText: /continue/i }).last().click()
await p.waitForTimeout(700)

const scopeCount = async () => p.locator('input[name="ctx-scope"]').count()
await p.locator('.gnav__institution--ctx').click(); await p.waitForTimeout(400)
const n = await scopeCount()
await p.keyboard.press('Escape'); await p.waitForTimeout(300)

for (let si = 0; si < n; si++) {
  await p.locator('.gnav__institution--ctx').click(); await p.waitForTimeout(400)
  await p.locator('input[name="ctx-scope"]').nth(si).check({ force: true }); await p.waitForTimeout(300)
  const scopeName = await p.locator('input[name="ctx-scope"]').nth(si).evaluate(x=>x.closest('label').innerText.split('\n')[0])
  const sv = await p.locator('input[name="ctx-ws"]').count()
  await p.keyboard.press('Escape'); await p.waitForTimeout(250)
  for (let wi = 0; wi < sv; wi++) {
    await p.locator('.gnav__institution--ctx').click(); await p.waitForTimeout(400)
    await p.locator('input[name="ctx-scope"]').nth(si).check({ force: true }); await p.waitForTimeout(250)
    await p.locator('input[name="ctx-ws"]').nth(wi).check({ force: true }); await p.waitForTimeout(250)
    const svcName = await p.locator('input[name="ctx-ws"]').nth(wi).evaluate(x=>x.closest('label').innerText.split('\n')[0])
    const ap = p.locator("button", { hasText: /^Apply$/ }); if (await ap.isEnabled()) await ap.click(); else await p.keyboard.press("Escape"); await p.waitForTimeout(600)
    const d = await p.evaluate(() => ({
      metrics: [...document.querySelectorAll('.metric')].map(m=>m.innerText.replace(/\n/g,' ')),
      rows: [...document.querySelectorAll('table tbody tr')].map(r=>[...r.cells].map(c=>c.innerText).join(' | ')),
      cards: [...document.querySelectorAll('.card__title')].map(c=>c.innerText)
    }))
    console.log(`\n### ${scopeName} / ${svcName}`)
    console.log('  metrics:', d.metrics.join('  ·  '))
    console.log('  cards  :', d.cards.join(' · '))
    d.rows.forEach(r=>console.log('   ', r))
  }
}
console.log('\nPAGE ERRORS:', errs)
await b.close()
