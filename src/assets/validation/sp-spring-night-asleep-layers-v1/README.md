# SP spring / asleep night v1

Review-candidate no-Rin scene at 1024 x 1997, origin `(0, 0)`. Draw the RGBA files in `manifest.json` order. It shares the awake-night SP city, park, window and room geometry. Rin and her linked underpaint are absent. The interior is cooled and dimmed so the room is only faintly legible; no reading glow remains. The cup and plant stay on the sill.

The outdoor light layer retains 87 of 901 extracted awake-night warm light clusters (about 10%). Building windows are mostly unlit rather than merely dimmed; a few distant/street lights remain. The existing plant-completion area was treated according to whether a pixel lies behind the glass, avoiding a dark rectangular patch with Rin absent. Inspect `preview-composite.png` and `verification.json`.

The cup and plant toggle groups remain in `manifest.json`, but their static painted edges should not be moved or scaled. No person layer should be re-enabled in this sleeping state. Rain/cloud variants need separate lighting review.
