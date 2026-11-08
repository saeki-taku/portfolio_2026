# PC spring/evening layers v1

Review candidate, not a replacement for the approved PC day art. All six RGBA files use 1345 x 1170 pixels and the original `(0, 0)` registration. Draw them in `manifest.json` order. The accepted PC day buildings, park, window, room, figure pose, hair, clothing, notebook, feet and impasto texture provide the geometry. A PC evening image-generation study supplied only broad color and light direction; a low-pass per-pixel lighting transfer was then applied to every day layer without changing its alpha or coordinates. The generated study itself is **not** a production scene asset.

Hide `04-contact-shadow.png`, `03-rin.png` and `06-person-edge-restore.png` together to remove Rin. See `preview-no-rin.png`; her contact patch is not left behind. The cup stays visible. The PC day source already bakes parts of the cup and its shadow into `02-interior.png`, so independently hiding or moving the cup is not supported by this set. Do not use the old day contact layer with a different pose or lighting state.

`preview-composite.png` and `preview-no-rin.png` are the checked review images. `verification.json` records dimensions, unchanged alpha, and the day-layer recomposition check. The longer, warmer evening floor illumination comes from recoloring the existing paint; it does not introduce new independently movable shadows or individually lit windows. Future weather/night variants need their own reviewed relighting.

Rebuild both evening sets with `node ../build-evening-layer-sets-v1.cjs`. The immutable day files and reference PNG are read only.
