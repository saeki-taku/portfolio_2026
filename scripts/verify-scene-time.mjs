import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { sceneForTokyo } from '../src/lib/scene-time.ts';
import { resolveScene } from '../src/lib/scene-catalog.ts';

for (const viewport of ['pc', 'sp']) {
  for (const [slot, scene] of [
    ['dawn', 'summer-dawn-sunny'],
    ['day', 'summer-day-sunny'],
    ['evening', 'summer-evening-sunny'],
    ['night-awake', 'summer-night-sunny-awake'],
    ['night-asleep', 'summer-night-sunny-asleep'],
  ]) assert.deepEqual(resolveScene({ season: 'summer', weather: 'sunny', slot }, viewport),
    { requested: scene, displayed: scene, reason: 'exact' });
  assert.deepEqual(resolveScene({ season: 'spring', weather: 'cloudy', slot: 'day' }, viewport),
    { requested: 'spring-day-cloudy', displayed: 'spring-day-cloudy', reason: 'exact' });
  assert.deepEqual(resolveScene({ season: 'spring', weather: 'rain', slot: 'day' }, viewport),
    { requested: 'spring-day-rain', displayed: 'spring-day-rain', reason: 'exact' });
  for (const [slot, weather, expected] of [
    ['dawn', 'rain', 'spring-dawn-rain'],
    ['evening', 'cloudy', 'spring-evening-cloudy'],
    ['evening', 'rain', 'spring-evening-rain'],
    ['night-awake', 'cloudy', 'spring-night-cloudy-awake'],
    ['night-awake', 'rain', 'spring-night-rain-awake'],
    ['night-asleep', 'cloudy', 'spring-night-cloudy-asleep'],
    ['night-asleep', 'rain', 'spring-night-rain-asleep'],
  ]) assert.deepEqual(resolveScene({ season: 'spring', weather, slot }, viewport),
    { requested: expected, displayed: expected, reason: 'exact' });
  assert.deepEqual(resolveScene({ season: 'spring', weather: 'snow', slot: 'night-awake' }, viewport),
    { requested: 'spring-night-snow-awake', displayed: 'spring-night-sunny-awake', reason: 'assets-unavailable' });
  assert.deepEqual(resolveScene({ season: 'summer', weather: 'rain', slot: 'dawn' }, viewport),
    { requested: 'summer-dawn-rain', displayed: 'spring-dawn-sunny', reason: 'assets-unavailable' });
  assert.deepEqual(resolveScene({ season: 'spring', weather: 'sunny', slot: 'dawn' }, viewport),
    { requested: 'spring-dawn-sunny', displayed: 'spring-dawn-sunny', reason: 'exact' });
  assert.deepEqual(resolveScene({ season: 'spring', weather: 'cloudy', slot: 'dawn' }, viewport),
    { requested: 'spring-dawn-cloudy', displayed: 'spring-dawn-cloudy', reason: 'exact' });
}

const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4399';
const atTokyo = (hour, minute, second = 0) => new Date(Date.UTC(2026, 9, 4, hour - 9, minute, second));
const cases = [
  [0, 0, 'spring-night-sunny-asleep'],
  [4, 59, 'spring-night-sunny-asleep'],
  [5, 0, 'spring-dawn-sunny'],
  [5, 59, 'spring-dawn-sunny'],
  [6, 0, 'spring-day-sunny'],
  [16, 59, 'spring-day-sunny'],
  [17, 0, 'spring-evening-sunny'],
  [18, 59, 'spring-evening-sunny'],
  [19, 0, 'spring-night-sunny-awake'],
  [22, 59, 'spring-night-sunny-awake'],
  [23, 0, 'spring-night-sunny-asleep'],
];
for (const [hour, minute, scene] of cases) assert.equal(sceneForTokyo(atTokyo(hour, minute)), scene, `${hour}:${minute}`);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.clock.install({ time: atTokyo(16, 59, 0) });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const active = () => page.locator('.pc-artwork').getAttribute('data-active-scene');
  assert.equal(await active(), 'spring-day-sunny', 'initial automatic scene');
  assert.equal(await page.locator('select[name="mode"]').inputValue(), 'auto');
  await page.clock.runFor(61_100);
  assert.equal(await active(), 'spring-evening-sunny', 'open page crosses 17:00');
  await page.locator('.scene-settings summary').evaluate(element => { if (element instanceof HTMLElement) element.click(); });
  await page.locator('select[name="mode"]').selectOption('manual');
  await page.locator('select[name="period"]').selectOption('night');
  assert.equal(await active(), 'spring-night-sunny-awake', 'manual awake night selection');
  await page.locator('select[name="nightState"]').selectOption('asleep');
  assert.equal(await active(), 'spring-night-sunny-asleep', 'manual night selection');
  await page.clock.runFor(60_000);
  assert.equal(await active(), 'spring-night-sunny-asleep', 'manual selection remains fixed');
  await page.locator('select[name="mode"]').selectOption('auto');
  assert.equal(await active(), 'spring-evening-sunny', 'return to automatic selection');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.querySelector('.pc-artwork')?.dataset.activeScene === 'spring-day-sunny');
  assert.equal(await active(), 'spring-day-sunny', 'SP uses its dedicated day composition');
  assert.equal(await page.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-evening-sunny', 'SP has its own evening layers');
  assert.match(await page.locator('.scene-status').textContent(), /夕方/);
  await page.locator('select[name="mode"]').selectOption('manual');
  await page.locator('select[name="period"]').selectOption('night');
  assert.equal(await page.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-night-sunny-asleep', 'SP night uses sleeping layers');
  assert.match(await page.locator('.scene-status').textContent(), /SP 春・夜・晴れ／就寝後/);
  await page.locator('select[name="nightState"]').selectOption('awake');
  assert.equal(await page.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-night-sunny-awake', 'SP manual awake night');
  await page.locator('select[name="weather"]').selectOption('rain');
  assert.equal(await page.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-night-rain-awake', 'SP rain keeps requested time slot');
  assert.match(await page.locator('.scene-status').textContent(), /SP 春・夜・雨／起きている夜/);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('select[name="period"]').selectOption('day');
  await page.locator('select[name="weather"]').selectOption('cloudy');
  assert.equal(await active(), 'spring-day-cloudy', 'PC cloudy day candidate');
  assert.match(await page.locator('.scene-status').textContent(), /PC 春・昼・曇り。静止画の確認用候補/);
  await page.close();
  const dawn = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await dawn.clock.install({ time: atTokyo(4, 59, 0) });
  await dawn.goto(base, { waitUntil: 'domcontentloaded' });
  assert.equal(await dawn.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-night-sunny-asleep');
  await dawn.clock.runFor(61_100);
  assert.equal(await dawn.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-dawn-sunny', '05:00 switches to dawn');
  assert.match(await dawn.locator('.scene-status').textContent(), /春・晴れ／明け方/);
  await dawn.locator('.scene-settings summary').evaluate(element => { if (element instanceof HTMLElement) element.click(); });
  await dawn.locator('select[name="mode"]').selectOption('manual');
  await dawn.locator('select[name="period"]').selectOption('dawn');
  assert.equal(await dawn.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-dawn-sunny', 'manual dawn selection');
  assert.match(await dawn.locator('.scene-status').textContent(), /春・明け方・晴れ。凛と室内灯のない/);
  await dawn.close();
  const sunrise = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await sunrise.clock.install({ time: atTokyo(5, 59, 0) });
  await sunrise.goto(base, { waitUntil: 'domcontentloaded' });
  assert.equal(await sunrise.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-dawn-sunny');
  await sunrise.clock.runFor(61_100);
  assert.equal(await sunrise.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-day-sunny', '06:00 switches to day');
  await sunrise.close();
} finally {
  await browser.close();
}
console.log('Tokyo scene boundaries, live rollover, manual/auto, and all SP states: passed');
