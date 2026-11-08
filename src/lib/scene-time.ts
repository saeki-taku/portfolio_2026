// Provisional Tokyo-time boundaries, in minutes after midnight. Keep these together
// so the editorial timing can change without changing the scene selection logic.
export const TOKYO_SCENE_START = {
  dawn: 5 * 60,
  day: 6 * 60,
  evening: 17 * 60,
  nightAwake: 19 * 60,
  nightAsleep: 23 * 60,
} as const;

export type PcScene =
  | 'spring-dawn-sunny' | 'spring-dawn-cloudy' | 'spring-dawn-rain'
  | 'spring-day-sunny' | 'spring-day-cloudy' | 'spring-day-rain'
  | 'spring-evening-sunny' | 'spring-evening-cloudy' | 'spring-evening-rain'
  | 'spring-night-sunny-awake' | 'spring-night-cloudy-awake' | 'spring-night-rain-awake'
  | 'spring-night-sunny-asleep' | 'spring-night-cloudy-asleep' | 'spring-night-rain-asleep'
  | 'summer-dawn-sunny' | 'summer-day-sunny' | 'summer-evening-sunny'
  | 'summer-night-sunny-awake' | 'summer-night-sunny-asleep';
export type TokyoScene = PcScene;

const tokyoClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function sceneForTokyo(now: Date): TokyoScene {
  const parts = tokyoClock.formatToParts(now);
  const hour = Number(parts.find(part => part.type === 'hour')?.value);
  const minute = Number(parts.find(part => part.type === 'minute')?.value);
  const time = hour * 60 + minute;
  if (time < TOKYO_SCENE_START.dawn || time >= TOKYO_SCENE_START.nightAsleep) return 'spring-night-sunny-asleep';
  if (time < TOKYO_SCENE_START.day) return 'spring-dawn-sunny';
  if (time >= TOKYO_SCENE_START.nightAwake) return 'spring-night-sunny-awake';
  if (time >= TOKYO_SCENE_START.evening) return 'spring-evening-sunny';
  return 'spring-day-sunny';
}
