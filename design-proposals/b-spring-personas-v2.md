# 春ラフ v2

Notion更新方針：窓の外を主役にし、室内の家具・小物を控える。人物の顔は正面を見せず、よくても横顔まで。今回は全員後ろ姿で表現。v1は保持。

- [縁](b-spring-enishi-v2.png)：床座りで漫画を膝に置いて窓を見る。
- [凜](b-spring-rin-v2.png)：窓向きの机でスケッチ。
- [卓](b-spring-suguru-v2.png)：海向きの木肘チェアで本を手に過ごす。模型の種類は仮。

組み込み画像生成ツールで各v1を編集。窓の厳密な座標統一は実装時に共通レイアウトで行う。

## 共通編集プロンプト

```text
Edit supplied ennui spring room illustration. NEW ART DIRECTION IS MANDATORY: the OUTDOOR VIEW is the main focus. Dramatically simplify indoor furniture and props; reduce interior line marks 75 percent. Character must be seen FROM BEHIND facing the window; NO FRONT FACE, NO THREE-QUARTER FRONT FACE, NO eyes visible. Person smaller, quietly integrated, not a portrait. Sparse delicate monochrome contour line drawing on pure white. No shading, hatching, textures, color. Keep exact existing architectural window dimensions, mullion position, wall/floor geometry, lowercase ennui, ABOUT CONTACT and bottom Track / T-Tracker / B-fit links. No sun, moon, weather icons. Spring daytime, sparse cherry blossoms outside, few drifting petals OUTSIDE only. Simplify outdoor detail too but retain clear sense of place, no dense individual leaves. Leave substantial blank floor, do not fill every corner. 
```

