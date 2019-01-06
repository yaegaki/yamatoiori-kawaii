from apiclient.discovery import build
from apiclient.errors import HttpError
from oauth2client.tools import argparser

import json
import codecs
import time
import os

from get_local_video_info import get_local_video_info
import get_secrets


# Set DEVELOPER_KEY to the API key value from the APIs & auth > Registered apps
# tab of
#   https://cloud.google.com/console
# Please ensure that you have enabled the YouTube Data API for your project.
DEVELOPER_KEY = get_secrets.youtube_developer_key()
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"

CHANNEL_ID = 'UCyb-cllCkMREr9de-hoiDrg'

youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=DEVELOPER_KEY)

def get_all_video_ids(publishedBefore=None):
    result = youtube.search().list(
        channelId=CHANNEL_ID,
        part='id,snippet',
        maxResults=50,
        order='date',
        publishedBefore=publishedBefore,
    ).execute()

    items = result.get('items', [])
    if len(items) == 0:
        return []

    videos = []
    lastPublishedAt = ''
    for item in result.get('items'):
        if item['id']['kind'] == 'youtube#video':
            videos.append(item['id']['videoId'])
        
        lastPublishedAt = item['snippet']['publishedAt']
        
    
    if len(items) == 50 and lastPublishedAt != '':
        time.sleep(1)
        # lastPublishedAtの値と全く同じデータも返ってくるようなので重複してしまうが
        # そこまで問題ではない
        videos.extend(get_all_video_ids(lastPublishedAt))
    
    
    return videos

def get_video_summary(id):
    result = youtube.videos().list(
        part='id,snippet,contentDetails,liveStreamingDetails',
        id=id,
    ).execute()
    return result


output_dir = './work'
# 出力先ディレクトリがなければ作る
if not os.path.isdir(output_dir):
    os.makedirs(output_dir)



local_dict = {x['id']: x for x in get_local_video_info()}
ids = get_all_video_ids()
for id in ids:
    if id in local_dict:
        print('{} skipped.'.format(id))
        continue
    time.sleep(1)
    summary = get_video_summary(id)
    s = json.dumps(summary, ensure_ascii=False)
    with codecs.open('{}/{}.json'.format(output_dir, id), 'w', 'utf-8') as f:
        f.write(s)
    print('{} done.'.format(id))