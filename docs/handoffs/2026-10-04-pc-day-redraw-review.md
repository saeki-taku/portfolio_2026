# PC春・昼 凛の描き直し版：確認実装

2026-10-04。既存worktree `/Users/saekitakuya/.codex/worktrees/e84c/ポートフォリオ`。PC春・昼の確認用で、正式採用・コミット・プッシュ・本番公開はしていない。

## 確認先

- サイトのPC画角、HTMLロゴ・メニュー付き： http://127.0.0.1:4502/dev/pc-day-scene-redraw/
- 原寸、原本との切替、人物なし、各レイヤー： http://127.0.0.1:4502/dev/pc-day-redraw/

サーバー停止時は、`npm run build:dev-preview` の後に `npx wrangler dev --config dist/server/wrangler.json --port 4502 --ip 127.0.0.1` で再開する。既存の4501番プロセスには手を触れていない。通常build後にWranglerの資産配信が404になる場合は、自分の4502番プロセスのみ再起動する。

## 変更

- `src/assets/validation/pc-day-redraw-v1/`に、v4の01外景・02室内・05コップ、v4 README/manifest、新人物PNGを元フォルダから無加工でコピー。v4の旧03・04・06は描き直し版に読み込まない。
- `src/pages/dev/[scene].astro`に描き直し版のPCシーンを追加。描き直し版では01→02→新しい凛→05の順。人物OFFは新しい凛のみ隠し、コップを残す。ロゴとメニューは既存のHTML要素。
- `src/pages/dev/[preview].astro`に原寸比較ページを追加。v1/v2の比較機能は維持。
- 新人物PNGの実寸は1324×1188、不透明部分の範囲は元PNG内 x25..1300、y50..1167。原本のシーン1345×1170に対し、画像全体をx940.29、y455.48に置き、幅354.14・高さ317.76の等比表示とした。表示上の不透明部分はおよそx946.98..1288.01、y468.85..767.63。旧人物の目安範囲x947..1288、y467..768に近い。
- 個別レイヤーへの位置補正は行わず、新人物だけを元画像座標に合わせた。大きさと位置はシーンの親要素に対する百分率で保持するため、PC画面比率が変わっても同じ相対位置になる。
- `scripts/build-dev-preview.mjs` は今回のPNGも開発用ビルドの間だけ一時配置し、終了後に削除。通常buildに確認ページと新素材は含まない。

## 検証

- 新人物・v4 01/02/05のコピーは提供ファイルとSHA-256一致。読み込む4枚はそれぞれHTTP 200。
- `npm run check`：0 errors、0 warnings。`npm run build`：成功し、描き直し版の確認ページと素材は出力されない。`npm run build:dev-preview`：成功、確認ページとPNGが生成され、公開用一時配置は削除される。
- `node scripts/verify-pc-day-redraw.mjs`：成功。人物なしスクリーンショットはv4の01+02+05の参照合成と全画素一致。旧人物・旧影・旧輪郭復元の要素は描き直し版のDOMにない。
- 1920×1080、1440×900、1180×820、1024×900でサイト画角のスクリーンショットを撮影。新人物の矩形はシーン幅に比例し、外景・室内・コップの矩形は完全一致。横スクロールなし。768×1024のSP表示は従来の専用素材を維持。
- 既存の`node scripts/verify-pc-day-layers-v2.mjs`と`npm run test:local`も成功。

## 目視した状態・残課題

- 1440×900と原寸で、凛の足と腰は窓台に接して見える。05のコップは服より手前に重なり、コップ後ろの布がカップ形状で欠けない。ノート左端の外側は背景が見え、元PNGの透明余白が四角く残る状態ではない。
- 人物OFFで髪・服・足の形や旧人物用04/06の縁は見えない。窓台の色と遠景はv4背景のまま。旧03/04/06を流用していないため、この組合せで旧接触影が二重になることはない。
- 新しい独立影は今回追加しなかった。接地は現状の室内画素と人物輪郭で自然に見えるが、光学的な接触影の精度は未調整。髪など細い輪郭に明るい縁が少し見える。これは新PNG側に含まれる見え方で、CSSで隠していない。
- 描き直し版の服・髪の筆致は採用原本の人物と異なる。確認用として比較し、採用判断は未実施。

## スクリーンショット

`artifacts/pc-day-redraw/`（git無視対象）：`composite.png`、`no-person.png`、`original.png`、`scene-wide.png`、`scene-desktop.png`、`scene-tablet-landscape.png`、`scene-near-square.png`、`detail-notebook.png`、`detail-cup-seat.png`、`detail-hair-border.png`、`verification.json`。初期確認用の`*-first-pass.png`も同フォルダに保存。
