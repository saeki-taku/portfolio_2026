import autumnManifest from '../assets/validation/autumn-weather-v1/manifest.json';
import summerPeriodManifest from '../assets/validation/summer-period-weather-v1/manifest.json';
import type { PcScene, TokyoScene } from './scene-time';

export type SceneSeason = 'spring' | 'summer' | 'autumn' | 'winter';
export type SceneWeather = 'sunny' | 'cloudy' | 'rain' | 'thunderstorm' | 'snow';
export type SceneSlot = 'dawn' | 'day' | 'evening' | 'night-awake' | 'night-asleep';
export type SceneViewport = 'pc' | 'sp';

export interface SceneRequest {
  season: SceneSeason;
  weather: SceneWeather;
  slot: SceneSlot;
}

export interface SceneSelection {
  requested: string;
  displayed: PcScene;
  reason: 'exact' | 'assets-unavailable';
}

// Register a scene here only after its images exist in index.astro for that viewport.
// The two lists are separate so PC and SP candidates can be reviewed independently.
const registered: Record<SceneViewport, ReadonlySet<string>> = {
  pc: new Set([...Object.values(autumnManifest).map(e=>e.scene),...Object.entries(summerPeriodManifest).filter(([key])=>key.startsWith('pc-')).flatMap(([,entry])=>entry.scene.includes('-rain')?[entry.scene,entry.scene.replace('-rain','-thunderstorm')]:[entry.scene]),'spring-dawn-sunny', 'spring-dawn-cloudy', 'spring-dawn-rain', 'spring-day-sunny', 'spring-day-cloudy', 'spring-day-rain', 'spring-evening-sunny', 'spring-evening-cloudy', 'spring-evening-rain', 'spring-night-sunny-awake', 'spring-night-cloudy-awake', 'spring-night-rain-awake', 'spring-night-sunny-asleep', 'spring-night-cloudy-asleep', 'spring-night-rain-asleep', 'summer-dawn-sunny', 'summer-day-sunny', 'summer-day-cloudy', 'summer-day-rain', 'summer-day-thunderstorm', 'summer-evening-sunny', 'summer-night-sunny-awake', 'summer-night-sunny-asleep']),
  sp: new Set([...Object.values(autumnManifest).map(e=>e.scene),...Object.entries(summerPeriodManifest).filter(([key])=>key.startsWith('sp-')).flatMap(([,entry])=>entry.scene.includes('-rain')?[entry.scene,entry.scene.replace('-rain','-thunderstorm')]:[entry.scene]),'spring-dawn-sunny', 'spring-dawn-cloudy', 'spring-dawn-rain', 'spring-day-sunny', 'spring-day-cloudy', 'spring-day-rain', 'spring-evening-sunny', 'spring-evening-cloudy', 'spring-evening-rain', 'spring-night-sunny-awake', 'spring-night-cloudy-awake', 'spring-night-rain-awake', 'spring-night-sunny-asleep', 'spring-night-cloudy-asleep', 'spring-night-rain-asleep', 'summer-dawn-sunny', 'summer-day-sunny', 'summer-day-cloudy', 'summer-day-rain', 'summer-day-thunderstorm', 'summer-evening-sunny', 'summer-night-sunny-awake', 'summer-night-sunny-asleep']),
};

const sunnyFallback: Record<SceneSlot, PcScene> = {
  dawn: 'spring-dawn-sunny',
  day: 'spring-day-sunny',
  evening: 'spring-evening-sunny',
  'night-awake': 'spring-night-sunny-awake',
  'night-asleep': 'spring-night-sunny-asleep',
};

export function slotForScene(scene: TokyoScene): SceneSlot {
  return scene.includes('-dawn-') ? 'dawn'
    : scene.includes('-day-') ? 'day'
    : scene.includes('-evening-') ? 'evening'
    : scene.endsWith('-awake') ? 'night-awake' : 'night-asleep';
}

export function resolveScene(request: SceneRequest, viewport: SceneViewport): SceneSelection {
  const requested = `${request.season}-${request.slot.startsWith('night-') ? 'night' : request.slot}-${request.weather}${request.slot.startsWith('night-') ? `-${request.slot.slice(6)}` : ''}`;
  if (registered[viewport].has(requested)) return { requested, displayed: requested as PcScene, reason: 'exact' };
  return { requested, displayed: sunnyFallback[request.slot], reason: 'assets-unavailable' };
}
