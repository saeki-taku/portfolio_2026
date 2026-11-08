# 2026-11-08 PC窓台v9展開 最終完了

追加19/19（春14＋夏晴れ5）を反映・検証完了。確認済み春昼晴れを含む既存20/20。以下の途中記録は履歴として保持し、この節を最新状態とする。

完成18素材のmanifest SHA一致・背景差分の完全復元を確認済み。最後に残った夏カップOFFの細線は最適化画像の古いキャッシュが原因で、v9 PNG参照を内容SHA付きファイル名へ変更。担当の配信画像照合でalphaMismatch=0、visibleRGBMismatch=0。PNGはv9 overrideに限定。

実装担当の最終実行：春14×PC2画角44状態＋夏5×PC2画角64状態＝108状態すべて成功。既存有効な人物/植物/カップの全組合せを含む。check76ファイル診断0、build/build:dev-preview、diff --check成功。春15PC/SP、夏5PC2/SP2、雨遮蔽・雨motionの回帰成功は下記実行済み記録を参照。

進行役は最新 review-1108-sha-summer-{standard|wide}-seat-{1..3}.png 全6枚を独立目視。夏明け方・昼・夕方の無人物cupOFF細線消失、夜2の矩形境界・残像なしを確認。前段で確認済みの春14・左接合/植物側と合わせ追加19/19合格。各時間帯の照明・色・影・人物在不在を保持。代表画像は artifacts/pc-seat-v9-rollout/final-1108-representative-scenes.png。

プレビュー http://127.0.0.1:4512/ は2026-11-08進行役HTTP200確認。SP・未制作シーン・人物ポーズ・Lottie/API変更なし。既存未コミット変更保持、checkout/commit/pushなし。夏の基本制作数は5/15のまま。

残制約：局所補完の筆触差、低性能実機負荷は未測定。可逆PNG化による資産合計増分は下記記録参照。今回承認範囲の未完作業なし。

---

# PC窓台v9 展開（2026-11-06 JST 実績・途中記録）

現行e84c worktreeを継続。既存未コミット変更保持、checkout/commit/pushなし。追加19＝春14＋夏晴れ5、既存春昼晴れを含む全体20。SP・未制作シーン・人物ポーズ・Lottie/APIは変更なし。

## 引継後に実行した内容

完成18枚を既存import-seat-ready.mjsで再取り込み。18/18 manifest SHA256一致、元背景＋02c差分から受領完成画像の全画素を完全復元一致。証拠 `artifacts/pc-seat-v9-rollout/final-source-audit.json`。春夕晴れは完了実装を保持。

夏カップONの旧背景矩形を実表示で発見し、既存のcup/plant下地へ各シーン自身の完成背景差分を同期。人物本体・元alphaと未変更カップcoreを保持。人物ON/cupOFF時の底輪郭も実表示で発見し、人物alphaを保護する局所の同シーン座面下地を追加。昼夕夜起床の両画角6枚は進行役が独立目視で修正確認。

再現スクリプト：`scripts/sync-seat-v9-object-underlays.mjs`。

## 実行済み検証（上限停止前の報告とは別の再実行実績）

- verify-pc-seat-v9-rollout.mjs：19シーン×PC2画角1440×900/1920×1080、合計108状態成功。全有効rin/cup/plant組合せ、全group表示・conditional下地条件・人物不在・overflow/pageerrorをassert。全状態全景/左右近接保存。
- verify-spring-final.mjs：春15×PC/SP成功。
- verify-summer-five-scenes.mjs：夏5×PC2/SP2成功。
- verify-spring-weather-phase4.mjs：春天気7×PC/SP計6画角、雨mask外漏れ0・切替成功。
- verify-spring-day-rain-integration.mjs：春昼雨PC/SP6画角、人物/植物/雨/晴曇切替成功。
- verify-rain-motion.mjs：PC/SP雨動画、固定mask遮蔽、人物/植物mask、強弱、reduced motion・非表示時停止成功。
- 最終修正前13:58 npm run check：76ファイル errors/warnings/hints全0。npm run build / build:dev-preview / git diff --check成功。
- http://127.0.0.1:4512/ は進行役もHTTP200を確認。既存astro dev PID54567を使用。

## 現在地：最終合格ではない

進行役が全14contact sheetを独立目視し、春14＋夏昼夕明け方＝17/19合格。夏夜2で無人物cupOFF時のカップ底/取手残像、夜就寝cupON時の矩形境界を発見したため全件完了保留。

修正実装：夜2へ欠けていた無人物cupOFF専用下地を追加。夜2の02a-cup-body-contactは元alphaを維持し、変更画素外の羽根付き境界も含め完成背景RGBへ全面同期。夜2全24状態の再撮影を実行中（session36476）。修正後は夜2のcontactを進行役に再提出。最終check/buildと記録追記が残る。

証拠はartifacts/pc-seat-v9-rollout/。review-{standard|wide}-seat-{1..5}.pngは108座面、review-{standard|wide}-left-{1..2}.pngは19all-on＋夏5all-offの角/鉢。final-で始まる夏3cupOFF6枚は底輪郭修正済み確認画像。夜2の古いreview画像は不合格を含むため更新予定。

照明・街灯・人物有無・手描き筆触は各シーン固有を保持。昼画像を夜へ流用していない。設計消失点は概略(784,444.769)で全画素の数学的一致の主張ではない。画像再生成なし。

## 2026-11-08 再開・残夜2の解消

実ファイルの夜就寝ON合成は採用背景と局所差3超0画素なのにブラウザで縦境界が出た。プレビュー再起動だけでは解消せず、配信画像を取得して調査。v9差分/復元層をWebPから可逆PNG配信へ変更すると縦境界が解消。夜起床・就寝の無人物cupOFF補修を座面y774未満に制限し、窓台前面に掛かる暗い矩形も解消。

PNG配信はpc-seat-v9-rollout overrideのみに限定。SPと既存春昼晴れは対象外。人物/鉢/カップの切替条件を保持。夜2全24状態再検証成功。進行役はreview-1108-night-{standard|wide}-{seat|left}-1.pngの4枚全24状態を独立目視し、残像・矩形・二重前縁解消、夜2合格を確認。これで独立目視19/19。

最終check76ファイルerrors/warnings/hints全0、build/build:dev-preview、diff --check成功。全19PNG配信108状態と春夏PC/SP最終回帰は実行中、完了結果を追記予定。

配信サイズ：built home参照PNG102ユニークsrc/srcsetの実合計1,191,123bytes。同じ生成画像をWebP85に再符号化した比較値766,958bytesとの差424,165bytes（約414KiB）。全シーン・両サイズの資産合計であり、初期ページの実転送増分ではない。画質維持のためこの増加を受け入れる。

プレビューはPID87749で再起動、4512 HTTP200確認。保存済み成果は今回の実行で上書き、11/06の不合格contactは歴史記録として区別。
