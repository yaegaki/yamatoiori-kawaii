# yamatoiori-kawaii

[https://yamatoiori-kawaii.live/](https://yamatoiori-kawaii.live/)

## データの登録手順

### データの収集

`scripts/collect_data.py`の以下の部分を正しいパスに書き換える。

```python
PTERARORON_PATH = 'XXXXX'
UNUN_PATH = 'XXXXX'
```

引数に登録したい動画のidを指定してスクリプトを実行する。

```sh
python ./scripts/collect_data.py video_id video_id2
```

### デプロイと登録

以下のコマンドを順番に実行する。

```sh
gcloud app deploy
python ./scripts/register_characterize_chat.py
python ./scripts/register_video_info.py
```


## TODO

`register_characterize_chat`とかが途中で失敗したときのために各チャットに適当なidを設定してトランザクション処理にする。
