# SP spring/evening layers v1

Review candidate based on the approved SP day v21 scene, not a crop of the PC version. All nine RGBA files use 1024 x 1997 pixels and the original `(0, 0)` registration. Draw them in `manifest.json` order. The accepted SP day buildings, distant playground, room, window, pot, cup, Rin's v21 pose and oil-paint texture supply every shape. The generated SP evening study supplied only broad golden-hour colors and light direction; a low-pass per-pixel lighting transfer was applied to each v21 layer. The generated study itself is **not** a production scene asset.

Toggle groups inherited from the SP day package, with every linked layer relit for this evening state:

- Rin: `07-rin-occluded-underpaint.png` and `08-rin-notebook.png` together.
- Cup: `05-cup-contact-underpaint.png`, `06-cup-body-underpaint.png` and `09-cup-foreground.png` together.
- Plant: `03-plant-scene-underpaint.png` and `04-indoor-plant.png` together.

`preview-composite.png` and `preview-no-rin.png` were inspected; no old figure, sketchbook or contact residue appears with Rin hidden. `verification.json` records unchanged alpha and the exact day-layer registration. The evening light is baked into these layer RGB values, including the completed space behind Rin and the pot; do not mix daytime underpaints into this scene. Cup and plant edge colors are still stationary cutouts and should not be independently moved/scaled without new clean-plate work. This scene does not create discrete window lights or new geometric shadows; night/weather require separate reviewed variants.

Rebuild both evening sets with `node ../build-evening-layer-sets-v1.cjs`. The immutable SP day v21 files and reference PNG are read only.
