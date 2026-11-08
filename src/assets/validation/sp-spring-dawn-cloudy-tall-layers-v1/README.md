# SP春・明け方・曇り 縦長 v1

1024×2400px、左上原点(0,0)のレビュー候補。晴れ明け方 `sp-spring-dawn-tall-layers-v1` と同じ窓・街・公園・桜・室内・床・植物・カップ座標。凛は不在、室内灯OFF。ごく少数の街灯りだけ晴れ明け方から変更せず保持。採用・サイト実装は未実施。

built-in image_genの曇り夜明けガイドを`inputs/cloudy-dawn-guide.png`に保存。空の雲と広い光の傾向だけを使い、建物や窓枠を生成結果に差し替えていない。昼曇りの油絵の細かな筆致を夜明けの青灰色へ再照明し、桃色の晴れた朝焼けと床/窓台の方向性ある影を抑えた。`inputs/prompt.txt`参照。

`manifest.json`の8層を同じ矩形に重ねる。人物レイヤーは存在しない。植物は03/04、カップは05/06/09を各グループで連動させる。03の植物用下地は、晴れ明け方のalphaを維持し、RGBを直下の外景+室内の合成色に合わせた。植物の左側に矩形の色境界を出さないための処理で、04の花・葉・鉢は描き直していない。

`glass-mask.png`は白がガラスの輝度マスク。晴れ明け方、昼曇り、昼晴れ、夕方、夜起床中、就寝後の縦長セットと画素一致。透明穴、各層のalpha、街灯りの保持、明度は`verification.json`に記録。`preview-composite.png`、`preview-city-lights-off.png`、`preview-no-cup.png`、`preview-no-plant-cup.png`、空/窓台/植物の`inspection-*.png`、晴れ明け方と昼曇りとの3面比較で原寸確認できる。

元の晴れ/昼曇り素材は変更していない。時刻は暫定05:00–05:59 JST。曇りの採用判断、端末表示、実天気API、雨と他時間帯は別工程。再構築: `node ../build-spring-dawn-cloudy-v1.cjs`。
