from get_local_video_info import get_local_video_info

for info in get_local_video_info():
    print('{id}:{title}:{date}:{isLive}:{existsChatData}'.format(**info))
