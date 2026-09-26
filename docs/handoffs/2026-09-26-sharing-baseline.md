# 共有開始スナップショット（2026-09-26 JST）

- 担当：Codex。Claudeへの編集担当割当は未実施。
- 段階・目的：段階1〜2の既存実装を選別・検証して共有する。画像修正・新機能・公開は対象外。
- 作業ディレクトリ：`/Users/saekitakuya/.codex/worktrees/e84c/ポートフォリオ`
- ブランチ：`codex/ennui-implementation-handoff`
- 開始HEAD：`70dbac7ecdc09a1f752ac199f164bce8128619a1`（detached HEAD）。追跡済み変更なし、Astro一式が未追跡。
- 共有開始コミット：この文書を追加したコミット。`git log -1 --format=%H -- docs/handoffs/2026-09-26-sharing-baseline.md` で取得できる。全文SHAは完了報告にも記載。
- 今回変更してよい範囲：共有のためのREADME・ignore・docs整理と選別コミット。表示コード・素材は現状維持。
- 触らない範囲：元試作、別clone、6462の共通指示書原本、既存履歴、他方のプロセス。
- 公開インターフェース：静的 `/` `/works/` `/news/` `/contact/`、404、GET `/api/health` → `{status:"ok",service:"ennui"}`。新たな共有型の合意なし。

## 完了内容・ファイル選別

- Astro/Cloudflare設定、package.json/lock、tsconfig、srcのページ・レイアウト・CSSを共有。
- 現在importされる画像2枚だけを共有。旧仕様を再現するための暫定素材であり、最新採用素材ではない。
  - `rin-desktop-skin-local-v5.png`: SHA256 `bbea1c265e28c36084f38dafbe7e415113d03dfa2f1408d28fc33f687b95bf11`
  - `rin-mobile-color-matched-v7.png`: SHA256 `c38cabcaa2eb45c205f281730c6252ab28fe0430d0654170941eca0ffb5ea50e`
- `scripts/verify-local.mjs` とREADME、履歴docsを共有。
- 共通指示書を `docs/claude-code-handoff.md` へ原文のままコピー。cmp一致確認済み。
- 中間PNG13枚・画像加工スクリプト4本はローカルに保持し、ignoreして今回のコミットから除外。再生成用入力は共有しない。
- node_modules、dist、.astro、.wrangler、artifacts、環境変数ファイル、鍵は除外。本文の秘密キー典型パターン検査で該当なし。認証情報は設定していない。
- 親コミットに既に存在するdesign-proposals等の試作46ファイルは履歴に残る。今回新規に混入させたものではなく、削除や履歴改変はしない。

## 今回の検証

- `npm run check`: 0 errors / 0 warnings / 0 hints。
- `npm run build`: 成功、5静的ページと6種類のWebPを生成。
- 他方のサーバーに触れず、空き確認した4499で `npx wrangler dev --config dist/server/wrangler.json --ip 127.0.0.1 --port 4499` を実行。
- `ENNUI_TEST_URL=http://127.0.0.1:4499 npm run test:local`: 成功。
- 1440×900、390×844、320×568、844×390、768×1024：正しい構図を選択、縦横overflowなし、ロゴ・導線が画面内。
- 下層リンク、404、Workers API、キーボード初期フォーカス、JS例外なしを検証。
- 依存バージョンは据え置き。既存node_modulesを使用（このターンでnpm ciや依存更新は行っていない）。
- 未検証：実機Safari、200%以上の拡大/文字拡大、画像失敗時の可読性、最新基準画像の表示。reduced-motion設定でのフォーカスは検証したが、動作停止機能は未実装なので検証対象外。

## 未完了・判断待ち

- 最新基準画像はPC/SPともお団子。現実装SPは旧い下ろし髪、PCも肌修正済み派生であり、基準画像に一致しない。段階2は未完了と扱う。
- 最新Notion採用記述・2原本の目視/ハッシュ確認、PC文字焼込みとHTMLの重複回避、表示用派生素材の採用確認が次工程。今回素材確認/差替えは実施していない。
- 天気API/地域/時刻/季節、人物分離・動き、Markdown管理、D1/認証/CSV/メールは未実装。下層は準備中。
- 拡大時のoverflow:hiddenによる操作欠落の懸念は段階2で確認・修正する。
- API・初回季節範囲・公開手動切替、認証・メール・保存期間等は未決定。SESSION KV生成は認証方式の採用ではない。
- push・本番公開・実メール・本番DB操作は行わない。

## 次の作業と分担案（未割当）

1. この共有コミットから各自別worktree/ブランチを作る。同じディレクトリやファイルを並行編集しない。
2. 段階2を先に完了：Codexが担当する案は、最新素材の確認・表示用派生の取扱確認・トップ画像参照/CSSの修正。Claudeは読み取りレビュー・受入確認と専用レビュー文書のみ。画像を独自再制作しない。
3. 段階2完了後、段階3のサービス/状態形式を相談。状態計算と描画を分担する案は、型/APIと所有ファイルを先に合意してから開始。
4. 天気・季節→髪/手→段階4 Markdown→段階5問い合わせの順を守る。
5. package.json/lock、Astro/Workers設定、共有CSS、index.astroの編集・統合担当は一人に固定する。担当確定までは両者とも追加実装を始めない。

同一ローカルGitリポジトリのworktreeならこのブランチ/コミットを直接参照できる。別cloneでは未pushのため自動で見えない。ローカルfetchなど共有経路を確認してから分岐する。今回Claudeへのメッセージ送信や作業開始はしていない。
