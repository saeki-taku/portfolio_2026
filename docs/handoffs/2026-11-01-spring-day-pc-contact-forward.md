# 春昼晴れPC：人物を少し室内側へ

ユーザーのPC足元と窓下枠の重なりへの指摘を受け、承認済みhem-cleanup人物と既存PC接地影のCSSだけを追加6px下へ移動した。元画像座標で従来8px→合計14px、translateYは0.6837607%→1.1965812%。1440px画角では追加約6.42画面px、1920px画角では約8.57画面px。姿勢・縮尺・人物素材・背景・カップは保持。SPはユーザーの「問題なさそう」に従い素材/配置/影すべて変更なし（従来11px）。

PC1440×900と1920×1080、カップON/OFFの前後全景・足元を比較。足先と踵の位置を下枠から離し、腰/裾は窓台前縁に収まる小さい移動量に留めた。前縁の余裕が小さいため、これ以上の平行移動は腰が前面にかかる可能性があり実施していない。人物と影は同量移動し、人物OFFで両方消える。カップは位置を維持し自然な前景として表示。

`node scripts/verify-spring-day-pc-contact-forward.mjs` でPC2画角・カップON/OFF・人物ON/OFFを確認、SP393×852は変更前後PNGのバイト一致を確認。比較は8pxと14pxを一時CSSで表示して同条件撮影。別途CSS上書きなしの実ページで、1440画角の画像高さ1252.625pxに対し人物移動量14.9887画面px（14/1170相当）を確認。最初の確認は非対象シーンで計測して失敗したため、春昼晴れを選択して再確認した。

`npm run check` は72ファイル・errors/warnings/hints 0、git diff --check成功。CSSのみの変更なので春夏全シーン・全ビルドは繰り返していない。既存 `verify-spring-day-hem-cleanup.mjs` のPC期待移動量を14pxへ更新した。

画像：`artifacts/spring-day-pc-contact-forward/` にPC/SPの before/after 全景・feetを保存。代表 `pc-standard-cup-off-before-feet.png`、`pc-standard-cup-off-after-feet.png`、`pc-standard-cup-on-after.png`、`sp-phone-cup-off-after.png`。

URL http://127.0.0.1:4512/ （手動→春→昼→晴れ）。ローカルサーバー稼働中のみ。コミット/プッシュなし。
