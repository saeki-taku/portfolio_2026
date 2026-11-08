# SP夕方 縦長レイヤー v1

実装引き渡し可能な検証済み候補。1024×2400px、RGBA、左上原点(0,0)。全9層をmanifest.jsonのlayersBottomToTop順で同一矩形に重ねる。各層を個別に切り詰めたり移動したりしない。人物の追加位置補正は不要。

## 表示切替

- 人物: rin-contact-shadow.pngとrin.pngを同時切替。
- カップ: 05-cup-contact-underpaint.png、06-cup-body-underpaint.png、09-cup-foreground.pngを同時切替。
- 植物: 03-plant-scene-underpaint.png、04-indoor-plant.pngを同時切替。

局所的な下地は対象物に連動。昼の人物下地07/08を夕方セットへ持ち込まない。

## 確認結果

- 全9層が1024×2400 RGBA。
- 了承済みsp-day-tall-layers-v1の室内/窓枠alphaと完全一致。ガラスマスクも全チャンネル一致。色調は夕方専用。
- 元候補sp-evening-tall-candidate-v1/preview-tall.pngと再合成は完全一致。
- 人物ON、人物OFF、人物/カップOFF、人物/カップ/植物OFFの4プレビューを再合成し、すべて差分0、非不透明画素0。
- 人物・足・カップ・植物の境界を原寸で確認。目立つ欠けや人物OFF残像なし。
- manifestに記載されていた未作成のinspection-plant.png、inspection-person-cup.png、inspection-no-rin-cup.pngを既存合成から切り出して追加。絵の再生成なし。

詳細はverification.jsonおよびfinal-check.json。既存採用画像・元候補・9層・合成プレビューは変更していない。

## 実装上の制約

glass-mask.pngは輝度マスク（白=ガラス内、黒=除外）。alphaマスクとして解釈しない。昼と同位置であることは検証したが、雨やガラス滴の合成順・前景下地による遮蔽は今回未検証。雨対応済みとは扱わない。

画像は2400px高。旧1997px高の夜・就寝後・曇り・雨セットにそのまま共用しない。ロゴ/メニュー、object-fitや表示領域、セーフエリア、端末上での切れ方、昼夕方切替はサイト実装後に確認する。

再構築コマンドはmanifest.buildを参照。今回の完了確認では再構築を行わず既存成果を検証した。
