# SP就寝後 縦長レイヤー v1

実装候補。全8層は1024x2400px RGBA、左上原点(0,0)。`manifest.json`の`layersBottomToTop`順に同じ矩形で重ね、レイヤーを切り詰めたり個別に移動・拡大縮小したりしない。

元素材は`sp-spring-night-asleep-layers-v1`（1024x1997）。人物と読書灯はなく、街の窓・街路の点灯は起床中の約10%に減っている。暗色一枚を被せたものではなく、建物と公園の輪郭を保った既存の明暗設計を継承した。植木鉢とカップは窓台に残す。

## レイヤーと切替

- `01a-city-lights.png`は外景の上、室内窓枠の下に置く。起床中の街灯りレイヤーに差し替えない。
- カップは`05-cup-contact-underpaint.png`、`06-cup-body-underpaint.png`、`09-cup-foreground.png`をまとめて切替。
- 植物は`03-plant-scene-underpaint.png`、`04-indoor-plant.png`をまとめて切替。
- この状態には人物レイヤーも人物影もない。`preview-no-rin-with-cup.png`は整合確認用で、全体プレビューと同じ絵。

`glass-mask.png`は輝度マスク（白=ガラス、黒=除外）で、alphaマスクとして解釈しない。

## 制作・検証

- 昼・夕方・起床中の夜と同じ縦長構図。元画像のy550..1996を+250px移動し、新しい空y530..799と床y2247..2399だけを主に補完。生成ガイドは`../sp-night-asleep-tall-candidate-v1/inputs/generated-infill-guide.png`、使用プロンプトは同候補の`prompt.txt`。街並み、公園、鉢植え、カップを生成画像に差し替えていない。
- 全8層の寸法・チャンネルを検証。昼・夕方・起床中の夜の窓枠/外景alphaとガラスマスクは画素差0。4表示状態の再合成は差分0、非不透明画素0。
- 街灯りのalpha画素は起床中19,401に対して就寝後1,916（9.88%）。元の就寝後レイヤーからの座標移動以外の変更は0。
- 縦長候補と分離素材の再合成には3,120チャンネル、最大1階調の差がある。これは元の1997px就寝後8層を重ね直しても生じる同数・同階調の丸め差で、新しい絵の変更や欠けではない。
- 空/床の継ぎ目、植物、人物のいない窓台を原寸で確認。`inspection-plant.png`、`inspection-empty-sill.png`および候補側の`inspection-sky-joins.png`、`inspection-floor-join.png`を参照。`compare-awake-asleep.png`は左が起床中、右が就寝後。

詳細は`verification.json`と`final-check.json`。`node ../verify-sp-night-asleep-tall-v1.cjs`で静止画の数値検証を再実行できる。

## 制約

元の就寝後素材はreview-candidateであり、この縦長版も確認用の実装候補。サイト実装、端末のセーフエリア、時間切替、曇り/雨の照明は未検証。PC就寝後版も読書灯は消えており、現時点で追加修正は必須に見えない。ただしPC/SPとも右窓台の淡い方向性のある外光・影は残る。完全に影のない消灯表現を求める場合は、両方の絵を別途確認する。
