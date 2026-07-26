# language: ja
@e2e @video @scenario
機能: ライブ余興（Guest / Screen / Admin）
  仕様: docs/scenario-spec.md（SC-LIVE-*）

  シナリオ: どっち？でGuestが投票し結果が表示される
    # SC-LIVE-01
    もし ライブAdminの "either" を開く
    かつ ルームを作成して入室する
    かつ Adminが投票を開始する
    かつ ゲストがそのルームの "either" を開いて左に投票する
    かつ Adminが結果を表示する
    ならば 票の合計が1以上である

  シナリオ: 早押しクイズで最速ゲストが判定される
    # SC-LIVE-02
    もし ライブAdminの "buzz" を開く
    かつ ルームを作成して入室する
    かつ Adminが早押しを開始する
    かつ ゲストがそのルームの "buzz" で早押しする
    ならば スクリーンに最速ゲストが表示される

  シナリオ: リクエストボードに投稿できる
    # SC-LIVE-03
    もし ライブAdminの "request" を開く
    かつ ルームを作成して入室する
    かつ ゲストがそのルームの "request" に "余興して" を投稿する
    ならば リクエスト一覧に "余興して" と表示される
