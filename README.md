# yamatoiori-kawaii

[https://yamatoiori-kawaii.live/](https://yamatoiori-kawaii.live/)

## データの登録手順

### データの収集

`pteraroron`のディレクトリに移動し、以下のコマンドを実行する。

```sh
node ./dist/index.js VIDEO_ID

# もし、ソースを変更する場合は事前にtscを実行しておく
```

`pteraroron/video`配下にデータが取得できているので以下のコマンドで`json`に変換する。

```sh
node .\dist\extract-message-json.js
```

`pteraroron/message`に`json`ファイルが配置される。

### データの加工

`pteraroron/message`の中身を`unun/livechat`にコピーする。
`unun`のディレクトリに移動し、以下のコマンドを実行する。

```sh
# python3で実行すること
# 特にgcloudがpython2でしか動かないのでそれの後は注意する
python .\collect_data.py .\GenJyuuGothicX-P-Bold.ttf
```

`unun/video_src`に各種データのファイルが配置される。

### データの登録前準備

`unun/video_src`の中身を`yamatoiori-kawaii/video_src`にコピーする。
`yamatoiori-kawaii`のディレクトリに移動し、以下のコマンドを実行する。

```sh
# 動画のタイトルや長さなどの情報をYoutubeDataAPIで取得する
python .\scripts\get_video_info.py
# チャット検索用のデータをwork/all_characterize_chat.txtに出力する
python .\scripts\format_characterize_chat_to_register_datastore.py
# サマリ用のデータをwork/all_video_info.txtに出力する
python .\scripts\format_video_info_to_register_datastore.py
```

### アプリのデプロイ

`Datastore`に登録する前にワードクラウドなどを含めたアプリをデプロイする必要がある。

以下のコマンドで`yamatoiori-kawaii/web/public`にワードクラウドなどを配置する。

```sh
python .\scripts\place_asset_to_public.py
```

`yamatoiori-kawaii/web`ディレクトリに移動し、アプリのビルドする。

```sh
cd web
npm run build
```

`yamatoiori-kawaii`ディレクトリに戻り、アプリをデプロイする。


```sh
cd ..\
gcloud app deploy
```

### Datastoreへの登録

ログインしていない場合もしくはログアウトしてしまっている場合は`https://yamatoiori-kawaii.live/api/looogin`でログインする。
ログイン後、取得したクッキーを`get_secrets.py`に書き込む。
(appspotのほうで取得したクッキーは使用できないので注意する。)

以下のコマンドでチャット検索用データを登録。
必ずサマリより前にチャット検索用データを登録すること。

```sh
python .\scripts\register_characterize_chat.py
```

以下のコマンドで動画情報を登録。

```sh
python .\scripts\register_video_info.py
```

## TODO

手順が多いので自動化できるようにスクリプトを追加する。  
pteraroronとununをサブモジュールにする？  
`register_characterize_chat`とかが途中で失敗したときのために各チャットに適当なidを設定してトランザクション処理にする。