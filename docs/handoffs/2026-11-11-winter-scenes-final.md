# 冬20シーン・雪 — 最終検証

2026-11-10の承認から継続し、11月11日に最終検証。5時間帯×晴れ・曇り・雨・雪、PC/SP40セットを登録。秋完了bf61dddからの追加。旧途中結果は2026-11-10-winter-scenes-progress.mdに保存。

## 実装と素材

空室背景40枚はwinter-weather-v1のmanifest/SHAと一致。PC1345×1170、SP1024×2400へ登録（PC昼曇・昼雪1345×1169、SP明け方雪820×1919を含む）。外景と室内を分離し再合成の全画素差0。製品PNG408枚はすべてmanifest参照あり。

晴曇雨は積雪なしの冬枯れ、雪だけ屋外に薄積雪。春承認済み長袖・各時間帯姿勢・足裾、陶器カップ、白花鉢を独立レイヤーとして維持。明け方・就寝は人物なし。PCv9とSP床延長を保持。

雪は背景へ焼き込まず、ゆっくり落ち左右に揺れる円粒子として描画。雨筋・ガラス滴とは別。降雪量0でも積雪背景を維持。reduced-motionは静止、量を戻すと再描画。実配信の人物・小物alphaから生成したmaskで室内を遮蔽。PCは通常量の視認性を目視調整し、吹雪にならない粒数・半径を採用。

## 確定済み検証

- capture-winter-weather.mjs: 全20シーン×PC2/SP2、512有効状態。状態・画像decode・初期化完了・SP比率・床・エラーなしをassert。
- verify-winter-registration.mjs: 40セット完全性、20シーン完全性、背景再合成差0、全層寸法一致。
- verify-winter-precipitation.mjs: 雨雪10シーン×PC/SP×有効状態×0/100/200、384条件。実mask・描画外漏れ0、通常時移動、静止設定、量0復帰、天気往復、未制作雷雨の明示fallback。
- verify-winter-viewport.mjs: 全20シーン縦長SPの床延長・表示領域維持。
- verify-winter-early-selection.mjs: メイン初期化を保留し早期に明け方雨/雪を選択する2条件。初期化後に最終選択へ追随し、床・降水が正常復帰。
- 元背景40枚のSHA256を再照合し全一致。

## 目視

進行役: PC/SP標準全40実viewportを独立確認、全合格。初回SP明け方雨は初期化前撮影だったため修正版を採用。通常雪100/200の視認性も合格。

画像担当: PCwide全20シーン128状態×座面/植物、40contact（256領域）を独立目視、指摘なし。記録winter-source-records/pcwide-independent-qa.md。

実装担当: SPtall全20シーン128状態×座面/植物、40contactを目視、指摘なし。足・裾・接地、杯穴と底、植物輪郭、OFF下地、旧縁・矩形・灰片・残像を確認。雨雪の見える範囲は屋外に収まる。

証拠はartifacts/winter-weather/。capture-report.json=512、registration-audit.json=40、precipitation-audit.json=384、viewport-floor-audit.json=20、early-selection-audit.json=2。final-review-*は最終固定ソースの撮影。

## 残る範囲

冬雷雨は今回対象外。天気API接続は追加していない。粒子の動作/遮蔽はChromeによる実配信検査であり、全ブラウザ・実端末性能の網羅試験ではない。初回並行検証のtimeoutを成功扱いせず、ソース固定・単一ブラウザの全件成功で確定した。

## 既存回帰とビルド

verify-spring-final.mjs: 春15シーンPC/SP成功。verify-summer-five-scenes.mjs: 夏晴5シーンPC/SP成功。PREVIEW_ONLY=1 capture-autumn-weather.mjs: 秋15シーンPC/SP30代表成功。

verify-spring-approved-rain.mjs: 実配信9マスク成功。verify-summer-weather-rain.mjs: 48条件成功。PERIODS=day verify-autumn-rain.mjs: 48条件成功。verify-thunder-rin-absence.mjs: 不在32状態＋通常天気復元24状態、4画角成功。

npm run check: 119ファイル、error/warning/hint全0。npm run build成功。4512 HTTP200確認。Gitは冬成果一式を現在ブランチへ通常commit/pushする（force/mergeなし）。
