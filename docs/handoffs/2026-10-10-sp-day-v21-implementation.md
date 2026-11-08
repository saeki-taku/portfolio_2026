# SP春・昼 v21 分離素材の組み込み

2026-10-10。採用された `design-proposals/sp-day-pose-v21/rin-transparent.png` を含む `design-proposals/sp-day-layers-v21/` の9層を無加工で `src/assets/validation/sp-day-layers-v21/` に複製した。SPのトップ表示は従来の一枚絵からmanifest順の重ね表示へ変更した。9層はすべて1024×1997、左上(0,0)登録で、個別の移動・拡縮・トリミングはしない。人物PNGのSHA-256は採用v21と一致する。

開発用設定のSP昼確認では、人物と連動下地07・08、カップと連動下地05・06・09、鉢植えと連動下地03・04をそれぞれ一緒に切り替える。通常表示はすべてON。旧人物と旧接触影は参照しない。PCの既存昼・夕方・夜、東京時刻切替、HTMLロゴ・ナビ、SPの上下拡張と画角計算は維持する。

複製したPNGをmanifest順にSharpで再合成し、人物あり `preview-composite.png` と人物なし `preview-no-rin-with-cup.png` の各色成分差が最大1であることを確認。ブラウザでは小型320×568、iPhone SE 375×667、標準390×844、縦長430×932、タブレット768×1024、正方形800×800で9層の位置一致・人物OFF・横はみ出しなしを確認し、PC 1440×900と境界801×800で従来のPC構図を確認した。スクリーンショットは `artifacts/sp-day-v21/`（Git無視対象）。

確認用コマンド：`npm run check`、`npm run build`、`npm run build:dev-preview`、`ENNUI_TEST_URL=http://127.0.0.1:4505 node scripts/verify-sp-day-v21.mjs`、`ENNUI_TEST_URL=http://127.0.0.1:4505 npm run test:local`。実機Safariは未確認。背景の人物・鉢植え裏は制作側の補完絵であり、PC/SP共通外景や夕方・夜へ流用できる確定素材ではない。植木・カップの連動下地は真の透明カットアウトではないため、個別移動やアニメーションに転用しない。

コミット・プッシュ・本番公開はしていない。
