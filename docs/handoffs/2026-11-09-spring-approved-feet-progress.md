# 春の全人物 足・裾正本整合 — 実装・検証完了（2026-11-09）

最新結果: 春の人物あり9シーンのうち昼晴れPC/SPを保持し、残り8シーン×PC/SP=16表示セットへ承認正本の足重なり・一重裾を反映。昼筆記・夕休息・夜読書の上半身/視線/本と時間帯の照明を保持。人物なし6シーンは維持。既存カップ修正、窓台v9、床延長も保持。

- `node scripts/capture-spring-rin-approved-feet.mjs`: 新8シーン×PC2/SP2の全有効160状態（PC32/SP128）合格。親進行役も代表4枚＋全状態16枚を独立目視し、足/裾/接地・旧足復活なし・cupOFF下地を合格確認。
- `node scripts/verify-spring-approved-rain.mjs`: 実配信新alphaと実際の静止雨/動的canvasの9ケースで人物内/静止雨/動的mask外漏れ各0。人物OFFでmask切替と遮蔽画素の回復を確認。`rain-served-audit.json`。最終2px雨境界修正後の代表全景 `final-rain-{pc,sp}-{day,evening,night}.png` 6枚も保存。
- `node scripts/verify-spring-final.mjs`: 春15×PC/SP回帰合格。
- `node scripts/verify-summer-five-scenes.mjs`: 夏晴れ5×PC/SP回帰合格（修正済み人物3時間帯を含む）。
- `npm run check`: 90 files、error/warning/hint各0。`npm run build` / `npm run build:dev-preview` 成功。`git diff --check` 合格。
- http://127.0.0.1:4512/ HTTP200確認済み。既存未コミット差分保持、commit/pushなし。

証拠: `artifacts/spring-rin-approved-feet/` の代表 `final-representatives-{pc,pc-wide,sp,sp-tall}-1.png`、全状態 `final-all-states-*`、最終雨6枚とJSON。素材/登録情報はmain `design-proposals/spring-rin-approved-feet-v1/README.md` と `integration-manifest.json`。実装生成スクリプト `build-spring-rin-approved-feet.mjs` / `build-spring-approved-rain-mask.mjs`。

残範囲: 夏曇り/雨は別担当制作のPC/SP昼4候補を受領した段階（main `design-proposals/summer-weather-v1/`）、サイト登録0。今回の春完了と混同しない。秋冬・Lottie・APIは対象外。Notion更新は親進行役が担当。

---

# 過程記録（以下は途中時点の履歴）

対象棚卸し: 春15のうち人物あり9（昼3/夕3/夜起床3）、なし6（明け方3/就寝3）。承認済み昼晴れPC/SPを保持し、残8×PC/SP=16セットを更新。

5照明群をimagegen制作、親が素材目視合格。main design-proposals/spring-rin-approved-feet-v1/{day-cloudy,evening-sunny,evening-cloudy,night-sunny,night-cloudy}-candidate.png。昼筆記/夕閉じたノート休息/夜開いた本読書の既存姿勢を保持。曇と雨は同照明群、足/一重裾は春正本参照。等比配置と接触影を春昼基準で実装。

scripts/build-spring-rin-approved-feet.mjsで生成素材をPC/SPへ登録。index.astroで旧人物・旧影・SP07/06の旧布/カップを除き新人物と影を追加。既存PCカップ補修を保持。
scripts/build-spring-approved-rain-mask.mjs: 雨3時間帯PC/SPのrin-off効果/可視maskから新人物alphaをdestination-outで遮蔽、27PNGをhash名で保存。index.astroとrain-motion.tsで静止/動的両方へ接続。手描き画像修復なし。

検証中: capture-spring-rin-approved-feet.mjsの8シーン×PC2/SP2全有効状態（予定160）、verify-spring-approved-rain.mjsの実配信新alpha/静止/動的漏れ/ONOFF変更。check/build/回帰/全近接と親目視は未確定。完了扱いしない。
証拠 artifacts/spring-rin-approved-feet/。

夏晴れ3人物の再確認は最終に行う。夏曇雨新規情景は別担当からmain design-proposals/summer-weather-v1/README.md/manifest.jsonとPC/SP昼曇雨4候補受領、まだ製品未接続、実装0。春検証を優先し勝手に公開しない。

## 最終候補の検証実績（2026-11-09 00:40頃）

- 生成余白差を正本足裏との照合で補正。PC換算で昼曇雨-1px、夕全種-11px、夜晴-3px、夜曇雨-2px。SP同倍率。局所変形なし、人物全体を移動。
- 春新8×PC2/SP2、有効状態160（PC32/SP128）表示assert・横溢れ・pageerror・画像デコード合格。全景/近接保存。
- 実配信雨9ケース（PC3時間帯＋SP3×鉢ON/OFF）新人物内mask漏れ0、静止雨漏れ0、動的雨mask外漏れ0。人物OFFでURL変更と新遮蔽画素の回復100画素超を確認。artifacts/spring-rin-approved-feet/rain-served-audit.json。
- SP縮小補間への対策として新人物alphaから遮蔽を2px保守拡張。Sharpのerodeは黒領域縮小=白alpha拡張となることを実画素検証。新人物の元画像自体は変更しない。
- 春15×PC/SP回帰合格。最終夏再確認/check/buildは実行中、親目視最終待ち。

近接代表4枚: final-representatives-{pc,pc-wide,sp,sp-tall}-1.png。全160: final-all-states-{pc,pc-wide}-{1,2}.png、final-all-states-{sp,sp-tall}-{1..6}.png。すべてartifacts/spring-rin-approved-feet配下。
