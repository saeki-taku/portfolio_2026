# PC spring/day separation v4: trousers behind the cup

Source: `../b-spring-rin-pc-corner-soft-v4.png` (1345 x 1170). The source and v1-v3 assets remain unchanged. All six v4 layers keep the full source canvas and coordinate space.

In v3, the person's transparent cutout had a cup-shaped hole. V4 uses a cup-free inpainting of the adopted scene to continue the ivory trouser folds behind the cup. The painted region is restricted to x=1048..1112, y=710..768; the rest of Rin keeps the v3 source RGB. The cloth ends at a slightly irregular hem rather than the mug outline. `03-rin.png` therefore shows completed trousers without a cup-shaped cutout. The cup remains separately visible in `05-cup-foreground.png` when the scene is composited.

Inspect `preview-rin-cup-area.png` for the standalone cutout detail and `preview-composite.png` for the adopted cup-visible scene. The composite differs from the original in 1,406 pixels, with a mean absolute RGB-channel difference of 0.0079/255. These figures do not certify visual quality; this remains a review draft.

Layer order: `01-exterior.png`, `02-interior.png`, `04-contact-shadow.png`, `03-rin.png`, `05-cup-foreground.png`, `06-person-edge-restore.png`. Hide `03-rin.png`, `04-contact-shadow.png`, and `06-person-edge-restore.png` together to hide Rin. The cup and some of its shadow are still present in the interior/contact-shadow assets, so hiding only `05-cup-foreground.png` is **not** yet a valid cup-free state. That separate clean-plate and shadow task remains open.

The built-in image generation tool made `inputs/no-cup-with-rin.png` with this local edit request: remove only the white mug, continue the ivory trousers where cloth was hidden, reveal the recessed gap and windowsill elsewhere, and keep every other part of the adopted oil painting unchanged. Only the small trouser region of that generated image is used in v4. Rebuild with `../complete-pc-day-cup-v4.cjs`.
