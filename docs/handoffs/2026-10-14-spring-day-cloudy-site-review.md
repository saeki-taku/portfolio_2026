# 春・昼・曇り PC/SP 確認用実装

2026-10-14。`design-proposals/spring-day-cloudy-v1-handoff.md` と両版のREADME/manifestを確認し、版付き素材を `src/assets/validation/` へ原本を変えずに複製した。manifest順にPC 5層、SP 10層を `spring-day-cloudy` として登録。左上原点の全画面座標を共有し、個別の位置・トリミング補正は加えていない。人物OFFはPCで人物と接触影の2層、SPで人物・接触影・連動下地の3層を同時に非表示にする。カップと植物は残す。補正済み `glass-mask-v2.png` は保管したが、雨演出は今回表示していない。

確認用開発プレビュー: `http://127.0.0.1:4512/`。右上の「シーン設定」で「手動」→「春・昼・曇り」。自動は従来どおり東京時刻による春・晴れ4状態で、曇り候補は公開側の自動選択対象ではない。

`scripts/verify-cloudy-day.mjs` で複製素材のSHA-256、寸法、透明度、manifest順、原本プレビューのPNG再合成（全画素・各チャネル差最大1）、PC/SP各3画角の表示・座標一致・人物OFF、晴れへの復帰と未対応天気/時間帯への晴れフォールバックを確認した。原寸ブラウザキャプチャとプレビューの平均絶対差はPC約3.0、SP約3.0/チャネルで、配信用WebP圧縮による差が中心。層の表示位置・窓枠・人物・カップの前後関係に目視で破綻は見られなかった。

スクリーンショットは `artifacts/spring-day-cloudy-v1/`。`pc-original.png`、`pc-wide.png`、`pc-near-square.png`、`sp-original.png`、`sp-phone.png`、`sp-tall.png` と各 `-no-rin.png`、原寸比較用の `-artwork.png` がある。

回帰: `npm run check` 0件、`npm run build` 成功、`npm run test:local` 成功。`verify-scene-time.mjs`、`verify-evening-layers.mjs`、`verify-night-layers.mjs`、`verify-sp-day-v21.mjs`、`verify-cloudy-day.mjs` 成功。既存の春・晴れ昼/夕方/夜/就寝後は維持。

残課題: 曇り素材は `review-candidate` で正式採用前。SPの植物用下地は将来の雨効果を左下ガラス内で矩形状に遮るため、雨は素材・合成順の追加検証が必要。PCも実際の雨滴は未検証。曇りの他時間帯、雨・雪、実天気API、IP由来地域選択は未実装。
