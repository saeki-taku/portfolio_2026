# 春・明け方・曇り PC/SP確認用組み込み

2026-10-20。`design-proposals/pc-spring-dawn-cloudy-layers-v1/`（1345×1170、4層）と`sp-spring-dawn-cloudy-tall-layers-v1/`（1024×2400、8層）を原本のまま`src/assets/validation/`へコピーし、`spring-dawn-cloudy`としてPC/SPの開発用シーン設定に登録した。確認URLは `http://127.0.0.1:4512/`。シーン設定を開き、切り替え方式を手動、季節を春、時間帯を明け方、天気を曇りにする。自動切り替えは従来どおり東京時刻05:00–05:59の春・晴れ固定で、実天気とは連動しない。コミット・プッシュ・本番公開は行っていない。

受け入れ検証: コピーした全PNGのSHA-256・寸法を原本と照合。晴れ明け方と外景・室内・植物・カップのalpha、ガラスマスク、街灯り層を照合。manifest順に原寸再合成した全景、街灯りOFF、SPのカップOFF/植物・カップOFFは提供プレビューと画素差0。人物・接触影・室内読書灯の層はない。微小な街灯りは受領素材のままで、採用済み晴れ明け方と同一。CSSによる画像補正や隠し処理は加えていない。

ブラウザ検証: `scripts/verify-spring-dawn-cloudy-integration.mjs`成功。PC 1440×900、1920×1080、1024×821、SP 393×852、393×900、393×760、320×568、430×932、768×1024で全層の同一矩形、晴れ⇄曇りの親矩形、横はみ出しなし、人物切替無効、SPの植物/カップ下地連動、狭い画面のメニュー到達性を確認。スクリーンショットは`artifacts/spring-dawn-cloudy-integration/`。目視では通常画角の窓四辺・床・外景と室内の境界に位置ずれや透過穴は見られず、人物/影/照明の残像も見られない。色と曇り具合の最終採否は画像の審美判断として未決定。

`npm run check` は46ファイルで0件。`npm run build`、ビルドを再起動した `npm run test:local` 成功。`verify-scene-time.mjs`で04:59/05:00/05:59/06:00を含む時刻境界、`verify-spring-dawn-integration.mjs`で晴れ明け方、`verify-rain-motion.mjs`と`verify-spring-day-rain-integration.mjs`で既存の昼・雨の密度/速度/切替を回帰。SPや夕方・夜の既存素材は変更していない。
