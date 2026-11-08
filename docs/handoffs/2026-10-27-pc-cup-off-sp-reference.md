# PCカップOFFの布・足元・窓台の確認用改善

2026-10-27。既存worktree `e84c/ポートフォリオ` の未コミット変更を保持した。承認済みSPの布と足の接地を視覚参照に、PC春・昼・晴れおよびPC夏・晴れの人物あり3時間帯（昼・夕方・起きている夜）だけを改善。春PCの人物OFF・カップOFFでは、従来の室内下地に焼き込まれたカップも消した。PCの人物姿勢・足位置とカップONは維持。SP画像、他季節・天気、夏明け方・就寝後の表示、原本は変更していない。

画像制作側の正本引き継ぎは `/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/pc-cup-off-sp-reference-handoff.md`。実装では新素材を `src/assets/validation/` に複製し、春は `pc-spring-day-sunny-cup-off-layers-v2`、夏の晴れ5シーンはPCの `v5` を参照する。春のv1と夏のv4、採用原本は保持した。

## レイヤー条件

- 春PC `02a-cup-off-sill-clean.png` は室内の直後、凛の前。カップOFFのとき人物の有無にかかわらず表示し、窓台のカップ本体を消す。
- 春PC `10-cup-off-sp-refine.png` は凛とカップ前景の後。凛ON・カップOFFでのみ表示し、布の下端を修復する。
- 夏PCの昼・夕方・起きている夜は各 `11-cup-off-sp-refine.png` を既存の `10-cup-off-repaint.png` の上に置き、凛ON・カップOFFでのみ表示する。植物とカップの独立切替は維持。
- 全修復層は1345×1170、左上原点で各シーンと同一矩形。春の人物は既存の別スプライト位置を維持。

## 画面確認

- 春PC: `artifacts/spring-pc-cup-off-refine/` に1440×900と1920×1080の凛/カップ4状態、計8枚。`standard-rin-on-cup-off-detail.png` で布・足元、`standard-rin-off-cup-off-detail.png` で空の窓台を確認。窓枠、足位置、ノート、植物に目立つ破綻なし。春PCカップON全画面は修正前の `artifacts/pc-cup-quality-review/spring-day-standard-cup-on.png` とSHA-256一致。
- 夏PC: `artifacts/pc-cup-sp-reference-final/` に1440×900の昼・夕方・夜在室のカップON/OFF全画面と拡大。`pc-summer-day-sunny-cup-off-detail.png`、`pc-summer-evening-sunny-cup-off-detail.png`、`pc-summer-night-sunny-awake-cup-off-detail.png` で布のドレープと窓台の接続を確認。カップON拡大はv4時点の撮影画像とSHA-256一致。
- 夏の人物/植物/カップ全32状態をPC 1440×900・1920×1080で検証済み。春PC 4状態×2画角も検証済み。凛OFFで修復層が残らず、カップOFFでカップ本体・前景を隠し、植物は独立して切り替わる。
- SPは素材・実装を変更せず、夏SPカップON/OFF拡大は修正前の撮影画像とSHA-256一致。春SPの専用検証と春15シーン・夏5シーンの回帰検証も成功。

今回再確認した `npm run check` は69ファイルでエラー/警告/ヒント0、`npm run build:dev-preview` 成功。最新の `ENNUI_SCENES=summer-day-sunny node scripts/verify-summer-five-scenes.mjs` は夏昼のPC/SP4画角で成功。既に実行済みの `npm run build`、春PC専用・夏5シーン・春15シーン・春SP専用の各検証も成功。`git diff --check` 成功。`http://127.0.0.1:4512/` はHTTP 200で、シーン設定から手動選択できる（ローカルサーバー起動中のみ）。

素材の補修は状態ごとの静的な局所上塗り。今後、人物やカップの位置、姿勢、視点を変更すると再制作が必要。コミット・プッシュ・本番公開は実施していない。

## 次の検討：PC/SP凛の共通化見本

ユーザーは「まず一つ見本」を承認。画像担当に、承認済みSP凛をPC春・昼・晴れのカップOFF全景へ置く確認用合成1枚を依頼済み。見本は未受領・未採用であり、今回のPCカップOFF局所補修とは別の検討。見本のユーザー確認前にサイトへ組み込まず、PC/SP素材やコードも置き換えない。現在の局所補修と検証結果は保持する。
