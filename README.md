# ennui

AstroでHTMLを事前生成し、Cloudflare Workersで静的配信とAPIを一緒に扱うポートフォリオ。
現在は土台とPC/スマホの固定構図まで。元試作は `design-proposals/` とルートHTMLに保持。

## 現在の状態（2026-09-27）

[共通指示書](docs/claude-code-handoff.md) と [段階2引き継ぎ](docs/handoffs/2026-09-26-stage2-baseline.md) を読むこと。
PC v8 / SP v3の採用原本を無加工で反映済み。[最新反映記録](docs/handoffs/2026-09-27-approved-art-implementation.md)を優先。縦長画面の背景余白は残課題。
Codexが表示実装、Claudeが読み取りレビュー・受入確認を担当。具体的な編集可能範囲は引き継ぎ参照。
過去の共有開始状態は [共有記録](docs/handoffs/2026-09-26-sharing-baseline.md) に保持。
画像加工の中間素材は共有しない。新しい素材を採用する際は `.gitignore` の画像許可リストも更新する。

## ローカル起動

Node.js 22.12以上（検証: 24.16.0）、Google Chrome（ブラウザ検証時）が必要。

```sh
npm ci
npm run check
npm run build
npm run preview
```

プレビュー: http://127.0.0.1:4399 。起動中に別ターミナルで `npm run test:local` を実行。
8画面サイズ、導線、404、Workers API、キーボードフォーカスを確認し、`artifacts/` に画像を保存。
開発用は `npm run dev -- --port 4398`。

公開コマンドはまだ用意していない。問い合わせは準備中で送信・保存されない。

素材の由来と未決定事項は [実装記録](docs/implementation.md) を参照。
