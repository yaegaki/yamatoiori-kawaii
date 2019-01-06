import os
import codecs
import json
import shutil

from get_local_video_info import get_local_video_info

work_dir = './work'

output_base_dir = './web/public/asset/video'

for info in get_local_video_info():
    id = info['id']
    exists_chat_data = info['existsChatData']

    output_dir = '{}/{}'.format(output_base_dir, id)
    if not os.path.isdir(output_dir):
        os.makedirs(output_dir)
    
    if exists_chat_data:
        # 集計したデータをinfoにねじ込む
        with codecs.open('./video_src/{}/aggregate.json'.format(id), 'r', 'utf-8') as f:
            info['words'] = json.loads(f.read())
        
        wc_dst_path = '{}/wc.png'.format(output_dir)
        # ワードクラウドのコピー
        shutil.copyfile('./video_src/{}/wc.png'.format(id), wc_dst_path)
    
    detail_path = '{}/detail.json'.format(output_dir)
    with codecs.open(detail_path, 'w', 'utf-8') as f:
        f.write(json.dumps(info, ensure_ascii=False))
    print('{} done.'.format(id))


