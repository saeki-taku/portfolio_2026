# SP春・昼 縦長構図v2の独立比較

2026-10-15。`design-proposals/sp-day-tall-candidate-v2/` のREADME、manifest、verificationを確認し、1024×2400pxの `preview-tall.png` を原本のPNGバイトのまま `src/assets/validation/sp-day-tall-candidate-v2/` に複製した。比較用の現行1024×1997px合成PNGも複製した。候補は一枚絵であり、分離レイヤーの代替ではない。既存トップページの素材、時間帯、天気、PC表示は変更していない。

開発用の独立比較ページは `http://127.0.0.1:4512/dev/sp-day-tall/v2/?view=candidate`。右上で現行／候補を切り替え、下部safe-areaの34px模擬も選べる。候補と現行は同じ横倍率 `w/1024` で画面幅いっぱいに描き、それぞれ2400px／1997pxの固有高さを使う。画像内には右窓枠の外側に34pxの壁があり、393px画面で約13pxの壁として残る。右端に無地の帯を作らず、窓枠や人物をクロップしない。ロゴと固定メニューはHTML要素で、画像には含めない。通常の本番ビルドではこの比較ルートを生成しない。

`scripts/verify-sp-day-tall-v2.mjs` で原本と複製および配信PNGのSHA-256一致、各画像の寸法、画面比率とsafe-area、右端までの塗り、窓枠の外側の壁、ロゴ・メニュー位置、切り替えとスクリーンショットを確認した。393×852では候補の絵が約921pxとなり画面下端を69px超える。393×900では約21px超える。現行は両画角で約766pxまでの表示で、下に約86px／134pxの無地領域が残る。393×760で下部34pxを模擬した場合も、メニューは床の上で人物・カップ・窓台と重ならない。430×932も無地の下余白なし。見た目では窓上枠とロゴの間隔、人物とメニューの間隔、窓桟・空・床の接続に大きな破綻は見られなかった。

スクリーンショットは `artifacts/sp-day-tall-v2/` の `iphone16-candidate.png`、`iphone16-current.png`、`taller-candidate.png`、`taller-current.png`、`iphone16-safe34-candidate.png`、`short-safe34-candidate.png`、`wide-phone-candidate.png`。`npm run check` はエラー・警告0件、`npm run build` は成功。比較URLとトップページはHTTP 200で到達確認した。

残課題: 実機iPhone Safariのブラウザバー・safe-area・スクロール挙動は未確認。候補は現行人物等を同一画素のまま新座標に移した一枚絵だが、人物ON/OFF、植物・カップの個別制御や曇りへの展開に必要な1024×2400pxの分離層・背景・マスクは未納。採用時に全層を同じ新座標へ再登録し、既存1024×1997pxの夕方・夜へ新キャンバスを一律適用しない。雨作業は保留。
