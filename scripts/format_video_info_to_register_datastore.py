import os
import codecs
import json

from get_local_video_info import get_local_video_info

work_dir = './work'

lines = []
for info in get_local_video_info():
    is_live_flag = 1 if info['isLive'] else 0
    exists_chat_flag = 1 if info['existsChatData'] else 0
    lines.append('{}:{}:{}:{}:{}'.format(info['id'], info['title'], info['date'], is_live_flag, exists_chat_flag))

with codecs.open('{}/all_video_info.txt'.format(work_dir), 'w', 'utf-8') as f:
    for line in lines:
        f.write('{}\n'.format(line))