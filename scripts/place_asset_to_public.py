import os
import codecs
import json
import shutil

from get_local_video_info import get_local_video_info

output_base_dirs = ['./web/public/asset/video', './web/build/asset/video']

for info in get_local_video_info():
    id = info['id']
    exists_chat_data = info['existsChatData']
    place_any = False

    for output_base_dir in output_base_dirs:
        output_dir = '{}/{}'.format(output_base_dir, id)
        if not os.path.isdir(output_dir):
            os.makedirs(output_dir)
            place_any = True
        
        if exists_chat_data:
            # 集計したデータをinfoにねじ込む
            if 'words' not in info:
                with codecs.open('./video_src/{}/aggregate.json'.format(id), 'r', 'utf-8') as f:
                    info['words'] = json.loads(f.read())
            
            wc_dst_path = '{}/wc.png'.format(output_dir)
            if not os.path.exists(wc_dst_path):
                # ワードクラウドのコピー
                shutil.copyfile('./video_src/{}/wc.png'.format(id), wc_dst_path)
                place_any = True
        
        detail_path = '{}/detail.json'.format(output_dir)
        if not os.path.exists(detail_path):
            with codecs.open(detail_path, 'w', 'utf-8') as f:
                f.write(json.dumps(info, ensure_ascii=False))
            place_any = True

    if place_any:
        print('{} done.'.format(id))
