import React from 'react';
import { VideoEntry } from './ChatSearch';
import { getYoutubeVideoLink, getThumbnailLink } from '../../helpers/youtube';
import { msecToTimeStr } from '../../helpers/time';
import './SearchVideoItem.css';
import { VideoItem } from '../common/VideoItem';

interface VideoItemProp {
    video: VideoEntry;
}

export class SearchVideoItem extends React.Component<VideoItemProp> {
    public render() {
        const id = this.props.video.summary.id;
        return <VideoItem className="chatsearch-result-item" video={this.props.video.summary}>
            {this.props.video.chats.map((chat, chatIndex) => {
                return <div className="chat" key={chatIndex}>
                    <span className="offsetMsec">{msecToTimeStr(chat.offsetMsec)}</span>
                    <a className="video-link" target="_blank" href={getYoutubeVideoLink(id, chat.offsetMsec)}>
                        <span className="message" title={chat.message}>{chat.message}</span>
                    </a>
                </div>;
            })}
        </VideoItem>;
    }
}