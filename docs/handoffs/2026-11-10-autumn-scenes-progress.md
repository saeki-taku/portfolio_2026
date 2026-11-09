# 秋15シーン — 実装・検証完了

2026-11-10最終確定。5時間帯×晴れ／曇り／雨の15シーン、PC/SP30背景セットを製品へ登録。以下が最新実績で、後半は段階実装の履歴。秋雷雨・冬は今回対象外。

## 最終結果

- 背景30枚のSHAを受領manifestと照合。PC原画1345×1170（昼曇だけ1169高を1170へ登録）、SP819×1920を1024×2400へ登録。外景／室内の再合成が登録原画と30/30一致。
- PC1440×900／1920×1080、SP390×844／430×932：全384有効状態合格（各画角96）。9人物ありシーン×8＋6人物なしシーン×4。表示scene一致、画像decode、切替群、横溢れ、ブラウザエラー確認。完成素材取り込み後にサーバー再起動、撮影中のHMRなし。
- 秋雨5時間帯PC/SP×有効切替×雨量0/100/200＝192条件合格。実配信foreground alphaとmask、実描画canvasの室内・人物・小物・mask外漏れすべて0。reduced-motion静止450ms、雨量0と復帰、未制作天気の明示fallbackも合格。
- 縦長SP390×1100全15ケース：床延長、実viewport高さ、ナビ下端、横溢れなし。PCv9と既存SP床構造を保持。
- 進行役：標準PC/SP全30実viewport、昼PC座面24状態／昼SP植物24状態の独立目視合格。
- 画像担当：PCwide全30contact、96状態×座面／植物を独立目視合格。
- 実装担当：SPtall全30contact、96状態×座面／植物を目視合格。足重なり／一重裾／接地、杯持ち手穴、植物の花茎と鉢、OFF下地に残像・矩形・旧前縁なし。各時間帯照明と人物在不在を維持。
- 春15シーン×PC/SP、夏晴5シーン×PC/SP画角回帰合格。春雨9mask、夏昼雨48条件、夏昼雷雨凛不在32状態＋通常天気復帰24状態合格。
- npm run check：112 files、0 errors／warnings／hints。npm run build成功。既存の環境警告のみ。プレビュー http://127.0.0.1:4512/ は最終HTTP200確認。

## 素材と実装

春の承認済長袖・各時間帯の既存姿勢／足裾を再利用し、新規人物生成なし。陶器杯と完全な白花鉢を独立層で登録。晴れ植物は同時間帯の中性曇光素材を使用し全景目視で照明適合を確認。明け方／就寝は人物不在。新背景は空室正本であり旧人物や小物復元層を重ねない。雨は既存の強度・静止設定へ統合し、夏の雲発光雷雨は夏のみに限定したまま。

## 再現・証拠

実行：build-autumn-weather.mjs、capture-autumn-weather.mjs（先行12シーン336＋就寝3シーン48）、make-autumn-review.mjs、verify-autumn-registration.mjs、verify-autumn-rain.mjs、verify-autumn-viewport.mjs。回帰：verify-spring-final.mjs、verify-summer-five-scenes.mjs、verify-spring-approved-rain.mjs、verify-summer-weather-rain.mjs、verify-thunder-rin-absence.mjs。

証拠は artifacts/autumn-weather/ の capture-report.json（384件）、rain-audit.json、viewport-floor-audit.json、registration-audit.json、final-review-*（120枚）、viewport-{pc,sp}-autumn-*。原画の生成・採用・独立QA記録は docs/handoffs/autumn-source-records/ に写し、main design-proposals/autumn-weather-v1/にも原本保持。

夏チェックポイントcbaa809を通常push済み。秋はこの最終合格をもとに同じcodex/ennui-stage2-baselineへ別コミット・通常pushする（forceなし、mainマージなし）。

---

# 制作・実装の経過（履歴）

2026-11-10承認。明け方／昼／夕方／夜在室／就寝 × 晴れ／曇り／雨、PC/SP計30背景を段階的に制作・実装・検証する。秋雷雨は対象外。

## 基準

- 実装worktreeはe84cを継続。夏成果はcbaa809へコミット済み、origin codex/ennui-stage2-baselineへの通常push成功、remote SHA一致確認済み。
- PC窓台v9、SP床延長、人物の承認済み足・裾を維持。
- 秋服は春の長袖を基準。昼・夕方・夜の既存姿勢を保ち、一律同ポーズ化しない。
- 明け方／就寝は人物不在。背景へ人物／小物を焼き込まず独立切替を維持。
- 各時間帯の照明、夜在室の室内灯／街灯と就寝時消灯を維持。雨は実登録alphaを使って屋外のみ遮蔽。

## 先行12シーン時点の現在地

新規秋の製品登録は昼・明け方・夕方・夜在室の晴れ／曇り／雨12/15（PC/SP24セット）。全件検証は未完。画像担当の保存済み完成素材を受領した順にmanifestへ登録する。素材完成と製品実装完了を区別し、最終PC/SP切替・近接目視・雨遮蔽・春夏回帰・check/build・プレビュー接続まで継続する。

受領仕様提案：main `design-proposals/autumn-weather-v1/`、`{pc,sp}-{period}-{weather}-background.png`、manifest entriesにfile/SHA/status。PC1345×1170、SP819×1920を既存1024×2400へ登録。人物／小物は透過素材と登録情報を別途受領。命名や実際の格納先は画像担当の最新manifestを優先する。

## 昼3天気の先行実績

PC/SP全6代表を撮影・担当目視。昼晴れPC/SPは進行役独立目視合格。昼雨は48状態で室内／人物／小物／mask外漏れ0、reduced-motion静止・雨量0復帰合格。人物は春の昼晴正本／承認済み昼曇展開素材をそのまま再利用し、姿勢・足裾・手元変更なし。小物は承認された春陶器杯と完全な白花鉢を独立登録。親全件QAと最終検証を終えてから秋成果をまとめてcommit/pushする。

## 明け方受領

明け方3天気6背景を受領。PC明け方雨に焼込雨筋があった旧候補は画像担当がrejectedへ退避し、imagegen補修済み最新版のSHAを照合して取り込み。`candidate-reviewed`のみをビルド対象にする。人物なしを保持。昼3天気は全96機能切替合格、進行役が全6全景とPC standard座面24状態を独立目視合格。

## 夕方受領・検証

夕方3天気PC/SP6セットを登録、承認済み春の休息姿勢を保持して実viewport撮影。夕方雨48状態で遮蔽漏れ0・静止／復帰合格。明け方雨も24状態合格、昼48と合わせ先行雨120状態。進行役が明け方全6代表も目視合格。残り夜在室／就寝の6シーンは素材受領待ち、全件完了とは扱わない。

## 夜在室受領・現在地

夜在室3天気6背景をSHA照合して登録。春承認の読書姿勢と足裾・長袖を保持。夜在室雨48状態で漏れ0・静止復帰合格、先行雨合計168状態。進行役は夕方と夜在室の全12代表も独立目視合格、全景累計24/30。就寝3天気は画像制作中。先行12シーン全336有効状態の撮影検証を実行中、最後の就寝48状態を追加して全384状態へ統合する。
