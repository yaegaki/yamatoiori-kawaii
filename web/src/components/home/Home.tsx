import React from 'react';
import FA from 'react-fontawesome';
import { Loading } from '../common/Loading';
import { fetchVideoSummary } from '../../helpers/fetch';
import { VideoSummary } from '../../models/video';
import { HomeVideoItem } from './HomeVideoItem';
import { VideoGrid } from '../common/VideoGrid';
import { ErrorMessage } from '../common/ErrorMessage';
import { Component } from '../common/Component';
import { CommonBody } from '../common/CommonBody';
import './Home.css';

interface HomeProps {
}

interface HomeState {
    summaries: VideoSummary[];
    hasError: boolean;
    thumbnailKind: ThumbnailKind;
}

enum ThumbnailKind {
    Youtube,
    WordCloud,
}

export class Home extends Component<HomeProps, HomeState> {
    constructor(props: HomeProps) {
        super(props);
        
        this.state = {
            summaries: [],
            hasError: false,
            thumbnailKind: ThumbnailKind.Youtube,
        };

        this.wrapPromise(fetchVideoSummary())
            .then(summaries => {
                this.setState({ ...this.state, summaries });
            })
            .catch(() => {
                this.setState({ ...this.state, hasError: true });
            });
        
        this.onYoutubeThumbnailClick = this.onYoutubeThumbnailClick.bind(this);
        this.onWordCloudThumbnailClick = this.onWordCloudThumbnailClick.bind(this);
    }

    public render() {
        return <CommonBody className="home">
            <div>
                <div className="tabbar">
                    <div className={this.getTabItemClassName(ThumbnailKind.Youtube)}>
                        <button onClick={this.onYoutubeThumbnailClick}>
                            <FA name="image" />
                        </button>
                    </div>
                    <div className={this.getTabItemClassName(ThumbnailKind.WordCloud)}>
                        <button onClick={this.onWordCloudThumbnailClick}>
                            <FA name="cloud" />
                        </button>
                    </div>
                </div>
            </div>
            {this.getBody()}
        </CommonBody>;
    }

    getTabItemClassName(kind: ThumbnailKind): string {
        if (this.state.thumbnailKind === kind) {
            return 'tab-item active';
        }
        return 'tab-item';
    }

    onYoutubeThumbnailClick() {
        this.setState({ ...this.state, thumbnailKind: ThumbnailKind.Youtube });
    }

    onWordCloudThumbnailClick() {
        this.setState({ ...this.state, thumbnailKind: ThumbnailKind.WordCloud });
    }

    getBody() {
        if (this.state.hasError) {
            return <ErrorMessage/>;
        }

        if (this.state.summaries.length === 0) {
            return <Loading/>;
        }
        else {
            const children = this.state.summaries.map(s => {
                return <HomeVideoItem key={s.id} video={s} wordCloud={this.state.thumbnailKind === ThumbnailKind.WordCloud} />
            });

            return <VideoGrid>
                {children}
            </VideoGrid>;
        }
    }
}