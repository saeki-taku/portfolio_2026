# 夏・晴れ PC 植物／カップ独立切替 v3 実装

2026-10-25。既存worktree `/Users/saekitakuya/.codex/worktrees/e84c/ポートフォリオ` の未コミット変更を保持したまま、夏・晴れPCの明け方・昼・夕方・夜在室・就寝後を確認用v3素材へ切り替えた。SP、春、他季節・天気、元v1/v2素材には変更を加えていない。コミット・プッシュ・本番公開なし。

確認URL: http://127.0.0.1:4512/ 。「シーン設定」→手動→夏・晴れを選び、PC画面で「カップと連動下地」「鉢植えと連動下地」を個別に操作する。人物在室の3時間帯では「凛・手元」も独立。人物とカップの両方がONの時だけ元画の重なり復元層を表示する。

素材引き継ぎ: `/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/summer-pc-object-groups-handoff.md`。v3 manifestの順序どおり、全層1345×1170、原点(0,0)で重ねる。植物グループは `03-plant-scene-underpaint.png` と `04-indoor-plant.png`、カップグループは本体・接触影・前景。OFF時の窓・壁・窓台はv3の外景・室内層に補完済み。素材は元フォルダからハッシュ一致で取り込んだ。

検証結果:

- `npm run check`: 0 errors / 0 warnings / 0 hints。`npm run build`: 成功。
- `node scripts/verify-summer-pc-object-groups.mjs`: PC 1440×900・1920×1080で全5時間帯・人物／植物／カップの有効な32状態を検査し、各状態を撮影。グループ層と条件付き復元層の表示状態、旧シーン残留なし、ブラウザ例外なし。
- `node scripts/verify-summer-five-scenes.mjs`: 夏5時間帯をPC 2画面比率・SP 2画面比率で確認。全レイヤーの座標一致、人物・カップ操作、シーン切替、反対viewport素材の不要取得なし。
- `node scripts/verify-spring-final.mjs`: 春15シーン×PC/SP回帰成功。
- 代表画像の目視: 昼の全ON・植物OFF・カップOFF・両OFF、夜在室の両OFF、就寝後の両OFF、明け方の植物OFF／カップONを確認。小物の残像、外景の縞、透明穴、配置ずれは目立たない。素材側の全32状態にも透明穴なし。v3全ONとv2全ONの差は植物周辺で最大1階調。

スクリーンショットは `artifacts/summer-pc-object-groups/`。例: `pc-standard-summer-day-sunny-rin-on-plant-on-cup-on.png`、`pc-standard-summer-day-sunny-rin-on-plant-off-cup-on.png`、`pc-standard-summer-day-sunny-rin-on-plant-on-cup-off.png`、`pc-standard-summer-day-sunny-rin-on-plant-off-cup-off.png`、`pc-wide-summer-night-sunny-awake-rin-on-plant-off-cup-off.png`。SP回帰は `artifacts/summer-five-scenes/`、春回帰は `artifacts/spring-final/`。

素材上の制約: 植物の連動下地は元画保持のため、植物周辺の窓・外景も含む固定位置の復元層。鉢植えを動かすための独立スプライトではない。カップOFF時に見えるズボンと窓台も確認用の補完描画であり、各小物の移動・アニメーションには再検証が必要。
