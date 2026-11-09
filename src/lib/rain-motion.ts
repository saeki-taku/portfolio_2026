import summerPeriodManifest from '../assets/validation/summer-period-weather-v1/manifest.json';
const periodMaskFiles=import.meta.glob<string>('../assets/validation/summer-period-weather-v1/*.png',{eager:true,query:'?url',import:'default'});
import summerWeatherManifest from '../assets/validation/summer-day-weather-v1/manifest.json';
const summerWeatherFiles=import.meta.glob<string>('../assets/validation/summer-day-weather-v1/*.png',{eager:true,query:'?url',import:'default'});
import springRainOverrides from '../assets/validation/spring-rin-approved-feet-v1/rain-overrides.json';
const springMaskFiles = import.meta.glob<string>('../assets/validation/spring-rin-approved-feet-v1/*.png', {eager:true, query:'?url', import:'default'});
const maskFiles = import.meta.glob<string>('../assets/validation/*/rain-visibility-alpha-*.png', { eager: true, query: '?url', import: 'default' });
const mask = (folder: string, state: string) => {
  const override = (springRainOverrides as Record<string,string>)[`${folder}/rain-visibility-alpha-${state}.png`];
  const url = (override ? springMaskFiles[`../assets/validation/spring-rin-approved-feet-v1/${override}`] : undefined) ?? maskFiles[`../assets/validation/${folder}/rain-visibility-alpha-${state}.png`];
  if (!url) throw new Error(`Rain visibility mask missing: ${folder}/${state}`);
  return url;
};
const phase4Masks = (pcFolder: string, spFolder: string, pcStates: string[], spStates: string[]) => ({
  pc: Object.fromEntries(pcStates.map(state => [state, mask(pcFolder, state)])),
  sp: Object.fromEntries(spStates.map(state => [state, mask(spFolder, state)])),
});

const summerRainMasks=(kind:'pc'|'sp')=>Object.fromEntries(Object.entries(summerWeatherManifest[`${kind}-rain`].masks).map(([key,file])=>[key,summerWeatherFiles[`../assets/validation/summer-day-weather-v1/${file}`]]));
const periodRainScenes: Record<string,{pc:Record<string,string>;sp:Record<string,string>}>={};
for(const [key,entry] of Object.entries(summerPeriodManifest)){if(!entry.scene.includes('-rain'))continue;const view=key.startsWith('pc-')?'pc':'sp';periodRainScenes[entry.scene]??={pc:{},sp:{}};periodRainScenes[entry.scene][view]=Object.fromEntries(Object.entries(entry.masks).map(([state,file])=>[state,periodMaskFiles[`../assets/validation/summer-period-weather-v1/${file}`]]));}
const masks: Record<string, { pc: Record<string, string>; sp: Record<string, string> }> = {
  ...periodRainScenes,
  ...Object.fromEntries(Object.entries(periodRainScenes).map(([scene,value])=>[scene.replace('-rain','-thunderstorm'),value])),
  'summer-day-thunderstorm': {pc:summerRainMasks('pc'),sp:summerRainMasks('sp')},
  'summer-day-rain': {pc:summerRainMasks('pc'),sp:summerRainMasks('sp')},
  'spring-day-rain': {
    pc: {
      'rin-on': mask('pc-spring-day-rain-layers-v2', 'rin-on'),
      'rin-off': mask('pc-spring-day-rain-layers-v2', 'rin-off'),
    },
    sp: {
      'rin-on': mask('sp-spring-day-rain-tall-layers-v1', 'rin-on'),
      'rin-off': mask('sp-spring-day-rain-tall-layers-v1', 'rin-off'),
      'plant-off-rin-on': mask('sp-spring-day-rain-tall-layers-v1', 'plant-off-rin-on'),
      'plant-off-rin-off': mask('sp-spring-day-rain-tall-layers-v1', 'plant-off-rin-off'),
    },
  },
  'spring-dawn-rain': phase4Masks('pc-spring-dawn-rain-layers-v1', 'sp-spring-dawn-rain-tall-layers-v1', ['default'], ['default', 'plant-off']),
  'spring-evening-rain': phase4Masks('pc-spring-evening-rain-layers-v1', 'sp-spring-evening-rain-tall-layers-v1', ['default', 'rin-off'], ['default', 'rin-off', 'plant-off', 'plant-off-rin-off']),
  'spring-night-rain-awake': phase4Masks('pc-spring-night-awake-rain-layers-v1', 'sp-spring-night-awake-rain-tall-layers-v1', ['default', 'rin-off'], ['default', 'rin-off', 'plant-off', 'plant-off-rin-off']),
  'spring-night-rain-asleep': phase4Masks('pc-spring-night-asleep-rain-layers-v1', 'sp-spring-night-asleep-rain-tall-layers-v1', ['default'], ['default', 'plant-off']),
};

type Viewport = 'pc' | 'sp';
type Streak = { x: number; y: number; length: number; speed: number; alpha: number; width: number };
const random = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

export function setupRainMotion() {
  const portrait = matchMedia('(max-aspect-ratio: 1/1)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const imageCache = new Map<string, Promise<HTMLImageElement>>();
  const maskImage = (url: string) => {
    if (!imageCache.has(url)) imageCache.set(url, new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    }));
    return imageCache.get(url)!;
  };
  const amount = (effect: string) => Number(document.querySelector<HTMLInputElement>(`[data-rain-amount="${effect}"]`)?.value ?? 100) / 100;
  const visibleCount = (level: number, normal: number, maximum: number) => Math.round(level <= 1
    ? normal * level : normal + (maximum - normal) * Math.min(1, level - 1));

  for (const viewport of ['pc', 'sp'] as Viewport[]) {
    const artwork = document.querySelector<HTMLElement>(viewport === 'pc' ? '.pc-artwork' : '.mobile-artwork');
    const canvas = artwork?.querySelector<HTMLCanvasElement>('.rain-motion');
    const context = canvas?.getContext('2d', { alpha: true });
    if (!artwork || !canvas || !context) continue;
    const { width, height } = canvas;
    const rng = random(viewport === 'pc' ? 413 : 927);
    const normalStreaks = viewport === 'pc' ? 420 : 620;
    const maximumStreaks = viewport === 'pc' ? 2100 : 3000;
    const normalDrops = viewport === 'pc' ? 26 : 38;
    const maximumDrops = viewport === 'pc' ? 90 : 135;
    const makeStreak = (index: number): Streak => {
      const near = index % 5 === 0;
      return {
        x: rng() * width, y: rng() * height,
        length: near ? (viewport === 'pc' ? 10 : 15) + rng() * (viewport === 'pc' ? 11 : 13)
          : (viewport === 'pc' ? 5 : 8) + rng() * (viewport === 'pc' ? 8 : 10),
        speed: near ? (viewport === 'pc' ? 80 : 100) + rng() * 50
          : (viewport === 'pc' ? 40 : 55) + rng() * 45,
        alpha: near ? .18 + rng() * .10 : .14 + rng() * .10,
        width: viewport === 'pc'
          ? (near ? .45 + rng() * .15 : .28 + rng() * .2)
          : (near ? .85 + rng() * .2 : .6 + rng() * .25),
      };
    };
    const makeDrop = (): Streak => ({
      x: rng() * width, y: rng() * height, length: 1 + rng() * 3,
      speed: 1.5 + rng() * 4, alpha: .1 + rng() * .15, width: 1.2,
    });
    // Generate the normal scene first so its rain pattern stays stable as the range grows.
    const streaks: Streak[] = Array.from({ length: normalStreaks }, (_, index) => makeStreak(index));
    const drops: Streak[] = Array.from({ length: normalDrops }, makeDrop);
    for (let index = normalStreaks; index < maximumStreaks; index++) streaks.push(makeStreak(index));
    for (let index = normalDrops; index < maximumDrops; index++) drops.push(makeDrop());
    let frame = 0;
    let lastFrame = 0;
    let currentMask = '';
    let loadedMask: HTMLCanvasElement | HTMLImageElement | undefined;

    const isThunder = () => (artwork.dataset.activeScene ?? '').includes('-thunderstorm');
    const isSummerRain = () => (artwork.dataset.activeScene ?? '').startsWith('summer-') && !!masks[artwork.dataset.activeScene ?? ''];
    let thunderStartedAt = 0;
    let previousScene = '';
    const active = () => !!masks[artwork.dataset.activeScene ?? '']
      && (portrait.matches ? viewport === 'sp' : viewport === 'pc')
      && !document.hidden && (!reducedMotion.matches || isSummerRain())
      && (amount('outdoor') > 0 || amount('glass') > 0 || isThunder());
    const maskUrl = () => {
      const scene = artwork.dataset.activeScene ?? '';
      if(isSummerRain()){const attr=viewport==='pc'?'data-layer-toggle':'data-sp-toggle';const bits=['rin','cup','plant'].reduce((n,g,i)=>n+((document.querySelector<HTMLInputElement>(`[${attr}="${g}"]`)?.checked && !(scene.includes('-thunderstorm')&&g==='rin') && !document.querySelector<HTMLInputElement>(`[${attr}="${g}"]`)?.disabled)?1<<i:0),0);return masks[scene][viewport][bits];}
      const personAbsent = scene.startsWith('spring-dawn-') || scene.endsWith('-asleep');
      const rin = personAbsent || document.querySelector<HTMLInputElement>(viewport === 'pc' ? '[data-layer-toggle="rin"]' : '[data-sp-toggle="rin"]')?.checked === false ? 'off' : 'on';
      const plantOff = viewport === 'sp' && document.querySelector<HTMLInputElement>('[data-sp-toggle="plant"]')?.checked === false;
      const key = scene === 'spring-day-rain'
        ? `${plantOff ? 'plant-off-' : ''}rin-${rin}`
        : [plantOff ? 'plant-off' : '', !personAbsent && rin === 'off' ? 'rin-off' : ''].filter(Boolean).join('-') || 'default';
      return masks[artwork.dataset.activeScene ?? '']?.[viewport][key] ?? '';
    };
    const paint = (time: number) => {
      if (!active() || !loadedMask) { frame = 0; canvas.hidden = true; return; }
      frame = reducedMotion.matches ? 0 : requestAnimationFrame(paint);
      if (!reducedMotion.matches && time - lastFrame < 33) return;
      lastFrame = time;
      const seconds = time / 1000;
      context.clearRect(0, 0, width, height);
      const outdoor = amount('outdoor');
      if (outdoor > 0) {
        const summerRain=isSummerRain();
        const count = visibleCount(outdoor, summerRain ? normalStreaks*2 : normalStreaks, maximumStreaks);
        const speed = outdoor <= 1 ? .75 + .43 * outdoor : 1.18 + 1.02 * (outdoor - 1);
        const length = outdoor <= 1 ? .8 + .2 * outdoor : 1 + .3 * (outdoor - 1);
        const alpha = (outdoor <= 1 ? .65 + .35 * outdoor : 1 + .2 * (outdoor - 1)) * (summerRain ? 1.3 - .3*Math.max(0,outdoor-1) : 1);
        if (outdoor > 1) {
          context.fillStyle = `rgba(116,132,152,${.09 * (outdoor - 1)})`;
          context.fillRect(0, 0, width, height);
        }
        context.lineCap = 'round';
        for (let index = 0; index < count; index++) {
          const line = streaks[index];
          const lineLength = line.length * length;
          const y = (line.y + seconds * line.speed * speed) % (height + lineLength) - lineLength;
          context.lineWidth = line.width;
          context.strokeStyle = `rgba(240,246,251,${line.alpha * alpha})`;
          context.beginPath();
          context.moveTo(line.x, y);
          context.lineTo(line.x - lineLength * .22, y + lineLength);
          context.stroke();
        }
      }
      const glass = amount('glass');
      if (glass > 0) {
        const count = visibleCount(glass, normalDrops, maximumDrops);
        const speed = glass <= 1 ? .8 + .2 * glass : 1 + .45 * (glass - 1);
        const alpha = glass <= 1 ? .65 + .35 * glass : 1 + .2 * (glass - 1);
        context.lineWidth = 1.2;
        context.lineCap = 'round';
        for (let index = 0; index < count; index++) {
          const drop = drops[index];
          const y = (drop.y + seconds * drop.speed * speed) % height;
          context.strokeStyle = `rgba(242,248,252,${drop.alpha * alpha})`;
          context.beginPath();
          context.moveTo(drop.x, y);
          context.lineTo(drop.x - .3, y + drop.length);
          context.stroke();
        }
      }
      // A single soft in-cloud pulse every 11 seconds, with no bolt or branches.
      // Reduced motion uses a faint, completely still cloud glow instead of flashes.
      const elapsed = time - thunderStartedAt;
      const phase = ((elapsed - 8000) % 11000) / 900;
      const strength = isThunder()
        ? reducedMotion.matches ? .32 : elapsed >= 8000 && phase >= 0 && phase < 1 ? Math.sin(Math.PI * phase) ** 2 : 0
        : 0;
      canvas.dataset.lightningStrength = strength.toFixed(3);
      canvas.dataset.lightningCycle = String(Math.max(0, Math.floor((elapsed - 8000) / 11000)));
      if (strength > 0) {
        const cycle = reducedMotion.matches ? 0 : Math.max(0, Math.floor((elapsed - 8000) / 11000));
        const x = width * (cycle % 2 ? .48 : .64);
        const y = height * (viewport === 'pc' ? .18 : .22);
        const radius = width * .18;
        const glow = context.createRadialGradient(x, y + 12, 0, x, y + 12, radius);
        glow.addColorStop(0, `rgba(205,220,250,${.23 * strength})`);
        glow.addColorStop(.45, `rgba(192,211,246,${.09 * strength})`);
        glow.addColorStop(1, 'rgba(192,211,246,0)');
        context.fillStyle = glow;
        context.fillRect(x - radius, y + 12 - radius, radius * 2, radius * 2);

      }
      // The alpha mask stays at the scene origin while rain moves underneath it.
      context.globalCompositeOperation = 'destination-in';
      context.drawImage(loadedMask, 0, 0, width, height);
      context.globalCompositeOperation = 'source-over';
      canvas.hidden = false;
    };
    const sync = () => {
      const selected = artwork.dataset.activeScene ?? '';
      if (selected !== previousScene) { thunderStartedAt = performance.now(); previousScene = selected; }

      if (!active()) {
        cancelAnimationFrame(frame);
        frame = 0;
        canvas.hidden = true;
        return;
      }
      const url = maskUrl();
      if (!url) { cancelAnimationFrame(frame); frame = 0; canvas.hidden = true; return; }
      if (url !== currentMask) {
        currentMask = url;
        canvas.dataset.maskUrl = url;
        loadedMask = undefined;
        cancelAnimationFrame(frame);
        frame = 0;
        canvas.hidden = true;
      }
      if (!loadedMask) {
        maskImage(url).then(image => {
          if (currentMask !== url) return;
          // Rasterize once, then keep rain two canvas pixels inside the opening.
          // This avoids GPU/CPU downsampling differences at faint alpha edges.
          const raster = document.createElement('canvas');
          raster.width = width;
          raster.height = height;
          const rasterContext = raster.getContext('2d', { willReadFrequently: true })!;
          rasterContext.drawImage(image, 0, 0, width, height);
          const pixels = rasterContext.getImageData(0, 0, width, height);
          const source = new Uint8ClampedArray(pixels.data);
          for (let y = 2; y < height - 2; y++) for (let x = 2; x < width - 2; x++) {
            let alpha = 255;
            for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
              alpha = Math.min(alpha, source[((y + dy) * width + x + dx) * 4 + 3]);
            }
            pixels.data[(y * width + x) * 4 + 3] = alpha < 8 ? 0 : alpha;
          }
          rasterContext.putImageData(pixels, 0, 0);
          loadedMask = raster;
          if (active() && !frame) {
            frame = requestAnimationFrame(paint);
          }
        }).catch(() => { canvas.hidden = true; });
      } else if (!frame) {
        frame = requestAnimationFrame(paint);
      }
    };
    portrait.addEventListener('change', sync);
    reducedMotion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    document.addEventListener('change', sync);
    document.addEventListener('input', sync);
    window.addEventListener('ennui:scene-request', sync);
    sync();
  }
}
