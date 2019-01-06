import codecs
import requests

# ログインして取得したクッキーをいれる
cookie = 'XXXX'

# endpoint = 'https://yamatoiori-kawaii.appspot.com/api/register_chat'
endpoint = 'http://localhost:8080/api/register_chat'

work_dir = './work'

def post(lines):
    cookies = {'SACSID': cookie}
    response = requests.post(endpoint, cookies=cookies, data={"data": '\n'.join(lines)})
    print(response.status_code)
    print(response.text)
    return response.status_code


def main():
    with codecs.open('{}/all_characterize_chat.txt'.format(work_dir), 'r', 'utf-8') as f:
        lines = []
        count = 0
        for line in f:
            (line)
            lines.append(line.strip())
            if len(lines) >= 500:
                count += len(lines)
                print('start register - {}'.format(count))
                result = post(lines)
                if result != 200:
                    return
                lines = []

        l = len(lines)
        if l > 0:
            count += len(lines)
            print('start register - {}'.format(count))
            post(lines)
            count += len(lines)

main()