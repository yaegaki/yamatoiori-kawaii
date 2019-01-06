#ローカルにダウンロードしたvideo_infoを読み込んで返す

import os
import codecs
import json

import isodate

work_dir = './work'

def get_local_video_info():
    result = []
    for file in os.listdir(work_dir):
        if not file.endswith('.json'):
            continue

        id = os.path.splitext(os.path.basename(file))[0]
        # チャットのデータがあるかどうかはワードクラウドが生成されているかどうかで判定する
        exists_chat_data = os.path.isfile('./video_src/{}/wc.png'.format(id))

        with codecs.open('{}/{}'.format(work_dir, file), 'r', 'utf-8') as f:
            obj = json.loads(f.read())
            for item in obj['items']:
                id = item['id']
                title = item['snippet']['title'].replace(':', '：')
                duration_msec = isodate.parse_duration(item['contentDetails']['duration']).seconds * 1000
                if 'liveStreamingDetails' in item:
                    startTime = item['liveStreamingDetails']['scheduledStartTime']
                    result.append({
                        'id': id,
                        'title': title,
                        'date': startTime.replace(':', ';'),
                        'isLive': True,
                        'existsChatData': exists_chat_data,
                        'durationMsec': duration_msec,
                    })
                else:
                    publishedTime = item['snippet']['publishedAt']
                    result.append({
                        'id': id,
                        'title': title,
                        'date': publishedTime.replace(':', ';'),
                        'isLive': False,
                        # 動画の場合はチャットはない
                        'existsChatData': False,
                        'durationMsec': duration_msec,
                    })
    
    return result