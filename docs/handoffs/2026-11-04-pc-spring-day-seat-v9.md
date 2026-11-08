# 承認済みPC窓台v9の実装

ユーザー採用承認を受け、PC春昼晴れだけにv9を反映。実装checkout `/Users/saekitakuya/.codex/worktrees/e84c/ポートフォリオ`。原本・旧版・既存未コミット変更を保持。コミット/プッシュ/公開なし。

正本 `/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/pc-deeper-window-seat-sample-v9/background-perspective-adjusted.png`、SHA256 `a19a5bc0b585b278517988afd9b0d2c993e7acb20bcb68e0ccb035de7b6c43f1`。README・build.cjs・背景を確認。preview-composite.pngは実装に使用していない。

## レイヤー

現行外景+室内が提案時current-background.pngと全画素一致することを確認し、v9との差分197,974画素（範囲x0..1344,y720..995）だけを透明キャンバスへ抽出。`src/assets/validation/pc-spring-day-seat-v9/seat-v9-structure.png` を室内直後、植物/カップOFF補修より下へ追加。現行背景とこの構造レイヤーの再合成は承認v9と全画素一致。新たな人物・鉢・カップ焼き込みはなく、既存の独立前景/下地方式を維持。

植物OFF下地とカップOFF下地は旧alphaを保ち、v9と現行背景のRGB差分を反映。カップ底付近に残った旧模様は、承認v9の隣接した空の窓台（同一y、x-115）の画素でy750..787の下地を復元した。y750..759で滑らかに接続し、前縁y775を維持。最終参照は `cup-off-repair-v9-clean.png`。途中ファイル名では開発画像キャッシュに旧配信が残ったため、最終下地を別名にして参照・ビルド・撮影を更新した。再生成は行っていない。植物OFFに使う既存の街並み局所補修筆致は従来どおり。

凛は承認hem-cleanup画像、100%、下14pxのまま。影も位置/縮尺不変。SP素材/CSSと他季節・時間帯は変更しない。

推定消失点(784,444.769)、前縁y775、左接合(191.429,775)、縦稜線下端y850、左端壁床境界y980.909、右前縁交点x1375.429（画面外）を持つ承認背景をそのまま抽出した。推定消失点は設計値であってカメラ校正ではない。

## 検証

`verify-spring-day-seat-v9.mjs`：人物/カップ/植物8状態×PC1440×900/1920×1080、SP393×852/768×1024を通過。新構造レイヤー存在・各表示切替・接地位置・横あふれなし・ページエラーなしを検証。全景、左右接合、足元を `artifacts/spring-day-seat-v9/` に保存。

PC両画角のON/全OFF、カップOFF足元、左右近接を目視。角の丸みや旧境界の二重線、段差、透け、カップ底の残像なし。人物の足先/踵と腰は現行位置のまま、新しい窓台上面に収まる。承認済みの足と窓枠の位置関係は変えていない。

SP2画角の人物/カップ/植物ON画像は10月31日承認実装画像と全画素一致。春15シーン×PC/SP、夏晴れ5シーン×PC/SP回帰成功。checkは74ファイル、errors/warnings/hints 0。通常build・build:dev-preview成功、git diff --check成功。途中Chrome撮影/起動タイムアウトは再試行で解消。

確認URL http://127.0.0.1:4512/ （シーン設定→手動→春→昼→晴れ、ローカルサーバー稼働中のみ）。

変更ファイル：src/pages/index.astro、src/assets/validation/pc-spring-day-seat-v9/、scripts/verify-spring-day-seat-v9.mjs、本記録。Notion更新は親担当。未解決ブロッカーなし。下地補修の局所筆致差・WebP配信による補間差は残る。
