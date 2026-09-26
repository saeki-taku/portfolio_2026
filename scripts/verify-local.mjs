import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4399';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
await mkdir('artifacts', { recursive: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const health = await page.request.get(`${base}/api/health`);
  assert.equal(health.status(), 200);
  assert.deepEqual(await health.json(), { status: 'ok', service: 'ennui' });
  for (const [name, width, height] of [['desktop',1440,900], ['mobile',390,844], ['small-mobile',320,568], ['landscape',844,390], ['tablet',768,1024]]) {
    await page.setViewportSize({width,height});
    await page.goto(base);
    await page.locator('.scene img').evaluate(img => img.decode());
    const layout = await page.evaluate(() => {
      const img = document.querySelector('.scene img');
      const nav = document.querySelector('.scene-nav').getBoundingClientRect();
      const logo = document.querySelector('.scene-logo').getBoundingClientRect();
      return {scrollHeight:document.documentElement.scrollHeight,scrollWidth:document.documentElement.scrollWidth,source:img.currentSrc,nav:{x:nav.x,y:nav.y,right:nav.right,bottom:nav.bottom},logo:{x:logo.x,y:logo.y,bottom:logo.bottom}};
    });
    assert.ok(layout.scrollHeight <= height, `${name}: vertical overflow`);
    assert.ok(layout.scrollWidth <= width, `${name}: horizontal overflow`);
    assert.ok(layout.nav.x >= 0 && layout.nav.right <= width && layout.nav.bottom <= height, `${name}: navigation outside viewport`);
    assert.ok(layout.logo.x >= 0 && layout.logo.y >= 0 && layout.logo.bottom <= height, `${name}: logo outside viewport`);
    assert.ok(layout.source.includes(width <= height ? 'rin-mobile' : 'rin-desktop'), `${name}: wrong composition`);
    await page.screenshot({path:`artifacts/${name}.png`});
    console.log(`${name}: no overflow; correct composition; logo/navigation visible`);
  }
  for (const [label,path] of [['実績','/works/'],['お知らせ','/news/'],['お問い合わせ','/contact/']]) {
    await page.goto(base);
    await page.getByRole('link',{name:label,exact:true}).click();
    assert.equal(new URL(page.url()).pathname.replace(/\/$/,''), path.replace(/\/$/,''));
    await page.getByRole('heading',{name:label,exact:true}).waitFor();
  }
  const missing = await page.request.get(`${base}/not-a-page`);
  assert.equal(missing.status(),404);
  assert.ok((await missing.text()).includes('ページが見つかりません'));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').getAttribute('aria-label'),'ennui ホーム');
  assert.deepEqual(errors,[]);
  console.log('Workers health, navigation, 404 and keyboard focus: passed');
} finally { await browser.close(); }
