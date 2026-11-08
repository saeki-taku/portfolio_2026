# 春・夕方・曇り 人物仕上げ素材v2の受け入れ

素材元: `/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/spring-evening-cloudy-figure-finish-handoff.md`。確認用のPC/SP v2素材は、既存v1を残して `src/assets/validation/pc-spring-evening-cloudy-layers-v2/` と `src/assets/validation/sp-spring-evening-cloudy-tall-layers-v2/` に複製した。春・夕方・曇りのPC/SPシーンだけv2を参照する。晴れ・雨と他時間帯は変更しない。

`node scripts/verify-evening-cloudy-figure-finish.mjs` で、元素材と新版の画布寸法、manifestの重ね順・トグル群、人物以外の全レイヤーのSHA-256一致、人物alphaの全画素一致、透明領域のRGB不変、人物なしプレビューのSHA-256一致を確認。人物RGBの変更はPC 6,157画素、SP 12,887画素で、引き渡しの検証値と一致した。複製された人物PNGのSHA-256も引き渡し資料の値と一致する。

自動承認審査は当初、以前の「SP・夕方は対象外」という指示を根拠に編集を拒否した。後に最新の指示で「春・夕方・曇りのPC/SPをv2へ差し替え、春全時間帯と対応天気の最終確認まで」と対象が明示され、同じ参照先編集が通った。

実ブラウザでは夕方曇りをPC1440×900、1920×1080、1024×821、SP393×852、320×568、768×1024で確認し、人物・影の連動OFF、SP植物/カップの切替、同一矩形の重ね合わせと横はみ出しなしを検証した。前版のスクリーンショットとの画素差はPCが矩形[1012,371]–[1384,697]の58,529画素、SPが[200,475]–[385,635]の14,609画素に限られ、人物領域外の差は0（`verify-evening-cloudy-screen-diff.mjs`）。比較元は `artifacts/spring-phase5-lighting/evening-cloudy-*-current.png`、新版は `artifacts/spring-final/spring-evening-cloudy-*.png`。人物なし画像も同フォルダの `*-no-rin.png` に保存した。

春15シーン×PC/SPの連続切替とスクリーンショットは `verify-spring-final.mjs` で成功。曇り/雨の追加7シーン×PC/SP各3画角、雨0/通常/200、可視マスク外への動く雨漏れ0、reduced-motion/非表示停止は `verify-spring-weather-phase4.mjs` で成功。昼雨の細線と強度/速度、人物/植物マスク切替は `verify-rain-motion.mjs`、東京時刻境界・手動/自動切替は `verify-scene-time.mjs` で成功。明け方雨SPと就寝後曇りPCの保存画像を目視し、人物なし・室内灯OFF・街灯りが少ない状態を確認した。夕方曇りPC/SP人物あり・なしも目視し、窓・街・床のずれや旧人物の残像は見られなかった。

`npm run check` は55ファイル0件、`npm run build` は509画像で成功。最新ビルドのプレビューを再起動した `npm run test:local` は9画面幅とナビゲーション・404・フォーカスの検証に成功。確認用URLは `http://127.0.0.1:4512/`（シーン設定あり）と `http://127.0.0.1:4399/`（ビルド済み・自動表示）。低性能実機での負荷・電池消費は未測定。コミット・プッシュ・本番公開は行っていない。
