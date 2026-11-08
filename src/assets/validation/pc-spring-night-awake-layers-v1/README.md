# PC spring / awake night v1

Review-candidate layered artwork at 1345 x 1170, origin `(0, 0)`. Draw the RGBA files in `manifest.json` order. It uses the approved PC day geometry and figure pose; the existing PC night painting supplied only broad blue/warm lighting and locations of discrete city lights. No building, park, window, floorboard, hairstyle, notebook, or foot was redrawn.

`01a-city-lights.png` is separate from the exterior. It is derived from warm, high-contrast light clusters in the PC night reference and is placed after `01-exterior.png`, before the interior/window layer. The right-side indoor reading glow is baked into the relit interior and figure layers. Hide `04-contact-shadow.png`, `03-rin.png` and `06-person-edge-restore.png` together for `preview-no-rin.png`; the figure/contact patch does not remain. The cup remains visible because the approved PC day interior already contains parts of it; independent cup hiding is unsupported.

All original alpha and coordinates were preserved by a pointwise low-pass lighting transfer. `preview-composite.png` and `preview-no-rin.png` were visually checked. The light overlay is a fixed painted-night asset, not a procedural lighting model; do not move the buildings or reuse it against a different exterior.
