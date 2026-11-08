# SP spring/day v21 implementation layers

This is a non-destructive packaging of the approved-looking SP day v21 figure and existing scene assets. No pose or painting has been regenerated. Every PNG is 1024 x 1997 RGBA with the same top-left origin and must be drawn at `(0, 0)` at the same rendered size. Do not crop or reposition individual layers.

## Draw order

Draw the files in `manifest.json`'s `layersBottomToTop` order:

1. `01-exterior.png` - spring skyline, street, park and trees inside the two window openings.
2. `02-interior-window.png` - wall, frame, sill and floor; openings are transparent.
3. `03-plant-scene-underpaint.png` - original scene detail around the pot, linked to the plant. The base beneath uses the existing plantless completion.
4. `04-indoor-plant.png` - potted flowers; this is a static cutout.
5. `05-cup-contact-underpaint.png` - cup contact area from the accepted plate.
6. `06-cup-body-underpaint.png` - cup-area paint that must be present behind Rin to match v21.
7. `07-rin-occluded-underpaint.png` - v21's original pixels in a small area hidden by Rin. It restores the exact accepted composite but must disappear with Rin; otherwise the old sketchbook remnant appears behind the cup.
8. `08-rin-notebook.png` - unchanged v21 transparent figure, pen and sketchbook.
9. `09-cup-foreground.png` - unchanged v1 foreground cup, in front of Rin.

The person toggle controls **07 and 08 together**. The cup toggle controls **05, 06 and 09 together**. The plant toggle controls **03 and 04 together**. There is no independently reusable person-cast shadow in the accepted v21 composite; do not carry over v1's `04-person-contact.png`, which belongs to the old pose.

## Review files

- `preview-composite.png` - all layers; compared with `/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/sp-day-pose-v21/preview-composite.png`.
- `preview-no-rin-with-cup.png` - Rin and her occluded underpaint hidden; no old sketchbook or body remains.
- `preview-background-no-rin-no-cup.png` - Rin, cup and their dependent pixels hidden.
- `preview-room-no-plant-rin-cup.png` - the uncovered exterior and room, including the completed space behind the plant.
- `verification.json` - registration and pixel-difference report. Recomposition differs from the v21 reference by at most one 8-bit channel value, solely from alpha-compositing rounding.

The old figure area is completed using the existing v1 no-Rin plate. A small exposed remnant above/behind the cup was cleaned in the person-off background. Its original v21 pixels remain in layer 07 only while Rin is shown, preserving the accepted composite. The plant-off background uses the existing v1 plantless completion; layer 03 restores the accepted v21 paint around the pot while it is visible.

The plant and cup underpaint masks copy the existing antialiased edge colors as opaque pixels for an exact stationary composite. They can be shown or hidden, but should not be moved, scaled, or animated independently without a new true-alpha cutout and clean-plate review. This SP exterior is not yet a PC/SP shared master, and the daylight and shadows are baked into the art; evening/night/weather require their own reviewed treatment.

`node build.cjs` rebuilds this package from the immutable adopted SP source, v1 assets and v21 figure. The build performs deterministic registration and compositing only; it does not call an image-generation model.
