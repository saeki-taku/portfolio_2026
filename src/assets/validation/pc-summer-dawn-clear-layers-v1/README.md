# 夏・dawn・晴れ PC

レビュー候補。1345×1170 RGBA、原点(0,0)。manifest順で同じ矩形へ重ねる。夏昼採用素材のalpha・座標・夏緑葉・既存人物を維持。新ポーズなし。人物・ノート・人物依存下地/影のレイヤーは納品順から除外。室内灯OFF、街灯りOFF。カップ・植物も各グループ全体で切替。

built-in image_genで時間帯の光ガイドを作り、低周波の照明と元画素の細部を組み合わせた。元レイヤーを拡縮せず、形とalphaを保持。ガイドの建物細部は移植していない。絵画的な照明であり物理的シミュレーションではない。

各層の寸法・alpha差0、ガラスマスク一致、各表示状態の再合成一致・透明穴0を検証。人物OFF・境界は別途目視確認結果をverification.jsonへ記録。既存春・夏昼は未変更。PCカップは下地に一部含まれるため単独非表示には既存制約あり。サイト実装・ブラウザ表示・低性能端末・天気切替は未検証。雨/曇り/他季節/アニメーションは対象外。

Final QA: source hashes unchanged; all manifest references and full-canvas metadata verified. Whole scene/person-off reviewed. Night city lights are a separate generated-guide extraction; exact correspondence to every building window remains an aesthetic limitation. Fine inherited painted shading remains. See consolidated summer-clear-five-scenes-handoff.md.
