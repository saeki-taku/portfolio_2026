# PC春・明け方・曇り v1

1345×1170px、左上原点(0,0)のレビュー候補。既存の晴れ明け方 `pc-spring-dawn-layers-v1` と同じ窓・街・公園・室内・床・カップ位置。凛は不在、室内灯はOFF、街灯りは晴れ明け方のごく少数の画素をそのまま保持。採用・サイト実装は未実施。

空の雲をbuilt-in image_genで制作し、`inputs/cloudy-dawn-guide.png`に保存した。生成結果から採用したのは空の雲と広域の環境光だけ。建物・窓枠・室内・カップの形は既存の昼曇りレイヤーの画素と油絵の筆致を基に再照明した。桃色の朝焼けと晴れ明け方の方向性ある影を弱め、青灰色の曇天でも夜明けと分かる明るさを残した。`inputs/prompt.txt`はガイド制作時の指示。

`manifest.json`の4層を順番に同じ矩形へ重ねる。`glass-mask.png`は白がガラス内の輝度マスクで、晴れ明け方・昼曇りと同じ形。PCカップは室内側に一部焼き込まれており単独OFFは未対応。

確認画像: `preview-composite.png`、`preview-city-lights-off.png`、`compare-clear-cloudy-day.png`（左から晴れ明け方・曇り明け方・昼曇り）、`inspection-sky.png`、`inspection-sill.png`。alpha、街灯り保持、窓マスク一致、透明穴、空・街・室内の明度は`verification.json`に記録した。原寸で空の境界、窓枠、床の影を目視確認済み。

晴れ明け方、昼曇りなど元画像は変更していない。時刻設定は暫定05:00–05:59 JST。曇りの採用判断、端末表示、実天気API、雨や他時間帯は別工程。再構築: `node ../build-spring-dawn-cloudy-v1.cjs`。
