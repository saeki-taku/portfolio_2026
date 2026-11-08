# SP夜（起きている）縦長レイヤー v1

実装候補。全10層が1024x2400px RGBA、左上原点(0,0)。manifest.jsonの`layersBottomToTop`順に同じ矩形で重ねる。レイヤーごとに切り詰めたり、個別の位置・倍率補正を加えたりしない。人物は採用済みの読書ポーズをそのまま登録している。

## 表示切替

- 人物: `rin-contact-shadow.png`と`rin.png`を同時切替。
- カップ: `05-cup-contact-underpaint.png`、`06-cup-body-underpaint.png`、`09-cup-foreground.png`を同時切替。
- 植物: `03-plant-scene-underpaint.png`と`04-indoor-plant.png`を同時切替。
- `01a-city-lights.png`は夜の外景の上、室内窓枠の下。人物やカップには連動しない。

局所的な下地は対象物と連動する。昼の人物下地07/08や旧1997pxセットのレイヤーを混在させない。`glass-mask.png`は輝度マスク（白=ガラス、黒=除外）で、alphaマスクとして解釈しない。

## 制作範囲と確認

- 元夜素材は`sp-spring-night-awake-pose-layers-v2`。追加したのは窓上部の空y530..799と床下部y2247..2399、および狭い継ぎ目の描画だけ。生成ガイドは`sp-night-awake-tall-candidate-v1/inputs/generated-infill-guide.png`、最終プロンプトは同候補の`prompt.txt`。
- 街・公園・凛・窓台・既存床はx方向の拡大縮小なし。元画像のy550..1996を+250px移動。人物、街灯り、植物、カップの元レイヤー画素・alphaは座標移動以外に変更なし。
- 全10層の寸法・チャンネル、昼/夕方縦長版との窓枠・外景alphaとガラスマスク、元候補と合成の画素一致を検証。差分はいずれも0。
- 人物ON/OFF、人物とカップOFF、人物/カップ/植物OFFの4プレビューを再合成し、いずれも差分0、非不透明画素0。人物OFF後の残像と人物・足・カップ・植物の境界を原寸で確認。
- 詳細は`verification.json`と`final-check.json`。原寸確認画像は`inspection-person-cup.png`、`inspection-no-rin-cup.png`、`inspection-plant.png`。空/床の継ぎ目は候補ディレクトリの`inspection-sky-joins.png`と`inspection-floor-join.png`。

## 未実施

これは静止画素材の準備で、サイト実装・端末表示・セーフエリア・時間切替・雨効果は未検証。就寝後の夜、曇り、雨は別工程。元の1997px素材と昼/夕方の縦長素材は変更していない。

再構築は`manifest.json`の`build`を参照。検証のみの再実行は`node ../verify-sp-night-awake-tall-v1.cjs`。
