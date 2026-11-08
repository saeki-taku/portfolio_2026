# night-awake PC summer clear v2

This is a non-destructive cup-toggle revision of pc-summer-night-awake-clear-layers-v1. Every layer is 1345 x 1170 RGBA at origin (0, 0). Draw layers in manifest order.

The cup group is **02a-cup-body-contact.png + 02b-cup-contact-shadow.png + 05-cup-foreground.png**. It includes the baked mug paint, its contact shadow and the amber glass/handle cutout. Hide the complete group for cup OFF. The new 02-interior.png completes the windowsill where the mug and shadow were. The new 03-rin.png completes trousers where the glass was baked into the person cutout. Rin and the cup toggle independently. Draw 03a-rin-cup-on-restore.png only when BOTH Rin and cup are shown; it restores the original occlusion without displaying trousers when Rin is hidden.

Inspect preview-composite.png, preview-cup-off.png, preview-rin-off-cup-on.png, and preview-rin-off-cup-off.png. The original v1 directory is unchanged. Reconstruction is restricted to the cup vicinity; the room, exterior, floor, window and other objects retain their positions. The underpaint contains a narrow paint margin so cup ON matches the original even at the silhouette edge; it is not intended for moving the cup to a different coordinate. See verification.json for pixel checks.
