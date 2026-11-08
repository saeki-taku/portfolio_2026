# PC夏5 カップ持ち手・縁：調査（2026-11-08 JST）

画像制作は進行役、担当は調査と合成コード。新素材の取り込み・画像編集・合成コード変更はこの調査では未実施。SP/人物/窓台v9を保持する。

## 原因

`05-cup-foreground.png` はアイス飲料だが、持ち手内側もalpha255。穴が透明になっていない。さらに `02a-cup-body-contact.png` には元の白い陶器カップが残存し、人物ONでは `03a-rin-cup-on-restore.png` もカップ領域を復元する。05だけ透明化すると下にある旧カップが穴や縁から見えるため、alpha修正と合成順序の両方が必要。

全5シーンの05 alphaは同じ（SHA256先頭 a1e68d209f0d）。座標・縮尺共通。ImageGen結果の採用alphaだけを既存各シーンRGBへ適用すれば各時間帯の色を保持できる。画像の加工は進行役がImageGen由来の素材として行う。

## 入力と座標

worktree `/Users/saekitakuya/.codex/worktrees/e84c/ポートフォリオ/src/assets/validation/` の以下5フォルダ。各 `05-cup-foreground.png` が元RGB/外形の正本。

- pc-summer-dawn-clear-layers-v5
- pc-summer-day-clear-layers-v5
- pc-summer-evening-clear-layers-v5
- pc-summer-night-awake-clear-layers-v5
- pc-summer-night-asleep-clear-layers-v5

原画1345×1170。05 alpha>128の外接矩形は x1056..1102 / y724..764。重点：持ち手内側 x1087..1100 / y734..750。確認ROI x1045,y710,width85,height80。

診断crop（制作素材ではない）：`/tmp/cup-audit-05-cup-foreground.png` と `/tmp/cup-audit-02a-cup-body-contact.png`。

採用済み全景はプロジェクト `design-proposals/pc-seat-v9-rollout-outputs/{scene}-background-v9.png`。これはカップONを含むため、透明な穴の下地には使わず、サイトの検証済みcupOFF状態を使用する。

## 最小合成変更案

新05を採用した夏シーンだけを対象にmakeSceneLayersを分岐する。

1. 旧02a-cup-body-contactと03a-rin-cup-on-restoreを描画リストから外す。
2. 10-cup-off-repaint / 11-cup-off-sp-refine / seat-v9-cup-off-* のcup:false条件を外す。rin:true/false条件は保持し、検証済みcupOFF下地を常時使用する。
3. 02b-cup-contact-shadowがある昼/夕/夜起床では、元の影をcupON時だけ復元下地の上・新05の下へ配置。影bbox x1077..1112/y755..773、238画素。明け方/就寝に新影を勝手に追加しない。
4. 新05を最後に重ね、group=cupを維持。これで穴の向こうに復元済み人物/座面が見える。

03-rinと04-contact-shadowは変更しない。03aの人物近傍は既存cupOFF側10/11による復元があるため、それを常時使う。単に03aを削除するだけではなく必ずセットで切り替える。

## 受領後の手順

- 寸法/位置/縮尺、持ち手外形、元RGB保持、alpha変更範囲を検査。丸い別形状への変更は採用しない。
- 新カップ素材を別フォルダに保存し、既存v5原本を上書きしない。
- `sync-seat-v9-object-underlays.mjs` を再実行して新カップを上書きしないよう新素材の経路は独立させる。
- v9層と同様に内容SHA付きURLとPNG配信を使用。同一URL最適化キャッシュで旧alphaが戻る事象を実測済み。
- 夏5×PC2画角の全64状態でcupON/OFF、人物/植物組合せ、縁と穴を近接比較。cupOFF側は今回の採用前と画素一致が望ましい。
- 春/SP回帰とcheck/build、プレビュー接続確認。コミット/プッシュ不要。
