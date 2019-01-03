import React from 'react';
import FA from 'react-fontawesome';
import { getYoutubeVideoLink, getThumbnailLink } from '../../helpers/youtube';
import { msecToTimeStr } from '../../helpers/time';
import './VideoItem.css';
import { VideoSummary } from '../../models/video';
import { Link } from 'react-router-dom';
import { Image } from '../common/Image';

interface VideoItemProps {
    video: VideoSummary;
    className?: string;
    wordCloud?: boolean;
}

interface VideoItemState {
}

export class VideoItem extends React.Component<VideoItemProps, VideoItemState> {
    constructor(props: VideoItemProps) {
        super(props);
        this.state = {
        };
    }

    public render() {
        const video = this.props.video;

        return <section className={this.getClassName()}>
            <div>
                <div className="thumbnail">
                    {this.getThumbnailBody(video)}
                </div>
                <div className="video-link">
                </div>
                <div className="info-link">
                </div>
            </div>
            <div className="summary">
                <div className="title">
                    <Link to={this.getVideoLinkUrl(video)}>{video.title}</Link>
                </div>
                <div>
                    {this.props.children}
                </div>
            </div>
        </section>;
    }

    getVideoLinkUrl(video: VideoSummary): string {
        let url = `/video/${video.id}`;
        if (this.props.wordCloud !== undefined && this.props.wordCloud) {
            url = url + '#wc';
        }

        return url;
    }

    getClassName(): string {
        if (this.props.className === undefined) {
            return 'video-item';
        }

        return `video-item ${this.props.className}`;
    }

    getThumbnailBody(video: VideoSummary) {
        if (this.props.wordCloud !== undefined && this.props.wordCloud) {
            return <Image src={`/asset/video/${video.id}/wc.png`} width={150} forceError={!this.props.video.existsChatData}/>
        }
        else {
            const youtubeLink = getYoutubeVideoLink(video.id);
            const thumbnailLink = getThumbnailLink(video.id);

            return <a href={youtubeLink} target="_blank">
                <Image src={thumbnailLink} width={150}/>
            </a>;
        }
    }
}