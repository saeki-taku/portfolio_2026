# SP春昼・曇り 縦長 v1

実装用候補。1024×2400 RGBA、原点(0,0)、10層。manifest.jsonの順で同じ矩形に重ね、透明余白を切り詰めない。人物追加変換は不要。

既存sp-spring-day-cloudy-layers-v1を昼縦長版と同じ行移動で登録。街・人物・足・植物本体・カップ・人物接触影の既存画素を保持。追加空/床と接続帯はbuilt-in image_genの補完ガイドを限定使用。生成原本とプロンプトはinputsに保存。

昼sp-day-tall-layers-v1と外景/室内alphaが完全一致。ガラスマスクは同一ファイル。4表示状態を再合成し差分0・透明穴0。全10層の寸法とalphaを実測。人物/小物は登録後の既存RGB/alphaと一致。ただし03-plant-scene-underpaint.pngだけは元の矩形色差を抑えるため下地外周のalphaをなじませた。元1997px版は上書きしていない。

人物OFFは07-rin-occluded-underpaint.png、rin-contact-shadow.png、08-rin-notebook.pngを一緒に外す。カップ/植物もmanifestのtoggleGroups全体を連動させる。

glass-mask.pngは白がガラス内の輝度マスク。雨未対応。植物下地を雨より上に描くと矩形/帯状に雨を遮るため、雨工程では背景用下地を効果より下へ合成し、植物本体・人物・カップの実輪郭のみで遮蔽する構成を検証する。今回の外周なじませは雨の解決策ではない。

空/床/人物OFF/植物境界はinspection PNGで確認可能。サイト組み込みと端末の表示領域・セーフエリアは未検証。PC曇り、採用昼人物、他時間帯は変更していない。

再構築: node ../build-sp-day-cloudy-tall-v1.cjs。検証詳細: verification.json。
