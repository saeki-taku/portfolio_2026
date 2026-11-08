import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const copiedRoot = join(root, 'src/assets/validation/sp-day-tall-candidate-v2');
const output = join(root, 'artifacts/sp-day-tall-v2');
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
await mkdir(output, { recursive: true });
const digest = data => createHash('sha256').update(data).digest('hex');
for (const [original, copied, height] of [
  [join(sourceRoot, 'sp-day-tall-candidate-v2/preview-tall.png'), join(copiedRoot, 'preview-tall.png'), 2400],
  [join(sourceRoot, 'sp-day-pose-v21/preview-composite.png'), join(copiedRoot, 'current-sp-day-v21.png'), 1997],
]) {
  const [source, copy] = await Promise.all([readFile(original), readFile(copied)]);
  assert.equal(digest(copy), digest(source), `${copied}: PNG bytes changed`);
  const metadata = await sharp(copy).metadata();
  assert.equal(metadata.width, 1024);
  assert.equal(metadata.height, height);
}

const cases = [
  { name: 'iphone16', width: 393, height: 852, safe: 0 },
  { name: 'iphone16-safe34', width: 393, height: 852, safe: 34 },
  { name: 'taller', width: 393, height: 900, safe: 0 },
  { name: 'short-safe34', width: 393, height: 760, safe: 34 },
  { name: 'wide-phone', width: 430, height: 932, safe: 0 },
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const test of cases) {
    const page = await browser.newPage({ viewport: { width: test.width, height: test.height }, deviceScaleFactor: 1 });
    const url = `${base}/dev/sp-day-tall/v2/?view=candidate${test.safe ? '&safe=34' : ''}`;
    const response = await page.goto(url);
    assert.equal(response.status(), 200);
    await page.locator('img[data-image="candidate"]').evaluate(image => image.decode());
    const actual = await page.evaluate(() => {
      const rect = selector => {
        const element = document.querySelector(selector);
        const r = element.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
      };
      return {
        art: rect('.painting'), scene: rect('.scene'), logo: rect('.scene-logo'), menu: rect('.scene-nav'),
        candidateVisible: !document.querySelector('img[data-image="candidate"]').hidden,
        currentHidden: document.querySelector('img[data-image="current"]').hidden,
        imageWidth: document.querySelector('img[data-image="candidate"]').naturalWidth,
        imageHeight: document.querySelector('img[data-image="candidate"]').naturalHeight,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    const scale = test.width / 1024;
    assert.equal(actual.candidateVisible, true);
    assert.equal(actual.currentHidden, true);
    assert.deepEqual([actual.imageWidth, actual.imageHeight], [1024, 2400]);
    assert.ok(Math.abs(actual.art.width - 1024 * scale) < .05, `${test.name}: artwork width`);
    assert.ok(Math.abs(actual.art.right - test.width) < .05, `${test.name}: no right-edge strip`);
    assert.ok(Math.abs(actual.art.height - 2400 * scale) < .05, `${test.name}: artwork height`);
    assert.ok(Math.abs(actual.art.y) < .05, `${test.name}: artwork top`);
    assert.ok(actual.art.bottom >= test.height, `${test.name}: no blank below painting`);
    assert.ok(Math.abs(test.width - 990 * scale - 34 * scale) < .05, `${test.name}: outer window margin retained without crop`);
    assert.ok(actual.menu.right <= actual.art.right, `${test.name}: menu stays within painting width`);
    assert.ok(actual.menu.y < actual.art.bottom, `${test.name}: menu over painting`);
    assert.ok(actual.logo.bottom + 12 < 330 * scale, `${test.name}: logo clear of upper window frame`);
    assert.ok(1648 * scale + 20 < actual.menu.y, `${test.name}: figure and cup clear of menu`);
    assert.ok(Math.abs(test.height - actual.menu.bottom - Math.max(16, test.safe)) < .05, `${test.name}: safe-area bottom`);
    assert.ok(actual.overflow <= 1, `${test.name}: no horizontal scroll`);
    await page.screenshot({ path: join(output, `${test.name}-candidate.png`), fullPage: true });
    if (test.name === 'iphone16' || test.name === 'taller') {
      await page.locator('.review-controls summary').click();
      await page.locator('[data-select-view="current"]').click();
      assert.equal(await page.locator('img[data-image="candidate"]').getAttribute('hidden'), '');
      assert.equal(await page.locator('img[data-image="current"]').getAttribute('hidden'), null);
      const current = await page.locator('.painting').boundingBox();
      assert.ok(Math.abs(current.height - 1997 * scale) < .05, `${test.name}: current remains 1997 proportions`);
      await page.locator('img[data-image="current"]').evaluate(image => image.decode());
      await page.locator('.review-controls summary').click();
      await page.screenshot({ path: join(output, `${test.name}-current.png`), fullPage: true });
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
  await page.goto(`${base}/dev/sp-day-tall/v2/?view=candidate`);
  const candidateSrc = await page.locator('img[data-image="candidate"]').getAttribute('src');
  const response = await page.request.get(new URL(candidateSrc, base).href);
  assert.equal(digest(await response.body()), digest(await readFile(join(copiedRoot, 'preview-tall.png'))), 'served PNG unchanged');
  await page.close();
} finally {
  await browser.close();
}
console.log(`SP tall v2 candidate, unchanged PNG, HTML overlay, current comparison, 5 viewport/safe-area cases: passed. Screenshots: ${output}`);
