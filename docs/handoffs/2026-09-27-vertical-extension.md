# 上下拡張版v1の実装

担当Codex、段階2。branch codex/ennui-stage2-baseline。開始HEAD b725506、開始時変更なし。

## 素材・処理

ユーザー指定のPC/SP上下拡張版とvertical-extension-v1.jsonを無加工コピー。Notionの拡張版記録も読み取り確認。
PC1533x1334、sourceRect(0,103,1533,1026)。SP1024x1997、sourceRect(0,154,1024,1536)。sharpで元領域のRGB全画素が採用済みPC v8/SP v3と同一であることを再検証。
再生成、色補正、境界ぼかしなし。既存雨風等の演出はトップに存在しないため再配置対象なし。夜雨の旧素材も未使用。

## 表示計算

座標JSONをAstroで読み込みCSS変数に換算。倍率s=画面幅/sourceRect.width。画像描画高=canvas.height*s。フレーム高H=max(100svh,最低高さ,sourceRect.height*s)、最低高さPC600/SP680。
余剰高E=max(0,H-sourceRect.height*s)。上の表示量T=min(padding.top*s,E*padding.top/(padding.top+padding.bottom))。画像上端=T-sourceRect.y*s。元領域上端=T。
基準比率ではT=0で元画角と位置が一致。縦長になると上下追加領域を約1:2で表示する。窓・人物は縮小せず元領域内相対座標を保持。ロゴもTだけ追従。これは画面寸法への適応でありスクロールパララックスではない。
追加領域を使い切ると下に背景色が残る。メニューは下部固定。WebPレスポンシブ画像の縮小後もCSS座標は同じ倍率で換算。

## 検証

npm run check:18ファイル診断0。npm run build成功。
ENNUI_TEST_URL=http://127.0.0.1:4499 npm run test:local:8サイズ、導線等成功。
node scripts/verify-extension.mjs:RGB画素一致、PC/SP基準寸法とPC・SE・縦長・小型スマホで倍率、縦横比、元領域の非クリップ、座標、読み込む絵が1枚のみであることを検証。
差し替え前スクリーンショットをartifacts/*-before-extension.pngへ保存、PC1440x900・SE375x667・縦長430x932を差し替え後と比較。倍率不変、ロゴは壁内、人物と窓の過度な見切れ・横スクロールなし。
SE元領域上端39.25px、縦長430px幅は64.67px（上追加全量）、PC基準1533x1026は0px。境界には元素材の質感差が見える、未補正。実機Safari未検証。本番公開なし。

プレビュー http://127.0.0.1:4499/
次は境界の見た目をユーザー確認。段階3以降未着手、Claude編集担当未追加。
