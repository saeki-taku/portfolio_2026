# 夏の他時間帯・曇り／雨 — 実装検証完了

2026-11-09 JST。追加8シーン（明け方・夕方・夜在室・就寝 × 曇り／雨）、PC/SP16セットを取り込み、実表示・有効切替・雨遮蔽・回帰検証まで完了。昼の既存2シーンと合わせ夏の曇り／雨10シーンが利用可能。雷雨の雲発光は承認済みの昼限定で維持し、未制作の他時間帯雷雨は明示fallback。

追加commit/pushなし。308bcd7後の既存変更をすべて保持。プレビュー http://127.0.0.1:4512/ は最終HTTP200確認。

## 素材と登録

main `design-proposals/summer-weather-periods-v1/` に16背景、8小物照明atlas、4人物照明素材、入力・manifest・SHA・生成元・プロンプト記録を保存。画像制作にはbuilt-in image_genを使用。完成素材は全て `src/assets/validation/summer-period-weather-v1/manifest.json` の16セットへ取り込み済み。

- PC1345×1170、SP819×1920候補を既存1024×2400へ登録。背景SHA照合、外景／室内分割後の再合成16件すべて元候補と全画素一致。
- 背景に人物・小物・雨筋を焼き込まず、植物・杯・人物を独立表示。明け方／就寝は人物なし、夕方／夜在室は承認済み足・裾・半袖・姿勢を保持。
- 小物は完成済み昼の完全な植物／杯alphaを境界正本として照明素材と交差。旧植物の不完全な04alphaは使用しない。杯の持ち手孔、薄い接触影を維持。
- 夜在室・曇り人物のみ生成canvasの位置ずれを右21px／下1pxの全体移動で補正後、正本alphaと交差。局所変形なし。近接で足先／裾口の欠けなしを確認。
- 雨マスクは実登録の人物／杯／植物alphaから全組み合わせを生成。人物なしで無効なrinチェックはmask算出から除外。
- PCv9窓台、SP床延長、時間帯の室内灯／街灯在不在を保持。

## 検証実績

| 検査 | 結果 |
| --- | --- |
| `capture-summer-period-weather.mjs` | 8シーン × PC2/SP2画角、全192有効状態合格。scene ID・表示層・無効人物・画像decode・設定閉鎖・横overflow・page errorを検査 |
| `verify-summer-period-rain.mjs` | 4雨シーン、144状態。雨量0/100/200、室内／小物／mask外漏れ0、reduced-motion静止・0から復帰合格 |
| `verify-summer-period-viewport.mjs` | SP390×1100の追加8シーンすべて床延長・ナビ位置・横overflow合格 |
| `verify-spring-approved-rain.mjs` | 実配信9状態、人物ON/OFFと静的／動的遮蔽の回帰合格 |
| `verify-summer-weather-rain.mjs` | 既存夏昼雨48状態と静止・fallback合格 |
| `verify-summer-thunderstorm.mjs` | 雲発光16遮蔽状態、実時間周期、静止設定、通常雨復帰、未制作fallback合格 |
| `verify-spring-final.mjs` | 春15シーン × PC/SP合格 |
| `verify-summer-five-scenes.mjs` | 夏晴れ5シーン × PC/SP4画角合格 |
| `npm run check` | 102ファイル、error/warning/hintすべて0 |
| `npm run build` | 成功 |

旧夏回帰スクリプトは初期要求URLに `summer-` を含むだけで未選択画像と扱っていた。春にも共用する `pc-approved-contact-shadow.png` の正常読込1件を誤検出したため、この共用影だけ除外して再実行、合格。製品の画像読込処理は変更していない。

## 目視と証拠

`artifacts/summer-period-weather/` に全192状態の全景／seat／plant近接、全32代表viewport、64枚の最終contact、capture-report.json、rain-audit.json、viewport-floor-audit.json、background-recomposition.jsonを保存。

- 実装担当：SP縦長の全8シーン48状態 × seat/plant計16contactを目視。足／裾・接地・杯透過孔・OFF下地・植物縁・雨と室内の境界を確認、明確な不具合なし。
- 画像担当による独立目視：PCワイド全8シーン48状態 × seat/plant計16contactを全件確認、欠け／残像／矩形／旧前縁なし。
- 画像担当による独立目視：PC standard/SP standard各8全景、人物あり全4シーンON/OFF足元、植物ON/OFFの選択近接を確認。照明・在不在・足裾・杯孔・復元下地に明確な不具合なし。これは192全件の目視と同義ではなく、192全件は機能検証、全組み合わせ目視はPCwide/SPtallで実施。

代表：`viewport-pc-summer-evening-cloudy.png`、`viewport-sp-summer-night-rain-awake.png`、`viewport-pc-summer-night-rain-asleep.png`。最終contactは `final-review-{pc,pc-wide,sp,sp-tall}-summer-{scene}-{seat,plant}.png`。

## 残制約

今回の追加対象8シーンに未完作業なし。雷雨は夏昼のみ。秋冬、新しい人物ポーズ、Lottie、API接続は対象外。PNG透過配信を維持しており、追加素材分のデータ量は増える。Notionの最終記録・ユーザーへの完了通知は進行役へ引き渡す。
