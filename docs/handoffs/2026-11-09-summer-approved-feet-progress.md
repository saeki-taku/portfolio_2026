# 夏の足・裾を春承認正本へ整合

ユーザーが形/裾も春へそろえると承認。main design-proposals/summer-rin-approved-feet-v1/{day,evening,night-awake}-candidate.png をimagegen生成、親目視済み。時間帯3つは従来もalpha同一で同姿勢、色調のみ相違。昼/夕/夜の照明を別生成で保持。

PC:幅418等比、left892 top405+14。SP:幅557等比、left464 top1177+11。春正本の登録と同じ。scripts/build-summer-rin-approved-feet.mjsでsrc/assets/validation/summer-rin-approved-feet-v1へSHA名PNG出力。
makeSceneLayersで夏人物3時間帯のみ適用。旧03/08人物、03a/10/11復元、SP07/06旧杯周辺布、PC旧影とrin-on補修を除外。PCrin-off cup-free下地を共通下地として新人物・カップを重ねる。新人物はrin制御。SP床延長やPCv9は保持。
春接触影をPC14pxとSP同等比変換で追加。scripts/build-summer-approved-shadow.mjs。

最終実装: SP09左縦帯はimagegen `sp-cup-alpha-source.png` を元RGB保持・alpha minで解消。元ROI x679,y1590,w63,h59。scripts/build-sp-summer-cup-cleanup.mjs。春接触影は元の細い暗灰線をPC14px/SP同等比+11pxで登録、親が昼PC/SP接地と灰白帯消失を目視合格。

検証実績（2026-11-09）:
- capture-summer-rin-approved-feet.mjs: 人物あり夏3×PC2/SP2×全8組合せ=96状態、人物/カップ/植物の表示assertと横溢れチェック、全景/近接保存。
- verify-pc-cup-cleanup.mjs: 夏人物3×PC2全48状態合格。
- verify-spring-final.mjs: 春15×PC/SP回帰合格。
- build/build:dev-preview合格。夏5×PC/SP回帰合格、check 85 files 0 errors/0 warnings/0 hints、git diff --check合格。
- プレビュー4512 HTTP200確認。

目視証拠: artifacts/summer-rin-approved-feet/final-review-{pc,pc-wide,sp,sp-tall}-{1,2}.png（全96状態）。代表全景は {pc,sp}-{day,evening,night}-mask-7.png、足元は同名-detail.png。昼影比較も pc/sp-day-cup-true-detail.png として保存済み。担当PC/SP標準の48近接は目視確認、親進行役も全8contact=96近接、およびPC夜/SP昼全景を独立目視し、足重なり・裾・接触影・カップOFF下地・SP旧縁消失を確認して合格。HTTP200も親が再確認。最終作業完了。

既存床延長、PC窓台v9、春正本、夏明け方/就寝の人物不在を保持。新しいポーズ追加なし。PC/SP夏人物と関連下地・SPカップ透過だけ更新。顔/ポーズは3時間帯同形という既存構成を維持。各時間帯の色は別生成。未コミット保持、commit/pushなし。
