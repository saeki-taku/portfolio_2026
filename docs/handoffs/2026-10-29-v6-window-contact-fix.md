# v6の足と窓下枠・窓台の接地修正

2026-10-29。ユーザーの「足が窓に突き刺さっている」という実表示指摘を受け、春・昼・晴れPC/SPのv6のみを再確認した。原本、v6人物PNG、右足が左足の後ろに隠れるポーズ、カップ/植物素材、他時間帯・季節は変更していない。

## 原因と修正

- PC/SPとも採用見本の人物画素とサイトの人物画素は同じ。全レイヤーの位置登録、表示順、人物OFF時の旧下地や影に誤りはなかった。見本自体で足先が窓の下枠へ近く、PCでは接地影も下枠寄りだったため、画面縮小時に足が枠へ刺さるように見えた。単なる検証通過ではこの距離を評価していなかった。
- v6の人物形状・姿勢には触れず、春昼晴れのPC人物とPC接地影を元画像座標で下へ8px、SP人物を下へ11px表示。透明PNGはそのまま、CSSで全人物画像を等しく移動した。つま先とかかとの下に窓台上面が見え、腰は窓台前面の縁より上に残る。人物だけを切り貼りしたり足を再描画していない。
- カップON/OFFでカップの前後関係を確認。PC影は人物と同じ移動量で追従し、人物OFFで消える。SPの既存 `07-rin-occluded-underpaint.png` はカップON・人物ON時のみに残し、位置は固定。植物切替とカップOFF窓台補修は従来どおり。

## 比較と検証

左が修正前、右が修正後の同寸法画面切り出し: `artifacts/spring-day-v6-contact-investigation/pc-before-after-contact.png`、`sp-before-after-contact.png`。全景比較: `pc-before-after-full.png`、`sp-before-after-full.png`。PC/SPの2画角それぞれの最終全景・足元近接、人物/カップ/植物8状態は `artifacts/spring-day-shared-rin-v6/`。

近接ではPC 1440×900・1920×1080、SP 393×852・768×1024で、足先・かかとが窓下枠から離れて水平な上面に乗り、腰が前面へめり込まないことを目視確認。`node scripts/verify-spring-day-shared-rin-v6.mjs` は8状態×4画角を通過し、指定した人物/影だけに移動量が適用され、他レイヤーは元の同一矩形にあることを確認。`verify-spring-final.mjs` は春15シーン×PC/SP、`verify-summer-five-scenes.mjs` は夏晴れ5シーン×PC/SPで通過。`npm run check` は70ファイルでエラー/警告/ヒント0、`npm run build` と `npm run build:dev-preview` 成功。`git diff --check` 成功。

確認URLは `http://127.0.0.1:4512/`（ローカルサーバー起動中のみ）。コミット・プッシュ・本番公開は未実施。
