# 夏・昼・晴れ PC/SP素材の受け入れ

2026-10-23。Notionの「C22 盛夏・昼・快晴」は高い光、濃い葉、強めの屋外明暗、日中の人物、半袖、冷たい飲み物を指定する。現時点のNotion状態は「未検討」で、画像は採用前のレビュー候補として扱う。制作側の引き渡しは `/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/summer-day-clear-handoff.md`。

初回の外景候補は桜色の残りと斑点状の緑があり不採用。作り直した候補では桜が見えず、PCの人物周辺とSPのガラス境界の継ぎ目も修正された。PC `pc-summer-day-clear-layers-v1` は1345×1170の5層、SP `sp-summer-day-clear-tall-layers-v1` は1024×2400の9層。元の春素材のalphaと座標を継承し、人物とカップを独立切替できる。SPは植物も切替可能。静止した葉を将来の動き用に再分離する案はあるが、Lottie採用やアニメーションは今回実装しない。

`node scripts/verify-summer-day-assets.mjs` でPC/SP全14層の寸法、alphaの元素材との全画素一致、保護レイヤーのバイト一致、プレビュー寸法と透過穴0を確認した。引き渡しセットを元ファイルを変えず `src/assets/validation/pc-summer-day-clear-layers-v1/` と `src/assets/validation/sp-summer-day-clear-tall-layers-v1/` に複製し、SHA-256一致を確認した。ブラウザでPC/SP各3画角、人物・カップ・植物切替と春への復帰を確認する `scripts/verify-summer-day-clear.mjs` は用意した。

2026-10-24、ユーザーの明示指示により季節展開の制限を解除。夏・昼・晴れだけをPC/SPの確認用シーンとして登録した。手動設定から選べる。春の自動時刻切替、他の夏シーン、本番公開は変更しない。生成された街の細部は春と画素単位で同一ではなく、PC/SP間の細部一致と床影の物理的整合は採用前の目視判断が残る。低性能実機の負荷は未測定。コミット・プッシュ・本番公開は行わない。

確認結果：`npm run check` は58ファイルでエラー・警告・ヒント0、`npm run build` 成功。`scripts/verify-summer-day-clear.mjs` はPC 1440×900・1920×1080・1024×821、SP 393×852・320×568・768×1024の6画角で、同一矩形のレイヤー重ね、横あふれなし、人物・カップ・植物切替、春への復帰とブラウザエラーなしを確認。画面画像は `artifacts/summer-day-clear/`。人物なし画像では人物と接触影の残像がなく、カップと植物は残る。窓枠・窓台にも重ね順の破綻は見られなかった。`verify-scene-time.mjs` と既存の春15シーン×PC/SPの `verify-spring-final.mjs` も成功。確認URLは `http://127.0.0.1:4512/`（開発サーバー起動中のみ）。
