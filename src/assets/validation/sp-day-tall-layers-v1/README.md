# ennui SP spring/day tall separated layers v1

Implementation candidate for the approved-looking tall daytime composition at `../sp-day-tall-candidate-v2/preview-tall.png`. The current site and older 1024 x 1997 assets are not changed. Every layer is 1024 x 2400 RGBA, top-left origin (0,0), with transparent margins retained. Draw all nine layers at the same size and position, in `manifest.json`'s `layersBottomToTop` order. Do not individually crop, scale or reposition them.

## Layer contract

1. `01-exterior.png`: sky, city, park and cherry trees inside the two window openings.
2. `02-interior-window.png`: wall, window frame, sill and floor; glass openings are transparent.
3. `03-plant-scene-underpaint.png` and `04-indoor-plant.png`: linked plant background repair and pot/flowers.
4. `05-cup-contact-underpaint.png` and `06-cup-body-underpaint.png`: linked cup-area repair below Rin.
5. `07-rin-occluded-underpaint.png` and `08-rin-notebook.png`: linked source pixels hidden by Rin, then Rin/pen/sketchbook.
6. `09-cup-foreground.png`: cup in front of Rin.

The `rin` toggle removes **07 and 08 together**; the `cup` toggle removes **05, 06 and 09 together**; the `plant` toggle removes **03 and 04 together**. The original localized underpaints are opaque patches, not independent movable objects. Moving only the plant, cup or figure cutout can reveal a patch edge. `glass-mask.png` is a full-canvas black/white **luminance** mask, not an alpha mask; use white for glass and black for wall/frame/sill. Weather effects still need their own foreground handling and are not implemented by this package.

## Geometry and source preservation

The source package is `../sp-day-layers-v21/`, and the visual reference is `../sp-day-tall-candidate-v2/preview-tall.png` (1024 x 2400). Source rows 0..329 stay in place. Source rows 350..549 move up 20px to target rows 330..529. The new sky occupies rows 530..799. Source rows 550..1996, including every city, park, person, plant and cup pixel, move down 250px to target rows 800..2246 without scaling. The new floor occupies rows 2247..2399. The candidate's painted joins were assigned only to the new exterior/interior at target y290..889 and y2190..2399. All other object layers are exact translations of v21, including their alpha.

`preview-composite.png` is **pixel-identical** to the approved-looking 2400px reference (zero changed channels). The person-off preview matches the translated v21 person-off plate through the protected region with maximum one 8-bit channel of rounding difference, and no visible sketchbook/body remnant. All layer canvases and previews are 1024 x 2400; the exterior and opaque interior are complementary without transparent holes. See `verification.json` and the native-resolution plant/person/cup inspection crops.

## Review and limitations

- `preview-composite.png`: all layers on.
- `preview-no-rin-with-cup.png`: Rin and her dependent underpaint off; cup and plant remain.
- `preview-background-no-rin-no-cup.png`: Rin and cup groups off.
- `preview-room-no-plant-rin-cup.png`: bare room and exterior.
- `compare-reference-recomposite.png`: tall reference on the left, separated recomposition on the right.
- `inspection-plant.png`, `inspection-person-cup.png`, `inspection-no-rin-cup.png`: original-resolution boundary checks.

Only SP spring/day sunny is prepared. Evening, awake night, asleep night, cloudy and rain remain at their previous dimensions until separately rebuilt and reviewed. The implementation must give this scene its own 1024 x 2400 aspect ratio; applying that ratio to old scenes would distort them. HTML logo/menu overlay, safe areas and mobile viewport screenshots are implementation-side checks. The source candidate's sky/floor joins are retained, not reinterpreted by this separation.

Rebuild from immutable v21 and the tall reference with `node ../build-sp-day-tall-layers-v1.cjs` from this directory. Recheck the detail crops after rebuilding; the build script writes the nine layers, masks, previews and machine verification, while the three inspection crops are review artifacts produced from the current previews.
