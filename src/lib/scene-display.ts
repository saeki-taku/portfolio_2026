import type { PcScene } from './scene-time';

const descriptions: Record<PcScene, string> = {
  'spring-dawn-sunny': '春の明け方、凛のいない窓辺から青灰色と淡い桃色の空を見渡す油絵。',
  'spring-dawn-cloudy': '春の曇った明け方、凛のいない窓辺から青灰色の空を見渡す油絵。',
  'spring-dawn-rain': '春の雨の明け方、凛のいない窓辺から街を見渡す油絵。',
  'spring-day-sunny': '春の街を見下ろす高い窓辺で、凛が静かにスケッチをしている油絵。',
  'spring-day-cloudy': '春の曇り空の街を見下ろす窓辺で、凛が静かにスケッチをしている油絵。',
  'spring-day-rain': '春の雨が降る街を見下ろす窓辺で、凛が静かにスケッチをしている油絵。',
  'spring-evening-sunny': '春の夕方、窓辺で手を休めて街を眺める凛の油絵。',
  'spring-evening-cloudy': '春の曇った夕方、窓辺で街を眺める凛の油絵。',
  'spring-evening-rain': '春の雨の夕方、窓辺で街を眺める凛の油絵。',
  'spring-night-sunny-awake': '春の晴れた夜、灯りのある窓辺で凛が本を読む油絵。',
  'spring-night-cloudy-awake': '春の曇った夜、灯りのある窓辺で凛が本を読む油絵。',
  'spring-night-rain-awake': '春の雨の夜、灯りのある窓辺で凛が本を読む油絵。',
  'spring-night-sunny-asleep': '春の晴れた夜、凛のいない静かな窓辺を描いた油絵。',
  'spring-night-cloudy-asleep': '春の曇った夜、凛のいない静かな窓辺を描いた油絵。',
  'spring-night-rain-asleep': '春の雨の夜、凛のいない静かな窓辺を描いた油絵。',
  'summer-day-sunny': '夏の晴れた昼、緑の街を望む窓辺で凛が静かにスケッチをしている油絵。',
  'summer-dawn-sunny': '夏の晴れた明け方、凛のいない窓辺から緑の街を見渡す油絵。',
  'summer-evening-sunny': '夏の晴れた夕方、緑の街を望む窓辺に凛が座る油絵。',
  'summer-night-sunny-awake': '夏の晴れた夜、灯りのある窓辺に凛が座る油絵。',
  'summer-night-sunny-asleep': '夏の晴れた夜、凛のいない静かな窓辺を描いた油絵。',
};

export function applyScene(requestedScene: PcScene, portrait: boolean): PcScene {
  const scene = document.querySelector<HTMLElement>('.scene');
  if (!scene) return requestedScene;
  const activeScene = requestedScene;
  const pcScene = portrait ? 'spring-day-sunny' : activeScene;
  const spScene = portrait ? activeScene : 'spring-day-sunny';
  scene.dataset.activeScene = activeScene;
  for (const [selector, selected] of [['.pc-artwork', pcScene], ['.mobile-artwork', spScene]] as const) {
    const artwork = scene.querySelector<HTMLElement>(selector);
    if (!artwork) continue;
    artwork.dataset.activeScene = selected;
    const rinToggle = document.querySelector<HTMLInputElement>(selector === '.pc-artwork' ? '[data-layer-toggle="rin"]' : '[data-sp-toggle="rin"]');
    artwork.setAttribute('aria-label', selected.endsWith('-asleep') || selected.includes('-dawn-') || rinToggle?.checked !== false
      ? descriptions[selected] : `${selected.startsWith('summer-') ? '夏' : '春'}の街を見下ろす窓辺の油絵。凛は表示されていません。`);
    for (const image of artwork.querySelectorAll<HTMLImageElement>('img[data-scene]')) {
      if (image.dataset.rainEffect) {
        if (image.dataset.scene === selected) image.loading = 'eager';
        const personAbsent = selected.includes('-dawn-') || selected.endsWith('-asleep');
        const rin = personAbsent || document.querySelector<HTMLInputElement>(selector === '.pc-artwork' ? '[data-layer-toggle="rin"]' : '[data-sp-toggle="rin"]')?.checked === false ? 'off' : 'on';
        const plant = document.querySelector<HTMLInputElement>('[data-sp-toggle="plant"]')?.checked === false ? 'off' : 'on';
        const amount = Number(document.querySelector<HTMLInputElement>(`[data-rain-amount="${image.dataset.rainEffect}"]`)?.value ?? 100);
        image.hidden = image.dataset.scene !== selected || image.dataset.rainRin !== rin || (!!image.dataset.rainPlant && image.dataset.rainPlant !== plant) || amount === 0;
        // Night rain needs a quieter static texture than the brighter daytime scenes.
        const nightRain = selected.startsWith('spring-night-rain-');
        const baseOpacity = nightRain
          ? (image.dataset.rainEffect === 'outdoor' ? .46 : .58)
          : (image.dataset.rainEffect === 'outdoor' ? .72 : .85);
        image.style.opacity = String(Math.min(1, amount / 100 * baseOpacity));
        continue;
      }
      const controlName = selector === '.pc-artwork' ? image.dataset.control : image.dataset.spGroup;
      const controlSelector = selector === '.pc-artwork' ? 'data-layer-toggle' : 'data-sp-toggle';
      const control = controlName ? document.querySelector<HTMLInputElement>(`[${controlSelector}="${controlName}"]`) : null;
      const conditionalMismatch = (['rin', 'cup', 'plant'] as const).some(name => {
        const required = image.dataset[`requires${name[0].toUpperCase()}${name.slice(1)}`];
        if (required === undefined) return false;
        const shown = document.querySelector<HTMLInputElement>(`[${controlSelector}="${name}"]`)?.checked !== false;
        return shown !== (required === 'true');
      });
      image.hidden = image.dataset.scene !== selected || control?.checked === false || conditionalMismatch;
    }
  }
  return activeScene;
}
