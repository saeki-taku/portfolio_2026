# ennui

AstroでHTMLを事前生成し、Cloudflare Workersで静的配信とAPIを一緒に扱うポートフォリオ。
現在は土台とPC/スマホの固定構図まで。元試作は `design-proposals/` とルートHTMLに保持。

## 共有時の状態（2026-09-26）

最初に [共通指示書](docs/claude-code-handoff.md) と [引き継ぎ](docs/handoffs/2026-09-26-sharing-baseline.md) を読むこと。
現在の画像は旧実装のスナップショットで、最新採用のPC/SP基準画像は未反映。SPは旧い下ろし髪のまま。
このコミットは実装共有用であり、ビジュアルの採用・段階2の完了を意味しない。画像加工の中間素材・スクリプトはローカルに残し共有対象から除外。
新しい素材を採用する際は `.gitignore` の画像許可リストも更新する。

## ローカル起動

Node.js 22.12以上（検証: 24.16.0）、Google Chrome（ブラウザ検証時）が必要。

```sh
npm ci
npm run check
npm run build
npm run preview
```

プレビュー: http://127.0.0.1:4399 。起動中に別ターミナルで `npm run test:local` を実行。
5画面サイズ、導線、404、Workers API、キーボードフォーカスを確認し、`artifacts/` に画像を保存。
開発用は `npm run dev -- --port 4398`。

公開コマンドはまだ用意していない。問い合わせは準備中で送信・保存されない。

素材の由来と未決定事項は [実装記録](docs/implementation.md) を参照。
