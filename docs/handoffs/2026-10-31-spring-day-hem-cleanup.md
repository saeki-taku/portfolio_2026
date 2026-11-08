# 春・昼・晴れ：承認済み凛の10度室内向き・二重裾整理版

2026-10-31。ユーザーの「いい感じ！サイトに反映してみて」の承認に基づき、PC/SP双方に反映済み。実装は `/Users/saekitakuya/.codex/worktrees/e84c/ポートフォリオ`。既存未コミット変更を保持し、コミット・プッシュ・本番公開は行っていない。

## 正本と変更

正本は `/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/rin-10deg-hem-cleanup/rin-hem-cleaned-transparent.png`（1500×1400）。同フォルダのREADMEとfull-preview.pngを読み、目視確認した。SHA-256は `74eeac8ab1254a5bb8af55d95fe03f0287f219318cdeb334f7d2ea8f1056746d`。

旧参照は `src/assets/validation/rin-shared-right-foot-v6/rin-pc-transparent.png` と `rin-sp-transparent.png`。旧版を保持し、`src/pages/index.astro` の春昼晴れ人物だけ、新しい `src/assets/validation/rin-10deg-hem-cleanup/rin-pc-hem-cleaned.png` / `rin-sp-hem-cleaned.png` に変更した。SPの08-rin-notebook.pngというレイヤーキーは既存切替との互換のため保持。

新フォルダに正本をハッシュ一致で複製。Sharpのwidthのみ指定する等比縮小（Lanczos3）を用い、全原画像を透明キャンバスへ配置。PCは幅418、配置(892,405)、キャンバス1345×1170。SPは幅557、配置(464,1177)、キャンバス1024×2400。ラスタ寸法の整数丸めのみで、人物再生成・回転・局所切貼り・解剖形状変更はない。既存CSS接地補正PC下8px/SP下11pxを維持。独立再計算との全画素差は0。各派生のハッシュと変換は同フォルダ `provenance.json` に記録。

PC接地影は既存v6影を保持し人物と同時に切替。SPの既存07-rin-occluded-underpaint.pngは人物ONかつカップONのみ。旧PC人物・10-cup-off-sp-refine.pngの二重表示なし。カップと植物の下地・前景は変更せず、人物OFFで旧人物・影・裾が残らないことを確認。

## 今回の検証

- `node scripts/verify-spring-day-hem-cleanup.mjs`：1440×900、1920×1080、393×852、768×1024それぞれで人物/カップ/植物の8状態、合計32状態を通過。新しい配信画像名を明示assertし、今回の人物の表示、影/下地の切替、画像矩形と接地移動、横あふれなし、ブラウザエラーなしを確認。
- PC/SP各2画角の全景と足元、カップON/OFFおよび全OFFを目視。室内向きの上体とノート、右足首の一重の裾を維持。足先・踵・腰が窓台上面へ乗り、窓枠への刺さり・浮いた残像・二重人物は認めなかった。
- `npm run check`：71ファイル、エラー/警告/ヒント0。
- `npm run build`、`npm run build:dev-preview` 成功。
- `verify-spring-final.mjs`：春15シーン×PC/SP通過。
- `verify-summer-five-scenes.mjs`：夏晴れ5シーン×PC/SP通過。
- `git diff --check` 成功。

検証画像は `/Users/saekitakuya/.codex/worktrees/e84c/ポートフォリオ/artifacts/spring-day-hem-cleanup/`。32全景と8足元画像を保存。
代表画像：`pc-standard-rin-on-cup-off-plant-on.png`、`sp-phone-rin-on-cup-off-plant-on.png`、対応する `-feet.png`。広い画角は `pc-wide-`、タブレット画角は `sp-tablet-` 接頭辞。

確認URL： http://127.0.0.1:4512/ （シーン設定→手動→春→昼→晴れ）。ローカルサーバー稼働中のみ閲覧可能。

## 制約

新規季節・他時間帯への人物展開は対象外。既存PC植物OFFの局所補修画像や既存接地影は再生成していない。ラスタ縮小およびWebP配信による細部の補間差はあるが、同じ承認人物を両端末で使用。今回の反映・検証に未解決のブロッカーはない。
