# ennui SP spring/day tall candidate v2

Review candidate only. This is a 1024 x 2400 opaque composition, not a replacement for the adopted 1024 x 1997 scene or a complete new layer package. No logo, menu, or text is painted into the image.

## Files

- `preview-tall.png`: proposed new composition.
- `compare-before-after.png`: old v21 on the left, new v2 on the right, both at native width. The gray area under the old image marks its shorter canvas.
- `preview-393x852.png` and `preview-393x900.png`: scale/crop approximations using the implementation's measured 0.3768 multiplier at 393 CSS px. These do not include the HTML logo/menu or Safari safe areas.
- `inspection-sky-joins.png` and `inspection-floor-join.png`: native-resolution joining details.
- `rin-transparent-registered.png`: the unchanged v21 figure moved into the proposed 1024 x 2400 coordinate system. This alone is not a full separated scene.
- `inputs/scaffold.png`, `inputs/generated-infill-guide.png`, `inputs/geometry.json`: reproducible inputs and row mapping.
- `manifest.json`, `verification.json`: geometry and exact protected-region comparison.

## Geometry and method

The source is `../sp-day-pose-v21/preview-composite.png`. The top wall through y329 remains. The upper window region from source y350..549 is placed at target y330..529, raising the upper frame by 20px. An oil-painted sky continuation occupies target y530..799. All lower source content from y550..1996, including the adopted skyline, buildings, park, Rin, pot, cup, sill and pre-existing floor, moves down exactly 250px without scaling. The new floor continuation occupies y2247..2399. Narrow feather zones around the additions are recorded in `verification.json`.

The built-in ImageGen edit produced `inputs/generated-infill-guide.png` from the banded scaffold. Only the generated sky/floor bands and narrow joins are used in `preview-tall.png`; the generated guide's altered city and figure are discarded. Original scene pixels for target rows 890..2189 (source rows 640..1939) were compared channel-by-channel, with zero changes.

ImageGen prompt used:

> Use case: precise-object-edit. This is a 1024x2400 tall spring oil painting scaffold. Fill ONLY the two intentionally blurred placeholder bands while preserving the exact scene and portrait framing. Upper band y530-800: extend the fine-brush pale-blue sky and small soft white clouds. Continue the central straight vertical window mullion and side jambs at their exact x positions with unchanged width, depth and angle; no buildings in this band. Bottom band y2247-2400: continue pale timber floor planks, seams, perspective and diagonal sun shadows naturally downward with matching fine oil brush texture. Blend both additions seamlessly into the adjacent painting without a horizontal join. Do not change the woman, body, feet, hair, sketchbook, buildings, playground, trees, pot, cup, window sill, existing floor, or scene layout. Do not stretch the art. No text, logo, menu or new objects. This is localized sky and floor outpainting, not a redraw.

## Viewport constraints

The current implementation scale at 393px viewport width is approximately 0.3768, so this candidate paints at roughly 386 x 904 CSS px. That covers 393 x 852 with 52px of bottom floor cropped, and 393 x 900 with about 4px cropped. The shorter 393 x 760 view would crop around 144px of the floor. Wider and taller phones, browser bars, safe areas, and the actual HTML logo/menu still require an implementation-side screenshot review; no claim is made that every device has zero crop. Preserve the right-of-frame breathing room in the actual layout.

Do not switch current SP scenes or reuse these coordinates for evening/night/weather yet. If approved, rebuild every affected SP layer, no-person plate, effect mask and toggle group on this same 1024 x 2400 canvas before integration.
