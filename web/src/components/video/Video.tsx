import React from 'react';
import FA from 'react-fontawesome';
import { Share } from 'react-twitter-widgets';
import { RouteComponentProps, RouterChildContext } from 'react-router-dom';
import { Loading } from '../common/Loading';
import { CommonBody } from '../common/CommonBody';
import { fetchVideoDetail } from '../../helpers/fetch';
import { VideoDetail } from '../../models/video';
import { Component } from '../common/Component';
import { ErrorMessage } from '../common/ErrorMessage';
import { YoutubeIframe } from '../common/YoutubeIframe';
import './Video.css';
import { CommonSection } from '../common/CommonSection';
import { Image } from '../common/Image';
import { ChatBarChart } from './ChatBarChart';

interface VideoState {
    video?: VideoDetail;
    hasError: boolean;
    targetMsec: number;
    isDragging: boolean;
    contentKind: ContentKind;
}

enum ContentKind {
    BarChart,
    Text,
    WordCloud,
}

export class Video extends Component<RouteComponentProps, VideoState> {
    constructor(props: RouteComponentProps) {
        super(props);

        this.state = {
            hasError: false,
            targetMsec: 0,
            isDragging: false,
            contentKind: this.getContentKindFromProps(this.props),
        };
        this.targetMsecChange = this.targetMsecChange.bind(this);
        this.onBarChartDratStart = this.onBarChartDratStart.bind(this);
        this.onBarChartDragEnd = this.onBarChartDragEnd.bind(this);

        this.onBarChartClick = this.onBarChartClick.bind(this);
        this.onTextClick = this.onTextClick.bind(this);
        this.onWordCloudClick = this.onWordCloudClick.bind(this);

        const currentId = this.getVideoIdFromProps(this.props);
        if (currentId === null) return;
        this.fetchVideo(currentId);
    }


    public componentDidUpdate(prevProps: RouteComponentProps) {
        const currentId = this.getVideoIdFromProps(this.props);
        if (currentId === null) return;
        const prevId = this.getVideoIdFromProps(prevProps);
        if (currentId == prevId) return;

        this.fetchVideo(currentId);
    }

    public render() {
        return <CommonBody className="video">
            {this.getBody()}
        </CommonBody>
    }

    getBody() {
        const id = this.getVideoIdFromProps(this.props);
        if (this.state.hasError || id === null) {
            return <ErrorMessage />;
        }

        const video = this.state.video;
        if (video !== undefined) {
            return <div>
                <div className="video-container">
                    <YoutubeIframe id={video.id} currentTime={this.state.targetMsec} onCurrentTimeChange={this.targetMsecChange} allowSeekAhead={!this.state.isDragging} />
                </div>
                <CommonSection title={video.title}>
                    <div className="section-body">
                        <div className="tabbar">
                            <div className={this.getTabItemClassName(ContentKind.BarChart)}>
                                <button onClick={this.onBarChartClick}>
                                    <FA name="chart-bar" />
                                </button>
                            </div>
                            <div className={this.getTabItemClassName(ContentKind.Text)}>
                                <button onClick={this.onTextClick}>
                                    <FA name="list"/>
                                </button>
                            </div>
                            <div className={this.getTabItemClassName(ContentKind.WordCloud)}>
                                <button onClick={this.onWordCloudClick}>
                                    <FA name="cloud"/>
                                </button>
                            </div>
                        </div>
                        <div className="tabcontent">
                            {this.getContent(video)}
                        </div>
                    </div>
                </CommonSection>
            </div>;
        }
        else {
            return <Loading />;
        }
    }

    getTabItemClassName(kind: ContentKind): string {
        if (this.state.contentKind === kind) {
            return 'tab-item active';
        }

        return 'tab-item';
    }

    onBarChartClick() {
        this.setState({ ...this.state, contentKind: ContentKind.BarChart });
    }

    onTextClick() {
        this.setState({ ...this.state, contentKind: ContentKind.Text });
    }

    onWordCloudClick() {
        this.setState({ ...this.state, contentKind: ContentKind.WordCloud });
    }

    getContentKindFromProps(props: RouteComponentProps): ContentKind {
        switch (props.location.hash) {
            case '#text':
                return ContentKind.Text;
            case '#wc':
                return ContentKind.WordCloud;
            default:
                return ContentKind.BarChart;
        }
    }

    getContent(video: VideoDetail) {
        if (video.words === undefined) {
            return <div className="content-notavailable">
                <FA className="content-notavailable-icon" name="ban" size="4x"/>
                <span>データがありません</span>
            </div>;
        }

        switch (this.state.contentKind) {
            case ContentKind.BarChart:
                return <ChatBarChart video={video} targetMsec={this.state.targetMsec}
                    onTargetMsecChange={this.targetMsecChange}
                    onDragStart={this.onBarChartDratStart}
                    onDragEnd={this.onBarChartDragEnd} />
            case ContentKind.Text:
                return this.getTextContent(video);
            case ContentKind.WordCloud:
                return this.getWordCloudContent(video);
            default:
                return <ErrorMessage/>;
        }
    }

    getTextContent(video: VideoDetail) {
        const wordMap = new Map<string, number>();
        if (video.words !== undefined) {
            video.words.forEach(w => {
                w.words.forEach(x => {
                    const word = x.word;
                    const count = x.count;
                    let c = wordMap.get(word);
                    if (c === undefined) {
                        c = count;
                    }
                    else {
                        c += count;
                    }
                    wordMap.set(word, c);
                });
            });
        }

        const entries = Array.from(wordMap.entries());
        entries.sort((a, b) => {
            if (a[1] < b[1]) return 1;
            if (a[1] > b[1]) return -1;
            return 0;
        });

        const texts =  entries.slice(0, 500).map(e => {
            return <div key={e[0]}>{e[0]}</div>;
        });

        return <div>
            <h3>よく使われている単語</h3>
            {texts}
        </div>;
    }

    getWordCloudContent(video: VideoDetail) {
        const shareOption = {
            text: `${video.title}`,
        };
        return <div>
            <Share url={`https://yamatoiori-kawaii.live/video/${video.id}#wc`} options={shareOption}/>
            <Image src={`/asset/video/${video.id}/wc.png`}/>
        </div>;

    }

    getVideoIdFromProps(props: RouteComponentProps): string | null {
        const params: any = props.match.params;
        const id: string | undefined = params['id'];
        return id || null;
    }

    targetMsecChange(msec: number) {
        this.setState({ ...this.state, targetMsec: msec });
    }

    fetchVideo(id: string) {
        this.wrapPromise(fetchVideoDetail(id))
            .then(v => {
                this.setState({ ...this.state, video: v });
            })
            .catch(() => {
                this.setState({ ...this.state, hasError: true });
            });
    }

    onBarChartDratStart() {
        this.setState({ ...this.state, isDragging: true });
    }

    onBarChartDragEnd() {
        this.setState({ ...this.state, isDragging: false });
    }
}