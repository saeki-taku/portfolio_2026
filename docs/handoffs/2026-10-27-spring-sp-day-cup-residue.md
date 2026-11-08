# 春・昼・晴れ SP カップOFF時の灰色の残像

確認URL: http://127.0.0.1:4512/

ユーザー指摘の足元の灰色のカップは、春・昼・晴れSPの `07-rin-occluded-underpaint.png` に含まれていた。前景のカップグループをOFFにしても、この人物グループの補完層が残ることが原因。カップ機能全体の廃止はしていない。

確認用サイトで当該レイヤーに `rin:true, cup:true` の表示条件を付けた。布・足は `08-rin-notebook.png`、窓台は `02-interior-window.png` が維持するため、カップOFFではこの補完層を非表示にするだけで自然につながる。素材PNG、原本、他の春夏シーンは変更していない。

画像合成による8状態比較: 人物ON・カップOFFの2状態だけ3,629画素の局所差分（元画像座標 x=679..754、y=1573..1656）。植物ON/OFFによらず同じ結果。カップONと人物OFFの6状態は変更前と画素一致し、全状態でアルファ穴0。

ブラウザ検証: `node scripts/verify-spring-sp-day-cup-underpaint.mjs` がSP 393×852と768×1024で各8状態を通過。条件付き下地、人物・カップ・植物のグループ表示、横溢れなし、ブラウザエラーなしを確認。スマホのカップONスクリーンショットは修正前の `artifacts/spring-final/spring-day-sunny-sp.png` とSHA-256一致。カップOFFのタブレット拡大画像を目視し、灰色カップ残り・透明穴・足と布の接続不良は見えない。

回帰: `npm run check` 0 errors / 0 warnings / 0 hints、`npm run build` 成功、`node scripts/verify-spring-final.mjs` 春15シーンPC/SP通過、`node scripts/verify-summer-five-scenes.mjs` 夏5シーンPC/SP通過、`git diff --check` 通過。

比較: 修正前のユーザー画像 `/Users/saekitakuya/Desktop/contents/screenshots/スクリーンショット 2026-10-26 13.38.51.jpg`、修正後サイトの拡大 `artifacts/spring-sp-day-cup-underpaint/tablet-cup-off-detail.png`。全状態・2画面比率のサイトスクリーンショットは `artifacts/spring-sp-day-cup-underpaint/`。

承認範囲: 春・昼・晴れSPのこの1シーンのみ。夏5シーン、SPの他時間帯・天気、PC、季節API、素材原本は維持。コミット・プッシュ・本番公開はしていない。
