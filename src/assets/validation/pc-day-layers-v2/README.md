# PC spring/day separation v2: lower-body contour and roof edge

Source: `../b-spring-rin-pc-corner-soft-v4.png` (1345 x 1170). The source and v1 assets remain unchanged. All v2 PNG layers retain the 1345 x 1170 coordinate space and transparent margins.

The v1 composite exposed a hard, misplaced boundary around the ivory trousers/skirt, ankle, and window seat. A refined matte was generated against the source image. Only the lower-body zone (x=922..1189, y=590..767) uses that matte; the remaining person outline comes from the original matte. The mask's spill onto the seat below the left foot was removed. No color or shape was regenerated for the person: `03-rin.png` extracts the source RGB.

Layer order: `01-exterior.png`, `02-interior.png`, `04-contact-shadow.png`, `03-rin.png`, `05-cup-foreground.png`, `06-person-edge-restore.png`. The last layer restores the source pixels in the narrow band outside Rin's silhouette. This keeps the blue roof and nearby foliage continuous in the person-visible composite while allowing the reconstructed exterior beneath her to appear when she is hidden. Hide `03-rin.png`, `04-contact-shadow.png`, and `06-person-edge-restore.png` together for the person-free view; leave the cup layer visible.

Review `preview-composite.png` against the source at original size, and `preview-background.png` with the figure hidden. The blue-roof halo behind the knee is removed in the visible composite. Minor mismatches remain near the notebook and mug. This is still a review candidate, not a production-ready character extraction. The foreground cup needs its own exact contour if future poses move it.

The manifest records 2,325 changed composite pixels (0.148% of the canvas) and mean absolute RGB-channel difference 0.0091/255. These figures do not certify visual quality. The generated matte inputs are in `inputs/`; the build is reproduced by `../separate-pc-day-v2.cjs`.
