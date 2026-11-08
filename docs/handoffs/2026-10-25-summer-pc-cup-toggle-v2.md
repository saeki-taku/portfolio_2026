# 夏・晴れ PC カップ単体切替 v2 実装

2026-10-25。既存worktreeの未コミット変更を保持し、夏・晴れのPC 5時間帯だけを確認用素材v2へ切り替えた。SPと春15シーン、既存v1素材、他季節・天気・本番公開には触れていない。コミット・プッシュなし。

確認URL: http://127.0.0.1:4512/ 。シーン設定を「手動」→「夏」「晴れ」とし、時間帯を選択する。PCの「カップ」をOFFにするとカップ本体・前景・カップ由来の接触影が一緒に消える。昼・夕方・起きている夜では人物切替とも独立。人物とカップの両方がONのときだけ、元画の重なり復元層を表示する。

素材の引き継ぎ: `/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/summer-pc-cup-toggle-handoff.md`。新規v2のmanifestに記された重ね順とconditionalLayersをそのまま使用。全層1345×1170、原点(0,0)。元v1・SP素材は変更なし。

検証:

- `npm run check`: 0 errors / 0 warnings / 0 hints。
- `npm run build`: 成功。
- `node scripts/verify-summer-five-scenes.mjs`: 夏5時間帯、PC 1440×900・1920×1080、SP 393×852・768×1024を確認。カップ全層と人物との条件付き復元層のON/OFF、座標一致、シーン切替、反対viewport素材の不要取得なし、ブラウザ例外なし。
- `node scripts/verify-spring-final.mjs`: 春15シーン×PC/SP回帰成功。
- PCスクリーンショットを目視。昼・夕方・明け方・起きている夜・就寝後のカップOFFで、マグ本体、グラス、カップ由来の影の明瞭な残像は見えない。昼の人物ON/OFF×カップON/OFFでも窓台と人物の大きさ・配置が保たれた。2つのPC画面比率で位置ずれなし。

画像例:

- 昼PC 1440×900: `artifacts/summer-five-scenes/pc-standard-summer-day-sunny.png` (ON)、`pc-standard-summer-day-sunny-no-cup.png` (カップOFF)、`pc-standard-summer-day-sunny-no-rin.png` (人物OFF)、`pc-standard-summer-day-sunny-no-rin-no-cup.png` (両方OFF)。
- 夜在室PC 1920×1080: `artifacts/summer-five-scenes/pc-wide-summer-night-sunny-awake-no-cup.png`。
- 全ケースの画像は `artifacts/summer-five-scenes/`。

素材上の制約: 人物ありのカップONはv1原画と画素完全一致ではない。差分は昼385、夕方353、夜在室322画素で、カップ周辺だけに限られる。カップOFF時に見えるズボン・窓台は補完描画であり、拡大やカップ移動の検討用ではない。
