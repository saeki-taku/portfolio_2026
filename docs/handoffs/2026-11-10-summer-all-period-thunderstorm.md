# 夏の全時間帯・雷雨

2026-11-10承認。明け方／夕方／夜在室／就寝の雷雨4シーンをPC/SPへ追加。既存昼雷雨と合わせ全5時間帯で選択可能。完成済み各時間帯の雨の背景・小物を再利用し、室内灯／街灯の在不在、色調、窓台v9、床を維持。

全雷雨で凛と人物由来の影を層構成から除外。人物操作は無効、checked値は保持。通常天気復帰時には元のON/OFFを復元。雲だけの柔らかい局所発光を既存昼と共用し、稲妻線／全面フラッシュ／音なし。雨maskはrinOFF固定。夜雷雨のcanvas opacityは夜雨と同じ0.7。UIの夏昼限定表記を「雷雨（夏）」へ更新。

## 検証実績

- `capture-summer-period-thunderstorm.mjs`: 追加4時間帯×PC2/SP2画角×杯/植物4組=64状態合格。全景・座面・植物近接を保存。
- `verify-period-thunder-rin-absence.mjs`: 元人物ON/OFF×小物4組×16画角ケースの128状態合格。通常雨／曇／晴へ戻る96ケースで状態復元。人物層が存在せず、mask0/2/4/6となることを確認。
- `verify-thunder-rin-absence.mjs`: 既存昼雷雨32状態・24復帰・4画角回帰合格。
- `verify-summer-weather-rain.mjs`: 既存通常昼雨48状態、遮蔽／静止／復帰回帰合格。
- `npm run check`: 106ファイル、error/warning/hintすべて0。
- `npm run build`: 成功。
- 進行役が追加4時間帯PC/SP全8代表viewportを独立目視、照明・人物影不在・小物・床を確認し合格。
- 実装担当が同8全景、夕方杯OFF下地と夜在室杯ON近接を目視。旧足・裾・人物影・矩形境界なし。

証拠：`artifacts/summer-thunderstorm-periods/`。代表 `period-{pc,sp}-{dawn,evening,night-awake,night-asleep}-viewport.png`。雲発光中は `viewport-{period}-{pc,sp}-lightning.png`（旧命名を保持、稲妻線は描画しない）。

追加commit/pushなし、既存未コミット差分保持。新しい人物や背景画像は生成していない。春・秋冬の雷雨は未制作fallbackを維持。Notion更新とユーザー完了通知は進行役が担当。

## 最終確定

`verify-summer-period-thunderstorm.mjs` 全8画面の実時間周期10,874〜11,018msで合格。32有効雲発光maskすべて外漏れ0、reduced-motion静止・通常雨へ戻した際の雲光停止・春雷雨の明示fallback合格。全時間帯PC/SP8枚の発光中実viewportを保存。実装担当は就寝SP発光代表も目視し、局所雲光・室内非侵入を確認。プレビュー4512はHTTP200。追加4シーンの実装検証完了。

進行役は夜在室の発光中PC/SPも独立目視し、穏やかな雲光のみ・室内照明／杯／植物／凛不在を確認して合格。進行役側でもHTTP200再確認済み。
