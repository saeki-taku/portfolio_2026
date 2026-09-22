# 春ラフ v3：窓の比率を拡大

窓の情景を画面の約7割へ拡大。室内は下端と両端に抑え、人物は後ろ姿を維持。v2は保存済み。組み込み画像生成ツールで編集。

- [縁](b-spring-enishi-v3.png)
- [凜](b-spring-rin-v3.png)
- [卓](b-spring-suguru-v3.png)

構図確認用のラフ。各画像の窓枠・リンク座標は厳密には一致しないため、実装時に共通化する。

## 共通生成プロンプト

```text
Edit this ennui website illustration to strongly increase OUTDOOR WINDOW VIEW relative to interior. Single wide landscape 16:9. Redesign common framing for all three variants: window outer frame at x=8% to98%, y=7% to85%, central vertical mullion at x=55%; only narrow left wall and a shallow strip of floor at bottom. Window landscape occupies about 70-75% of entire image. Preserve a small 'ennui' wordmark top left in header margin; ABOUT CONTACT top right in same margin, bottom Track / T-Tracker / B-fit links on slim floor strip. Window is physical architecture, not decorative UI card. Lower sill near 85% image height. Scale people down and place at lower right, seen ONLY FROM BEHIND, maximum 25% image height; still clearly human. Furniture few thin contours along bottom/edges and not blocking window. Eliminate big blank foreground floor and broad left wall. Spring monochrome sparse thin contour lines white background, no shading, hatching, color, no sun/moon/weather icons. Preserve person's identity and scene-specific outdoor perspective, simplify line count and cherry foliage. Window geometry and composition must follow these same precise proportions for series. 
```

人物別指定：縁は庭と通り、漫画・ランドセル・テレビ・虫取り網。凜は5階から街を見下ろし窓際でスケッチ。卓は低層の海辺で木肘チェアに座って本を読む。全員春の日中、顔は見せず、太陽・月は描かない。

