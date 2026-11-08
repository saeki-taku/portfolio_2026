# 春・夕方PC/SP分離レイヤー実装（確認用）

2026-10-11。素材 `design-proposals/pc-spring-evening-layers-v1/`（1345×1170・6層）と `sp-spring-evening-layers-v1/`（1024×1997・9層）のREADME・manifestを読み、原本の画素を変更せず `src/assets/validation/` の同名フォルダへ複製した。両manifestの `layersBottomToTop` 順で、それぞれ共通座標の親要素に重ねている。画像内ではなくHTMLのロゴとナビを継続使用する。

東京時刻17:00–18:59の自動選択と、開発用パネルの手動夕方選択がPC/SPの夕方レイヤーを表示する。SP夜と就寝後はまだ専用素材がないため昼v21へ戻る。PC夜と就寝後は従来の暫定一枚絵を維持する。昼のPC描き直し版とSP v21は変更していない。時刻境界、季節・天気の扱いも変更していない。

PCの人物切替は `04-contact-shadow.png`、`03-rin.png`、`06-person-edge-restore.png` を連動させる。カップの一部と影は室内層に焼き込まれているため、PC夕方のカップ単独切替は無効にし、設定パネルに理由を表示する。SP夕方は人物2層、カップ3層、鉢植え2層の連動切替。別時間帯の下地とは混ぜない。

検証：素材コピーのSHA256一致、全層の寸法・透過、原寸合成と付属の通常・人物なしプレビューのチャンネル差最大1。ChromeでPC 1440×900、1920×1080、1024×821、SP 390×844、430×932、768×1024を撮影し、全層の表示矩形一致、人物連動、カップ保持、ロゴ・ナビを確認した。スクリーンショットは `artifacts/evening-layers-v1/`。時刻境界、開いたまま17:00をまたぐ切替、手動・自動、SP夜の昼フォールバックを検証。`npm run check`、`npm run build`、`npm run build:dev-preview`、`node scripts/verify-evening-layers.mjs`、`node scripts/verify-scene-time.mjs`、`npm run test:local` が通過。通常ビルドでもPC/SP夕方の自動表示と設定パネル非表示を確認した。

素材は `review-candidate`。PC夕方は採用PC昼の描き直し凛ではなく、PC昼v4由来のスケッチ姿勢を色替えした素材で、以前に決まった「夕方は手を休めて外を眺める」姿勢にはまだなっていない。SP夕方も昼v21のスケッチ姿勢を維持する。夕方の照明は大まかな色転写で、独立した窓明かりや新しい幾何学的な影はない。これらは素材側の仕様であり、CSSでは補っていない。

コミット・プッシュ・本番公開はしていない。
