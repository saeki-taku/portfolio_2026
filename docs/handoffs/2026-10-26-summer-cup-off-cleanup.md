# 夏・晴れ PC/SP カップ非表示時の補修（確認用）

確認用サイト: http://127.0.0.1:4512/

夏の晴れた明け方・昼・夕方・夜（起きている／眠っている）の PC/SP 計10シーンを、PC v4 / SP v2 の分離素材へ更新した。元の PC v3 / SP v1 と原本は変更していない。昼・夕方・夜（起きている）では、人物ONかつカップOFFの場合に限り `10-cup-off-repaint.png` を最後に重ねる。カップON、人物OFF、明け方、夜（眠っている）では表示しない。植物の表示条件は変えていない。

素材の出典と作成条件: `design-proposals/summer-cup-off-cleanup-handoff.md`。SPのカップは元の人物レイヤー内にも描き込まれているため、補修は現在の静止した構図に対応する。将来、人物・カップ・カメラを個別に移動する場合には再制作と再検証が必要。

検証:

- `npm run check`: 0 errors / 0 warnings / 0 hints
- `npm run build`: 成功
- `node scripts/verify-summer-five-scenes.mjs`: 夏5シーン、PC 1440×900 / 1920×1080、SP 393×852 / 768×1024 で通過。人物・カップ・植物の切替、補修レイヤーの条件、全レイヤーの位置、他シーンの非表示、横溢れとブラウザエラーを確認。
- `node scripts/verify-summer-pc-object-groups.mjs`: 夏PCの人物・カップ・植物の組み合わせを2画面比率で通過。
- `node scripts/verify-spring-final.mjs`: 春15シーンのPC/SP回帰検証を通過。
- `scripts/capture-summer-cup-comparison.mjs`: PC/SP、全5時間帯のカップON/OFFを原寸と拡大で40枚撮影。カップON拡大画像は全10シーンで更新前とファイル単位で一致。

目視結果: SPの昼・夕方・夜（起きている）で、OFF時のグラス残りが消えた。PC同時間帯で、旧補完の尖った布の継ぎ目が改善した。夜の窓台も目立つ明暗の断絶は見えない。人物の足元、カップ周囲、植物の表示を原寸および拡大で確認した。

比較画像（相対パスは本ワークツリーのルートから）:

- PC昼・OFF、修正前: `artifacts/summer-cup-off-baseline/pc-summer-day-sunny-cup-off-detail.png`
- PC昼・OFF、修正後: `artifacts/summer-cup-off-final/pc-summer-day-sunny-cup-off-detail.png`
- SP昼・OFF、修正前: `artifacts/summer-cup-off-baseline/sp-summer-day-sunny-cup-off-detail.png`
- SP昼・OFF、修正後: `artifacts/summer-cup-off-final/sp-summer-day-sunny-cup-off-detail.png`
- 全時間帯・全画面: `artifacts/summer-cup-off-final/`

制限: SPの補修はカップなしの人物単独素材への分離ではなく、現構図に合わせた静止画の局所補修。夏の曇り・雨、秋冬、SP以外の追加画面、ポーズや視点の移動には適用していない。コミット・プッシュ・本番公開はしていない。
