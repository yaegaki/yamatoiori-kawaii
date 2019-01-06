import codecs
import json

from get_local_video_info import get_local_video_info

work_dir = './work'

lines = []
for info in get_local_video_info():
    id = info['id']
    exists_chat_data = info['existsChatData']

    if not exists_chat_data:
        continue
    
    with codecs.open('./video_src/{}/characterize.json'.format(id), 'r', 'utf-8') as f:
        chats = json.loads(f.read())
        for chat in chats:
            m = chat['sentence']
            msec = chat['msec']
            lines.append('{}:{}:{}'.format(m, id, msec))

with codecs.open('{}/all_characterize_chat.txt'.format(work_dir), 'w', 'utf-8') as f:
    for line in lines:
        f.write('{}\n'.format(line))


