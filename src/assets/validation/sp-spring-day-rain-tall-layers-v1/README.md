# 春昼・雨 SP縦長 v1

1024×2400、左上原点(0,0)。採用済み `sp-day-cloudy-tall-layers-v1` の窓・街・公園・桜・人物・鉢植え・カップ・床位置を維持した雨のレビュー候補。旧1997px雨案の雨天色を、曇り旧版との差分として縦長外景に適用した。追加された空帯は縦長曇り版の筆致を保持したまま周囲の雨色へなじませ、建物/人物を描き直していない。旧雨案と縦長曇り版は上書きしていない。

`manifest.json` の静止層を下から順に重ね、状態に合う屋外雨とガラス滴の2 PNGを最後に合成する。いずれも窓ガラス開口だけに切り抜き済み。植物・人物の**実輪郭**を1px広げて雨を除外し、窓枠・壁・窓台・床・髪・服・ノート・カップへ雨が乗らない。外気中の雨とガラスの滴は別素材。静止サンプルでありアニメーションは未制作。

旧案の問題だった `03-plant-scene-underpaint.png` は、ガラス内の23,687画素を透明化した。ここは雨外景が直接見え、矩形の下地は雨の遮蔽に使わない。`04-indoor-plant.png` の花・葉・鉢の実輪郭だけが雨を隠す。植物OFF時は `03` と `04` を同時に外し、雨効果も `plant-off-rin-*` に切り替える。人物OFF時は `07-rin-occluded-underpaint.png`、接触影、`08-rin-notebook.png` を同時に外して `rin-off` に切り替える。カップOFFは `05`、`06`、`09` を同時に外す。植物OFF/人物OFFを両方使う場合は `plant-off-rin-off` の効果を使う。

`glass-mask.png` は白=ガラスの**輝度**マスクで、昼・夕方・夜起床中・就寝後・夜明けの縦長版と画素一致。CSS等でalphaマスクが必要なら `rain-visibility-alpha-*.png` を使う。透過済み雨効果の各版とマスクは同一1024×2400で、トリミングや個別のCSS移動は不要。窓外景と室内のalphaも曇り縦長版と一致する。

確認: `preview-composite.png`、`preview-no-rin.png`、`preview-no-plant.png`、`preview-no-plant-no-rin.png`、`preview-no-cup.png`、`preview-rain-effect-off.png`、`compare-cloudy-rain.png`。植物ON/OFFの原寸拡大は `inspection-plant.png` / `inspection-plant-off.png`。空の接続帯は `inspection-sky-joins.png`、人物周辺は `inspection-person.png`。矩形の雨欠け・人物残像・雨漏れ・透明穴を確認し、機械結果は `verification.json` に記録した。

雨の量・線・滴の見た目は承認前。実天気APIや動的アニメーション、他時間帯は対象外。再構築: `node ../build-spring-day-rain-current.cjs`。
