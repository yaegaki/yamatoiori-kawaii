import React from 'react';
import { VideoItem } from '../common/VideoItem';
import { VideoSummary } from '../../models/video';
import { dateToDisplayStr } from '../../helpers/time';

import './HomeVideoItem.css';

interface HomeVideoItemProps {
    video: VideoSummary;
    wordCloud?: boolean;
}

export class HomeVideoItem extends React.Component<HomeVideoItemProps> {
    constructor(props: HomeVideoItemProps) {
        super(props);
    }

    public render() {
        const video = this.props.video;
        return <VideoItem video={this.props.video} wordCloud={this.props.wordCloud}>
            <div className="video-info">
                <span className="date-header">配信日</span>
                <span className="date" >{dateToDisplayStr(this.props.video.date)}</span>
            </div>
        </VideoItem>;
    }
}