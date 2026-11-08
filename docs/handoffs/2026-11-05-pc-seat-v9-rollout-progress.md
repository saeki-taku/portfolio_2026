# PC窓台v9 他シーン展開：途中記録

追加対象19＝春14＋夏晴れ5。既存春昼晴れは完了済みで対象外。SP/未制作シーン/人物ポーズ共通化は対象外。

2026-11-05時点の検証済み追加反映：1/19（spring-evening-sunny）。既存春昼晴れを含め2/20。残18は画像担当Astraへ親が制作依頼済み。入力・inventoryは `/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/pc-seat-v9-rollout-inputs/`、出力受取先は同design-proposalsの `pc-seat-v9-rollout-outputs/`。

春夕晴れは組み込みImageGenで現行背景とv9形状を参照し、構造のみ編集。生成原本は `pc-seat-v9-rollout-generated/spring-evening-sunny-generated.png`。元背景の不変前面サンプルでRGB比率を求め色合わせし、v9構造変更領域のマスク（7px blur）で合成。カップ/植物周辺は滑らかに保護。最終背景は outputs/spring-evening-sunny-background-v9.png、再現コードは generated/integrate-evening-v9.mjs。人物/人物影/窓/街は既存のまま。生成による局所筆触差はある。

`src/pages/index.astro` にPC専用 `pc-seat-v9-rollout/*/*.png` の読み込みを追加。対象が存在するフォルダだけ02-interior直後へ02c-seat-v9-structureを挿入、その他ファイル名があれば下地の上書きに使える。SPフォルダには適用なし。画像キャッシュが古い同名を保持する場合のためstructure-final.pngを優先できる。現在の春夕晴れはこのfinal参照で最終合成を表示。

`verify-pc-seat-v9-rollout.mjs` はinventoryから全対象×PC2画角、有効なrin/cup/plant切替を列挙。現時点は ENNUI_SCENES=spring-evening-sunny で4状態成功（春夕晴れの既存有効操作は人物のみ）。標準/ワイドの全景と左右/座面近接を artifacts/pc-seat-v9-rollout/ に保存、最終表示で継ぎ目と接地を確認。

check：75ファイル、診断0。全19完成後に対象全検証とSP・春夏回帰を実施する。全件完了とは報告しない。

プレビュー http://127.0.0.1:4512/ はastro devの常駐PID54567で再起動。コミット/プッシュなし。

## 受領6枚の追加組込・検証（同日追記）

組込・機能検証済みは7/19（春夕晴れ＋受領6枚）。最終目視合格は1/19のまま。受領6枚は spring-dawn-sunny / spring-dawn-cloudy / spring-day-cloudy / summer-day-sunny / summer-dawn-sunny / summer-evening-sunny。manifest complete の実ファイルを現行背景と比較し、変更画素のみ02c-seat-v9-structure.pngへ抽出。人物・既存ON/OFF・SPは保持。

PC2画角×有効切替48状態通過。夏3枚はカップOFFかつ無人物時の旧前縁残りに対し、同シーンの隣接座面画素を使う羽根付き下地を追加し40状態再確認。人物ON専用の追加下地は不自然な矩形になるため採用せず削除、従来補修を維持。

重要な未解決：受領背景のカップ保護矩形に旧窓台前縁が残る。特に夏明け方カップONで明確な段差になるため、この6枚を完成とはしない。画像担当へ保護領域の再仕上げを親経由で依頼。証拠は artifacts/pc-seat-v9-rollout/wide-summer-dawn-sunny-all-on-seat.png。

check75ファイル診断0、build/build:dev-preview成功、春15シーンPC/SP・夏対象3シーンPC/SP回帰成功、git diff --check成功。全景・近接は artifacts/pc-seat-v9-rollout/standard-{scene}-{all-on|all-off|cup-off}.png と wide-*、左右近接は -left/-seat。6枚一覧は received-six-wide-contact.png。

再現用スクリプトはworkspace design-proposals/pc-seat-v9-rollout-generated/import-seat-ready.mjs と repair-rollout-cup-off.mjs。後者は人物OFFだけを対象に保存修正済み。未受領12枚（うち3枚saved-awaiting-visual-review）は取り込み保留。

## 2026-11-06 再開後

最新は2026-11-06-pc-seat-v9-rollout-final.md。18素材再取り込み、SHA/差分復元完全一致、19×PC2画角108機能検証成功。進行役近接17/19合格、夏夜2の無人物cupOFF残像/就寝cupON矩形を修正再撮影中。最終全件合格は保留。過去記録は履歴として保持。
