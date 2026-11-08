# PC春・昼 分離素材v2 確認実装

2026-10-04。既存worktree `/Users/saekitakuya/.codex/worktrees/e84c/ポートフォリオ` で実施。v2は確認用であり正式採用ではない。コミット・プッシュ・本番公開は未実施。

## 確認先

- サイト画角・HTMLロゴとメニュー： http://127.0.0.1:4501/dev/pc-day-scene-v2/
- 原寸・個別レイヤー・透過背景： http://127.0.0.1:4501/dev/pc-day-layers-v2/
- v1比較ページは従来どおり： http://127.0.0.1:4501/dev/pc-day-layers/

ローカルサーバーを再起動する場合：

```sh
npm run build:dev-preview
npx wrangler dev --config dist/server/wrangler.json --port 4501 --ip 127.0.0.1
```

通常の `npm run build` はv2確認ページを生成せず、v2 PNGも配信出力に入れない。`build:dev-preview` は6枚の無加工PNGをビルドの間だけ `public/__ennui-review-v2/` に配置して出力し、終了後に一時配置を削除する。ビルド生成物 `dist/` はgit無視対象。既存のトップページは原本、SPは既存専用素材を継続表示する。

## 構成

- v2 PNGは提供フォルダから `src/assets/validation/pc-day-layers-v2/` にバイト単位でコピー。原本とv1 PNGを変更していない。
- 合成順はmanifestどおり 01→02→04→03→05→06。全レイヤーは1345×1170、同じ親要素の同じ矩形・原点。個別の位置、倍率、トリミング、色、影を調整していない。
- サイト画角ページは既存PCの `--layout-*` と同じ寸法計算を使う。ロゴとナビゲーションはHTML。PCの原本／v2合成と人物表示を切り替えられる。人物なしでは03・04・06を同時に隠し、05を残す。縦長画面ではSP専用画像を表示し、SP素材・画角の変更はない。
- 比較ページはv1ページの操作にv2を追加。原本／合成、人物まとめ切替、各レイヤー、透過確認背景、原寸スクロールを維持。v1素材のパス・バイト列は従来のまま。

## 検証

`npm run check`：0 errors・0 warnings。`npm run build`：成功し、v2確認HTMLとv2 PNGが出力されない。`npm run build:dev-preview`：成功、2つのv2確認ページとv2 PNGが出力され、一時配置は削除された。`npm run test:local`：既存9画面・導線を含め成功。`node scripts/verify-pc-day-layers-v2.mjs`：成功。v1の `verify-pc-day-layers.mjs` も成功。

- 元画像SHA-256はmanifestと一致：`79ec80f40edaab8476d92ba78a0e0e6092cc64932f43d93fe63503e64f67905b`。v2の6枚は提供フォルダのファイルとSHA-256一致。
- PNGの指定順合成と `preview-composite.png` は全画素一致。03・04・06を隠した合成と `preview-background.png` も全画素一致。
- 原本とv2合成は1,573,650画素中2,325画素が異なり、RGB平均絶対差は0.00907635/255。manifestと一致。ブラウザ描画と納品合成の差は半透明画素で最大1/255。ブラウザでの原本と人物なしは参照画像と全画素一致。
- 1920×1080、1440×900、1180×820、1024×900の画面で6レイヤーの表示矩形が完全一致。原本への切替時も同一矩形。横スクロールなし、ロゴ・メニュー表示を確認。768×1024の縦長画面では既存SP画像の表示を確認。

## 目視結果と残課題

通常のPC画角では、窓の四辺・下枠、凛の位置と姿勢、膝の後ろの青い屋根に大きな崩れや表示ずれは見えない。v2の06は人物ありの輪郭周辺だけを原本に近づける位置で重なり、人物なしの画面には残らない。人物なし画像に髪・服・足・影の大きな残像は見当たらない。

スケッチブックの縁、ペンと手の近く、カップの持ち手と服の重なりには小さな不一致が残る。カップ背後のスカートは引き続き未補完。原本との差分画素は右側の人物周辺 x923..1287 / y468..767 に集中する。これらは納品合成画像とブラウザ表示が一致していることから、表示位置のずれではなく素材側の残課題。CSSで隠していない。正式採用や人物の移動には追加の素材修正・確認が必要。

## 証跡

`artifacts/pc-day-layers-v2/`（git無視対象）：`original.png`、`composite.png`、`no-person.png`、`scene-wide.png`、`scene-desktop.png`、`scene-tablet-landscape.png`、`scene-near-square-pc.png`、`verification.json`。
