import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 980 } })
const p = await ctx.newPage()
const URL = 'http://localhost:5177/parchment-instui-scope-prototype/'

async function signIn() {
  await p.goto(URL)
  await p.locator('button', { hasText: /continue/i }).last().click()
  await p.waitForTimeout(600)
}
const ctxText = async () =>
  (await p.locator('.gnav__ctx-school').innerText()) + ' / ' +
  (await p.locator('.gnav__ctx-service').innerText())

await signIn()
console.log('1. fresh start:', await ctxText())

// switch to a different school+service AND save it as default
await p.locator('.gnav__institution--ctx').click()
await p.waitForTimeout(400)
const schools = p.locator('input[name="ctx-scope"]')
for (let i = 0; i < await schools.count(); i++) {
  if (!(await schools.nth(i).isChecked())) { await schools.nth(i).check(); break }
}
await p.waitForTimeout(300)
const svc = p.locator('input[name="ctx-ws"]')
for (let i = 0; i < await svc.count(); i++) {
  if (!(await svc.nth(i).isChecked())) { await svc.nth(i).check(); break }
}
await p.locator('.ctx__foot input[type=checkbox]').check({ force: true })
await p.waitForTimeout(200)
await p.getByRole('button', { name: /^apply$/i }).click()
await p.waitForTimeout(600)
const saved = await ctxText()
console.log('2. after apply+save:', saved)
console.log('   announcement:', JSON.stringify((await p.locator('div[role="status"]').first().innerText().catch(()=> '')).trim()))
await p.screenshot({ path: 'shots/me-15-saved.png' })

// sign out, sign back in — does it land on the saved default?
await p.locator('.gnav__account').click()
await p.waitForTimeout(300)
await p.locator('.gnav__logout').click()
await p.waitForTimeout(400)
await p.locator('button', { hasText: /continue/i }).last().click()
await p.waitForTimeout(700)
const after = await ctxText()
console.log('3. after sign out/in:', after)
console.log('   PERSISTED (want true):', after === saved)

// the checkbox should now be disabled-as-already-default
await p.locator('.gnav__institution--ctx').click()
await p.waitForTimeout(400)
const cb = p.locator('.ctx__foot input[type=checkbox]')
console.log('4. checkbox disabled when already default (want true):', await cb.isDisabled())
await p.screenshot({ path: 'shots/me-16-already.png' })
await p.keyboard.press('Escape')
await p.waitForTimeout(300)

// per-service default school panel
await p.locator('.gnav__item', { hasText: /^Settings$/ }).first().click().catch(()=>{})
await p.waitForTimeout(600)
const heads = await p.locator('h2, h3').allInnerTexts()
console.log('5. settings headings:', heads.filter(h=>/where you start|default school/i.test(h)))
const selects = p.locator('.startrow input[role=combobox]')
console.log('   per-service school selects:', await selects.count())
const labels = await p.locator('.startrow').allInnerTexts()
console.log('   rows:', labels.map(l=>l.split('\n')[0]))
await p.screenshot({ path: 'shots/me-17-wherestart.png', fullPage: true })
await b.close()
