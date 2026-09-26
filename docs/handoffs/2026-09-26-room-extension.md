# 壁・床の延長と床材統一

担当：Codex。段階2。branch: codex/ennui-stage2-baseline。開始コミット cc11a94。

## 実施

- 全幅で元の縦横比を保つ中央画像と、伸縮する上下の装飾画像に分離。
- 最低高さPC600px/SP680px、画面高以上を確保。縦スクロールを許容。横スクロールなし。
- メニュー半透明を維持。
- imagegenで壁・床の延長を作成。PCの床はユーザー追加指示でSPの淡い木目に変更し、左上の壁の角を補足。
- 元PNGは不変。PC表示用派生 `rin-desktop-wood-floor-20260926.png` は元画像の床だけを合成。中央の窓・人物は元画素を保持。
- PC合成マスク：1672x941座標でx>=260はy835から12pxフェザー、x<260はy941-x*106/260から12pxフェザー。変更領域は床だけ。
- 上下extension.webpは生成結果を1672x1601へリサイズし上330px/下330pxを切り出し。SPは1024x2336から上400px/下400px。SP境界は延長側64pxのみ元端の色へ補間。
- 生成元PC exec-9d6e903c-a8dc-401a-a3a3-a903bd383456.png、SP exec-b167efd5-c65f-4bc1-9ec5-c924f108607f.png（Codex generated_images内）。プロジェクト使用部分をsrc/assets/scenesへ保存。

## 検証

- astro check：17ファイル、診断エラー/警告0。初回はWranglerログ保存のsandbox警告あり。
- npm run build 成功。
- ENNUI_TEST_URL=http://127.0.0.1:4499 npm run test:local 成功。
- 1440x900、1024x821、390x844、320x568、844x390、768x1024。画像切替、横はみ出し、導線、API health、404、キーボード、極小画面と文字拡大、画像失敗を確認。
- PC1024x821とSP390x844のスクリーンショット目視確認。実機Safari未検証。

## 残課題・次の作業

ユーザーに床・角・上下延長の見た目を確認してもらう。細かなデザインは引き続き調整可能。段階3以降には着手していない。本番公開なし。
Claudeへの分担は読み取りレビューと受入確認まで。共有CSS/画像/トップページの並行編集は行わない。
112e6797d936ef6a22674f3d61714d2b4653a0cd90972a42d49d61da0dd143f6  src/assets/scenes/rin-desktop-display-20260926.png
0e13d9c412977d20e54e396a6a8af74ebf24c6f3369e12b7b46e044958f9ba31  src/assets/scenes/rin-mobile-approved-20260926.png
ad57376ed5bef0e6ebfd15d17cffe8a1b492ebf56d236de41b5aa27a9f3db220  src/assets/scenes/rin-desktop-wood-floor-20260926.png
b23691e957373d320909ed1884bd7c801cc54486b77cc4acdad94ebc31fd5a9e  src/assets/scenes/desktop-floor-extension.webp
8060530c689f95c314d62cb55295e5ef79ba8bb9a555fe11998801c78d360306  src/assets/scenes/desktop-wall-extension.webp
f60c7945a8a773333d053ee2994c8a4588b88f538bb842f7db52c06fce84385c  src/assets/scenes/mobile-floor-extension.webp
23ccebb847f0af019e91f81054b026097e1977c89cd75850dfe72abde47a3f71  src/assets/scenes/mobile-wall-extension.webp
