# 段階2：最新基準素材と固定構図

担当：Codex（表示実装）。ユーザーの「お願いします」で前回分担案の実行を承認。Claudeは読み取りレビュー・受入確認。Claudeへの自動送信やプロセス起動はしていない。

- 作業場所：e84c/ポートフォリオ
- ブランチ：codex/ennui-stage2-baseline
- 共有開始：bb603eb9c655a1794a4461df92af71b5924b9cdf
- 開始時：Gitクリーン。元試作は読み取りのみ。
- Codex編集範囲：index.astro、global.css、表示素材、画像許可リスト、verify-local.mjs、README、今回のhandoff。
- 共通インターフェース：URL/APIは変更なし。
- 触らない範囲：package/lock、Workers設定、下層機能、他worktree、原本、共通指示書原文。

## 採用根拠・由来

Notion https://app.notion.com/p/3da0bce7ba7381bc8329f4da6853d1c8 の先頭「PC・SPの基礎画像：採用基準（2026-09-26）」を取得し確認。PC/SPとも低いお団子、固定構図、PCを基準とする色調が最新の決定。

Documents側の2原本を実際に開き、ハッシュ一致を確認。
- PC原本 b-spring-rin-style-06-oil-v1.png（1672×941）: 3f0fd69774e52ccd416aeffba5455a0507e3a7b128f522700cfb973986608fac
- SP原本 b-spring-rin-mobile-pc-palette-bun-v1.png（1024×1536）: 0e13d9c412977d20e54e396a6a8af74ebf24c6f3369e12b7b46e044958f9ba31

SPは無加工コピー `src/assets/scenes/rin-mobile-approved-20260926.png`。原本とSHA256同一。
PCは既存の文字除去派生 `rin-desktop-day.png` を原本と目視比較して採用。人物/色/構図が基準を維持し、ロゴと実績名の焼込みがない。肌修正前の素材である。
コピー先 `src/assets/scenes/rin-desktop-display-20260926.png`、SHA256 112e6797d936ef6a22674f3d61714d2b4653a0cd90972a42d49d61da0dd143f6。
この派生は過去の生成編集なので原本と画素単位同一ではない。色補正・再生成・肌加工は今回行っていない。Claude受入時にも原本との差を確認する。
過去表示素材は履歴のため残すがimportしない。

## 変更と確認

- 両原本の縦横比を維持し、pictureで専用構図を切り替える。
- ロゴ/導線はHTMLのまま。文字焼込みとの二重表示なし。
- bodyのoverflow:hiddenを解除。通常表示は従来通り画面内に収まる。
- ナビゲーションを折り返し可能にし、極小画面ではロゴ/画像/導線を通常フローに切り替え、スクロールで操作に到達可能とした。
- フォント下限をrem基準に変更し、文字拡大を検証。

今回の結果：
- npm run check: errors/warnings/hintsすべて0。
- npm run build: 成功（5ページ・6画像）。
- ENNUI_TEST_URL=http://127.0.0.1:4499 npm run test:local: 成功。
- 1440×900 / 390×844 / 320×568 / 844×390 / 768×1024：overflowなし、構図選択・ロゴ・導線・画像読込正常。
- 240×220の有効CSS表示領域（400% zoom相当の狭さ）で各リンク操作可能・横overflowなし。
- ルート文字サイズ200%相当で各リンク操作可能。
- 画像リクエスト失敗時もお問い合わせへの遷移可能。
- API、404、通常導線、キーボード検証も成功。PC/SPスクリーンショット目視確認。
- 実機Safari・ブラウザの実際のズームUIによる検証は未実施。拡大検証は上記シミュレーション。
- 検証用4499を使用。他方のプロセスを停止していない。公開・pushなし。

## Claudeの受入確認依頼

この文書の追加コミットから別worktree/ブランチで開始。`git log -1 --format=%H -- docs/handoffs/2026-09-26-stage2-baseline.md` でレビュー対象を取得できる。

変更可：専用レビュー記録 `docs/handoffs/claude-stage2-review.md` のみ。
変更不可：src、画像、CSS、package/lock、設定、Codexの文書。他の問題は修正せず指摘する。

1. 採用元とハッシュ・SPお団子・PC文字除去派生の自然さを確認。
2. 縦横比、窓/人物の欠け、色調、ロゴ/導線の可読性をPC/SP/横向き/タブレットで確認。
3. 200%/400%実ズーム・文字拡大・キーボード・画像失敗時を独立確認。Safariを使える場合は追加確認。
4. 再現手順/該当ファイル/重要度を専用レビュー文書に記録し、独立コミットで返す。統合担当はCodex。

受入確認後に段階3のAPI・季節範囲・手動切替UIを相談し、型/APIと担当ファイルを決める。段階4/5や人物加工を先行しない。
