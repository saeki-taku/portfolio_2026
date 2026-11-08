# 春昼・雨 PC v2

1345×1170、左上原点(0,0)。春昼・曇りPCの窓/人物/カップ位置を維持した雨のレビュー候補。採用・サイト実装は未実施。旧 `pc-spring-day-rain-layers-v1` は保留原本として残し、そこから雨外景と雨天の室内/人物照明を再利用した。雨筋とガラス滴は新しい可視マスクで再合成した。昼の人物を再生成していない。

`manifest.json` の静止層を下から順に重ね、人物表示に合う `rain-outdoor-*` と `rain-glass-droplets-*` を最後に重ねる。雨効果は最後に合成するが、PNG自体を窓ガラスの開口から人物の実輪郭を除いた範囲へ切り抜いている。壁・窓桟・窓台・室内・凛に雨を描かない。雨筋は屋外降雨、滴はガラス面で別素材。アニメーション素材ではなく静止サンプル。

`glass-mask.png` は白=ガラス、黒=それ以外の**輝度**マスク。透明度で使う場合は `rain-visibility-alpha-rin-{on|off}.png` を使い、alphaモードを指定する。両形式を取り違えないこと。効果PNGはすでに切り抜き済み。人物OFFでは接触影と `03-rin.png` を一緒に外し、`rin-off` の効果PNGに切り替える。PCのカップは室内側に一部焼き込まれているため、単独OFFは未対応。

`preview-composite.png` / `preview-no-rin.png` は雨ONの確認用。`preview-rain-effect-off.png` は効果を外しても雨天として成立する静止背景。`compare-cloudy-rain.png` は曇りとの比較。全PNGの寸法、窓/外景alpha、保護レイヤーのハッシュ、雨漏れ、透明穴を `verification.json` に記録した。

絵の雨量・線の太さ・滴の密度はユーザー確認前。実天気API、雨の動画/Canvasアニメーション、他時間帯は対象外。再構築: `node ../build-spring-day-rain-current.cjs`。
