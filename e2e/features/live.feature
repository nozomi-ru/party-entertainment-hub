# language: ja
@e2e @video @scenario
機能: お色直しドレス色当て
  仕様: docs/scenario-spec.md（SC-LIVE-* / dress）

  シナリオ: Adminが投票を開きGuestが色を選べる
    # SC-DRESS-01
    もし ドレスAdminを "orange" 正解で開く
    かつ AdminがVOTINGを押す
    かつ ゲストがドレスで "orange" に投票する
    ならば ドレスの得票が1以上である
