# 春・昼・晴れのPC/SP共通凛 v6

2026-10-29。既存worktree `e84c/ポートフォリオ` の未コミット変更を保持し、承認済み `design-proposals/rin-shared-right-foot-v6/` を春・昼・晴れのPC/SPだけへ反映。原本・旧版・他シーンを上書きせず、コミット・プッシュ・本番公開は未実施。

## 素材と表示順

- v6の `rin-sp-transparent.png` と `rin-pc-transparent.png`、`pc-contact-shadow.png` を `src/assets/validation/rin-shared-right-foot-v6/` にSHA-256一致で複製。PC版はSP版の `(528,1237,468,412)` を75%等比縮小してPC `(940,450)` に置いたもので、再計算した全画素との差は0チャンネル。人物の形状・右足が左足の後ろに隠れる姿勢を共用するが、配信用PNG/WebPは画角と寸法ごとに別ファイル。
- PC: 外景→室内→植物OFF時だけ局所補修→カップOFF時だけ窓台補修→v6接地影→v6凛→カップ前景。旧PC凛スプライトと旧姿勢用 `10-cup-off-sp-refine.png` の表示を撤去。v6の人物/影は同じ `rin` 操作で切替。カップは従来の前景と連動下地を切替。
- SP: `sp-day-tall-layers-v1` の既存8層はそのまま、`08-rin-notebook.png` の描画元だけv6 SPへ切替。`07-rin-occluded-underpaint.png` は既存のカップON・人物ON時だけ表示し、人物OFFまたはカップOFFで消える。鉢植え・カップの既存下地を保持。
- PC植物は元の室内画像へ描き込まれていたため、`pc-spring-day-plant-off-v1/plant-off-repair.png` を新規作成。組み込みImageGenで鉢植えを除いた局所ガイドから、1345×1170の透過上塗りを作り、植物OFF時だけ表示。植物ON時の元画素は変更しない。窓枠、外景の建物、空の窓台を全景と拡大で確認した。これはv6人物の承認素材とは別の確認用補完で、将来の採用前に輪郭を再確認できる。

## 検証

- `node scripts/verify-spring-day-shared-rin-v6.mjs`: PC 1440×900・1920×1080、SP 393×852・768×1024で人物/カップ/植物の8状態、計32画面を検証・撮影。全レイヤー同一矩形、人物と影の同時切替、カップと植物の独立切替、旧PC補修の不在、ページエラーなし、横あふれなし。`artifacts/spring-day-shared-rin-v6/` に全景と各画角の足元近接を保存。
- 人物OFF・カップOFF・植物OFFのPC/SP全景は空の窓台になり、古い人物、影、カップの残像なし。カップONでは人物の前にカップが自然に残る。右足は左足の後ろに隠れ、腰・足先は窓台に接する。PCの植物OFF補完には拡大時に生成した建物筆致の差があり得るため、元の植物ONはそのまま保持。
- `npm run check`: 69ファイル、エラー/警告/ヒント0。`npm run build` と `npm run build:dev-preview` 成功。`verify-spring-final.mjs` は春15シーン×PC/SP、`verify-summer-five-scenes.mjs` は夏晴れ5シーン×PC/SP、`verify-spring-sp-day-cup-underpaint.mjs` は春SP8状態×2画角で成功。`git diff --check` 成功。
- ローカル確認用URL `http://127.0.0.1:4512/` はHTTP 200。右上「シーン設定」から手動・春・昼・晴れを選ぶ。サーバーが起動している間だけ閲覧可能。

主な確認画像: `artifacts/spring-day-shared-rin-v6/pc-standard-rin-on-cup-off-plant-on.png`、`pc-wide-rin-on-cup-on-plant-on.png`、`sp-phone-rin-on-cup-off-plant-on.png`、`sp-tablet-rin-on-cup-on-plant-on.png`、両端末の `rin-off-cup-off-plant-off.png`、対応する `-feet.png`。元のv6比較は `design-proposals/rin-shared-right-foot-v6/pc-feet-before-after.png` と `sp-feet-before-after.png`。

今後の夕方・夜・夏への人物共通化、ポーズ変更、アニメーションは今回の対象外。PC植物OFFは局所生成補完、人物のPC表示はSP原本からの決定的な縮小・配置であり、同じ配信用ファイルを両端末で使っているわけではない。

## ポーズ固定の決定

シーン設計台帳 `https://app.notion.com/p/3e40bce7ba7381caa29fd8a8bf21bcfe` の先頭に、PC/SP共通v6を「凛の基準ポーズ固定（承認済み）」として記録済み。左足が手前、右足が奥に隠れる重なりを保ち、素材補修や実装途中で別ポーズ化・足の再移動・旧版へ差し戻さない。変更が必要になった場合は比較と理由を示し、ユーザーの明示承認後に進める。PC/SPの差は等比縮尺・配置・接地影で扱う。

## 実表示の接地補正

同日、窓下枠へ足が刺さって見えるという表示上の指摘を受け、v6原素材とポーズを保持したまま、PC人物/影を下へ8px、SP人物を下へ11px表示した。原因・前後比較・最終検証は `docs/handoffs/2026-10-29-v6-window-contact-fix.md` を参照。前段の「接地確認」はこの修正後の最終結果で判断する。
