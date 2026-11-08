# 春PCカップ透過修正：最終検証完了

2026-11-08: 春15の元05 alphaは同形状。承認済みimagegen春カップalphaを80角に縮小し元alphaとのmin、RGB保持で組込。
春昼晴れは既存cupOFF下地を常時表示、人物層より下に保持。
他14は02-interiorに旧カップが焼き込まれているため、9照明群の局所下地をimagegenで生成。main design-proposals/pc-cup-edge-cleanup-v1/spring-underlaysに入力とclean保存。曇/雨は同RGBを共有。
生成下地は80角へ戻し、既存05 alphaの2px膨張で通常合成。手描きマスク/コード描画修復なし。02-interior直後、v9構造/人物より前に追加。
SHA付きPNGで出力。実装index.astro cup部分のみ変更。SP/人物/床延長は保持。

最終結果（2026-11-08 23:41 JST）：春15素材組込・実表示完了。親進行役がPC2画角の全30代表近接を独立目視し合格。担当は全組合せwide62状態も近接一覧で確認。

- `node scripts/verify-pc-cup-cleanup.mjs`: 春15+夏5、PC2画角、全124有効状態合格（春60/夏64）。人物・カップ・植物の有効切替、条件付き下地、横溢れ、pageerrorを確認。全状態の画像保存。
- `node scripts/verify-spring-final.mjs`: 春15×PC/SP合格。
- `node scripts/verify-summer-five-scenes.mjs`: 夏5×PC/SP画角合格。
- `node scripts/verify-spring-weather-phase4.mjs`: 7天候シーン×PC/SP計6画角、雨制御/遮蔽回帰合格。
- `node scripts/verify-spring-day-rain-integration.mjs`: PC/SP6画角、人物/植物/雨効果/天候切替合格。
- `npm run check`: 79 files、error/warning/hint各0。`npm run build`、`npm run build:dev-preview`、`git diff --check`合格。
- http://127.0.0.1:4512/ HTTP200確認。既存開発サーバー再起動済み。

目視証拠：`artifacts/pc-cup-cleanup-spring/review-spring-cup-{standard,wide}-{1,2,3}.png`（春全15代表近接）。全124状態は同dir `final-cup-states-{standard,wide}-seat-{1..6}.png` と個別PNG。

途中の黒矩形はキャッシュではなくSharp removeAlpha/joinChannelの実行順が原因。RGB出力を一度確定してから既存alphaを追加する2段階処理で修正し、保存/配信RGBAと実表示を再確認。未採用の途中画像は最終画像と区別すること。

制約：春14のcupトグルは従来通り無効（今回新機能追加なし）。夏3の既存接地影は保持。SP素材/レイアウト、人物形状、採用床延長に今回の変更なし。夏の凛足元は親の別作業で本記録の完了対象外。未コミット保持、commit/pushなし。
再開: scripts/build-spring-cup-cleanup.mjs, scripts/verify-pc-cup-cleanup.mjs。後者は既存19に春昼を加え、ENNUI_SCENES指定可。出力artifacts/pc-cup-cleanup-spring。
