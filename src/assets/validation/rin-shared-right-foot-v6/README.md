# 右足を左足の後ろへ重ねた v6（レビュー見本）

手前の左足は固定し、奥側の右足をその後ろへ寄せました。右足のかかとが左足の右奥から小さく見える配置。PC/SPは同じ人物形状です。旧版とサイト素材は変更していません。

## 成果物

- `sp-after.png` / `pc-after.png`: 春昼晴れ・カップOFF全景。
- `rin-sp-transparent.png`: 1024×2400、元SPと同じ座標、透明余白保持。
- `rin-pc-transparent.png`: 1345×1170、75%均等縮小、前版と同じ (940,450) の配置。
- `sp-feet-before-after.png` / `pc-feet-before-after.png`: 左v5、右v6、同一クロップ・倍率。
- `pc-contact-shadow.png`: 新しい足元に合わせた接地影。
- `imagegen-edit.png`: 組み込みImageGen編集出力。最終版には足元の局所だけ使用。
- `build.cjs` / `verification.json`: 再生成・差分検証。

## 参照

人物: `/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/rin-shared-right-foot-v5/rin-sp-transparent.png`

PC比較元: 同v5フォルダの `pc-after.png`。

SP背景: `/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/sp-day-tall-layers-v1/preview-background-no-rin-no-cup.png`

PC背景: `/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/pc-spring-day-sunny-cup-off-layers-v2/preview-rin-off_cup-off.png`

## 編集と目視評価

ImageGenで右足と周辺裾を描き直し、人物クロップ内 x95..259 / y325..411 だけ滑らかに合成。左の伸びた足、顔、上半身など領域外は元画素を維持。編集領域外の人物差分0。PCの接地影は再生成しました。

足元拡大で左足が手前、右足が奥になる境界を確認。右足の見える幅は前版のおよそ半分程度になり、左足の後ろへ入った見た目になっています。右足のかかとが独立して見え、両足は融合していません。PC/SPの全景も確認しました。

制約: 右足・足首・裾の局所再描画であり、元の右足の不可視部分を保持した厳密な3D移動ではありません。『肌色面積のちょうど50%が左足だけに遮られた』という定量的保証はありません。裾の形も接続に合わせて変化しています。見た目の約半分の重なりを確認するための候補です。サイト反映や他時間帯展開は行っていません。

## ImageGenプロンプト

> Precise local edit of this transparent seated woman. In the bottom left, the long extended LEFT bare foot is foreground and must stay EXACTLY fixed in position, shape and size. The smaller RIGHT bare foot currently immediately to its right, under the trouser hem, is the BACK foot. Move that entire right foot LEFTWARD BEHIND the fixed left foot until approximately HALF of its currently visible skin area is OCCLUDED by the foreground left foot. Do not shrink the right foot or hide it using extra fabric. Draw convincing front-left-foot over back-right-foot overlap with a thin occlusion shadow. The remaining right heel should peek just beyond the left heel, around x120 instead of x165 in this 468px-wide reference. Move the right ankle/hem connection naturally with the back foot; repair vacated area with minimal flowing white cloth. Keep all original pixels above y325 as closely as possible: face, hair, bun, green top, arms, notebook, knees, pose. Keep the large left foot unchanged. No extra toes/third foot, no fused feet. True transparent background, same framing, oil paint style, no floor/cup.
