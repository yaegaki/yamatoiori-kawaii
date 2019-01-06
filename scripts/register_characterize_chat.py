import codecs
import requests

import get_secrets

# ログインして取得したクッキーをいれる
cookies = {'SACSID': get_secrets.app_login_cookie()}
endpoint_base = 'https://yamatoiori-kawaii.appspot.com/api'
# endpoint_base = 'http://localhost:8080/api'

summary_endpoint = '{}/summary_without_cache'.format(endpoint_base)
register_endpoint = '{}/register_chat'.format(endpoint_base)

work_dir = './work'

def post(lines):
    response = requests.post(register_endpoint, cookies=cookies, data={"data": '\n'.join(lines)})
    print(response.status_code)
    print(response.text)
    return response.status_code


def main():
    res = requests.get(summary_endpoint, cookies=cookies)
    if res.status_code != 200:
        print('get summary error.')
        print(res.status_code)
        print(res.text)
        return

    summary_dic = {}
    for summary in res.json():
        id = summary['Info'].split(':')[0]
        summary_dic[id] = summary
    

    lines = []
    register_id_set = set()
    with codecs.open('{}/all_characterize_chat.txt'.format(work_dir), 'r', 'utf-8') as f:
        for line in f:
            video_id = line.strip().split(':')[1]
            # summaryより先にチャットを登録するのでsummary_dicに入っていないやつが登録対象
            if video_id not in summary_dic:
                if video_id not in register_id_set:
                    register_id_set.add(video_id)
                lines.append(line)

    if len(lines) == 0:
        print('登録対象がありません')
        return
    
    print('register ids.')
    print(register_id_set)
    r = input('register {} items to {}. ok?(y/n):'.format(len(lines), register_endpoint))
    if r != 'y':
        return
    

    total_count = 0
    buffer = []
    for line in lines:
        buffer.append(line)
        # 500件までしか同時登録はできない(ローカルのエミュレータだとそれ以上でもできてしまう。。。)
        if len(buffer) == 500:
            total_count += 500
            print('start register - {}'.format(total_count))
            result = post(buffer)
            if result != 200:
                return
            buffer = []

    if len(buffer) > 0:
        total_count += len(buffer)
        print('start register - {}'.format(total_count))
        post(buffer)

main()