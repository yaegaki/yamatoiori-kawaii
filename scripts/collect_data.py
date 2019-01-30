import os
import subprocess
import shutil
import sys

PTERARORON_PATH = 'XXXXX'
UNUN_PATH = 'XXXXX'

video_ids = sys.argv[1:]

# 引数で指定されていない場合は既存のものをすべてやりなおす
if len(video_ids) == 0:
    # ライブチャットが無効になっているアーカイブ
    exclude_ids = ['lfsqXE3J-YY', 'SP5hzAgl3bY']

    from get_local_video_info import get_local_video_info
    for info in get_local_video_info():
        # 生放送のアーカイブのみ
        if info['isLive']:
            video_id = info['id']
            if video_id in exclude_ids:
                continue
            video_ids.append(video_id)

print(video_ids)

# pteraroron関連

# pteraroron/messageにjsonファイルが存在するかどうかチェック
def is_pteraroron_extracted(video_id):
    json_path = os.path.join(PTERARORON_PATH, 'message', video_id + '.json')
    return os.path.isfile(json_path)


need_extract_video_ids = [x for x in video_ids if not is_pteraroron_extracted(x)]

# 取得する必要がある動画があれば取得
if len(need_extract_video_ids) > 0:
    print('extract targets - {}'.format(need_extract_video_ids))
    pteraroron_dig_args = ['node', './dist/index.js']
    pteraroron_dig_args.extend(need_extract_video_ids)
    print('start dig video(pteraroron).')
    subprocess.check_call(pteraroron_dig_args, cwd=PTERARORON_PATH)
    pteraroron_extract_message_args = ['node', './dist/extract-message-json.js']
    print('start export message(pteraroron).')
    subprocess.check_call(pteraroron_extract_message_args, cwd=PTERARORON_PATH)


# unun関連

# 必要なファイルたち
unun_files = ['aggregate.json', 'characterize.json', 'wc.png']

# ワードクラウドとjsonが出力されているかどうかチェック
def is_unun_collected(video_id):
    base_path = os.path.join(UNUN_PATH, 'video_src', video_id)
    if not os.path.isdir(base_path):
        return False
    
    for file in unun_files:
        file_path = os.path.join(base_path, file)
        # 一つでもなかったらFalse
        if not os.path.isfile(file_path):
            return False

    return True

need_collect_video_ids = [x for x in video_ids if not is_unun_collected(x)]

if len(need_collect_video_ids) > 0:
    # pteraroron/messageにあるjsonファイルをunun/livechatにコピー
    for video_id in need_collect_video_ids:
        unun_json_path = os.path.join(UNUN_PATH, 'livechat', video_id + '.json')
        if os.path.isfile(unun_json_path):
            continue

        pteraroron_json_path = os.path.join(PTERARORON_PATH, 'message', video_id + '.json')
        # チャットデータがない場合
        if not os.path.isfile(pteraroron_json_path):
            continue

        shutil.copyfile(pteraroron_json_path, unun_json_path)
    
    # データ収集スクリプトを実行
    unun_args = ['python', './collect_data.py', './GenJyuuGothicX-P-Bold.ttf']
    print('start collect data(unun).')
    subprocess.check_call(unun_args, cwd=UNUN_PATH)


# ununで生成したデータをyamatoiori-kawaiiに持ってくる

for video_id in video_ids:
    dst_base_dir = os.path.join('./video_src', video_id)
    if not os.path.isdir(dst_base_dir):
        os.mkdir(dst_base_dir)

    src_base_dir = os.path.join(UNUN_PATH, 'video_src', video_id)

    for file in unun_files:
        dst_file_path = os.path.join(dst_base_dir, file)
        src_file_path = os.path.join(src_base_dir, file)

        if not os.path.isfile(src_file_path):
            print('not exists chat data. {}'.format(video_id))
            continue

        if not os.path.isfile(dst_file_path):
            print('copy {} to {}'.format(file, dst_file_path))
            shutil.copyfile(src_file_path, dst_file_path)
    

# 動画のタイトルや長さなどの情報をYoutubeDataAPIで取得する
print('get_video_info.')
subprocess.check_call(['python', './scripts/get_video_info.py'])
# チャット検索用のデータをwork/all_characterize_chat.txtに出力する
print('format_characterize_chat_to_register_datastore.')
subprocess.check_call(['python', './scripts/format_characterize_chat_to_register_datastore.py'])
# サマリ用のデータをwork/all_video_info.txtに出力する
print('format_video_info_to_register_datastore.')
subprocess.check_call(['python', './scripts/format_video_info_to_register_datastore.py'])

# ワードクラウドなどをweb用フォルダに配置する
subprocess.check_call(['python', './scripts/place_asset_to_public.py'])

print('done')
print('you must execute following commands.')

# デプロイ系のコマンドは手動でやる
print('$ gcloud app deploy')
print('$ python ./scripts/register_characterize_chat.py')
print('$ python ./scripts/register_video_info.py')



