# language: ja
@e2e @video @scenario
機能: 新郎新婦クイズ
  仕様: docs/scenario-spec.md（SC-QUIZ-*）

  シナリオ: 共有URLを開くと同じ問題セットになる
    # SC-QUIZ-01
    前提 クイズ画面を開いている
    もし 問題に目印 "E2Eマーカー問題" を付けて共有URLを作る
    かつ 別端末相当でその共有URLからクイズを開始する
    ならば 問題文に "E2Eマーカー問題" と表示される
