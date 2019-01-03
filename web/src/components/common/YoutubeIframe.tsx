import React from 'react';
import './YoutubeIframe.css';
import { Component } from './Component';
import { Loading } from './Loading';

interface YoutubeIframeProps {
    id: string;
    currentTime: number;
    onCurrentTimeChange?(timeMsec: number): void;
    allowSeekAhead: boolean;
}

interface YoutubeIframeState {
    player: YoutubeIframeWrapper | null;
    loadingVideoId: string | null;
    isPlayerReady: boolean;
}

class YoutubeIframeWrapper {
    YT: any;
    rawPlayer: any | null;
    readyPromise: Promise<void>;
    destroyed: boolean = false;
    timerId: number | null = null;
    onTimeChange: (timeMsec: number) => void;
    prevSeekAhead: boolean = true;

    constructor(YT: any, videoId: string, playerContainerId: string, onTimeChange: (timeMsec: number) => void) {
        this.YT = YT;
        this.publichCurrentTime = this.publichCurrentTime.bind(this);
        this.onStateChange = this.onStateChange.bind(this);
        this.onTimeChange = onTimeChange;

        // widthとheightはcssで設定するのでここでは設定しない
        this.readyPromise = new Promise(resolve => {
            this.rawPlayer = new YT.Player(playerContainerId, {
                videoId: videoId,
                playsinline: 1,
                events: {
                    onReady: () => {
                        if (this.destroyed) return;
                        resolve();
                    },
                    onStateChange: this.onStateChange,
                }
            })
        });
    }

    public getReadyPromise(): Promise<void> {
        return this.readyPromise;
    }

    public destroy() {
        if (this.rawPlayer !== null) {
            this.rawPlayer.destroy();
            this.rawPlayer = null;

            if (this.timerId !== null) {
                clearInterval(this.timerId);
                this.timerId = null;
            }
        }
        this.destroyed = true;
    }

    public seekTo(timeMsec: number, allowSeekAhead: boolean) {
        const currentTime = this.rawPlayer.getCurrentTime();
        const timeSec = timeMsec / 1000;
        // 1秒以内のシークは無視
        if (Math.abs(currentTime - timeSec) < 1) {
            return;
        }

        this.prevSeekAhead = allowSeekAhead;
        this.rawPlayer.seekTo(Math.floor(timeSec), allowSeekAhead);
    }

    publichCurrentTime() {
        if (!this.prevSeekAhead) {
            // シーク時にallowSeekAhead==falseをされている場合は現在時間の通知をしない
            return;
        }

        this.onTimeChange(Math.floor(this.rawPlayer.getCurrentTime() * 1000));
    }

    onStateChange(e: any) {
        if (this.destroyed) return;

        // iframeのホストとなるdivが見つかってない場合は異常なplayerになる
        if (this.rawPlayer.getCurrentTime === undefined) {
            console.error('invalid player.');
            return;
        }
        if (e.data === this.YT.PlayerState.PLAYING) {
            if (this.timerId === null) {
                this.timerId = window.setInterval(this.publichCurrentTime, 1000);
            }
        }
        else {
            if (this.timerId !== null) {
                clearInterval(this.timerId);
                this.timerId = null;
            }
        }
    }
}

export class YoutubeIframe extends Component<YoutubeIframeProps, YoutubeIframeState> {
    constructor(props: YoutubeIframeProps) {
        super(props);

        this.state = {
            player: null,
            isPlayerReady: false,
            loadingVideoId: null,
        };
    }

    public componentDidMount() {
        this.loadPlayer();
    }

    public componentDidUpdate(prevProps: YoutubeIframeProps) {
        if (this.state.player === null || this.props.id !== prevProps.id) {
            this.loadPlayer();
        }
        else if (this.props.currentTime !== prevProps.currentTime || this.props.allowSeekAhead !== prevProps.allowSeekAhead) {
            if (this.state.player !== null) {
                this.state.player.seekTo(this.props.currentTime, this.props.allowSeekAhead);
            }
        }
    }

    public componentWillUnmount() {
        if (this.state.player !== null) {
            this.state.player.destroy();
        }
    }


    public render() {
        return <div className="youtube-iframe-root">
            <div className="youtube-iframe-container">
                {!this.state.isPlayerReady && <Loading/>}
                <div id={this.getYoutubeContainerId()}/>
            </div>
        </div>;
    }

    getYTPromise(): Promise<any> {
        const w: any = window;
        let ytPromise: Promise<any> | undefined = w['YTPromise'];
        if (ytPromise === undefined) {
            ytPromise = new Promise<any>(resolve => {
                w['onYouTubeIframeAPIReady'] = () => {
                    resolve(w['YT']);
                };
            });
            w['YTPromise'] = ytPromise;

            const firstScript = document.getElementsByTagName('script')[0]!;
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            firstScript.parentNode!.insertBefore(script, firstScript);
        }

        return ytPromise;
    }

    loadPlayer() {
        if (this.state.player !== null) {
            this.state.player.destroy();
            this.setState({ ...this.state, player: null, isPlayerReady: false });
            return;
        }

        if (this.state.loadingVideoId === this.props.id) {
            return;
        }

        this.setState({ ...this.state, loadingVideoId: this.props.id });

        const videoId = this.props.id;
        this.wrapPromise(this.getYTPromise())
            .then(YT => {
                if (videoId !== this.props.id) {
                    return;
                }
                
                const player = new YoutubeIframeWrapper(YT, this.props.id, this.getYoutubeContainerId(), timeMsec => {
                    if (videoId !== this.props.id) {
                        return;
                    }

                    if (this.props.onCurrentTimeChange !== undefined) {
                        this.props.onCurrentTimeChange(timeMsec);
                    }
                });
                this.setState({
                    ...this.state,
                    player: player,
                    loadingVideoId: null,
                });

                this.wrapPromise(player.getReadyPromise())
                    .then(() => {
                        this.setState({
                            ...this.state,
                            isPlayerReady: true,
                        });
                    });
            });
    }

    getYoutubeContainerId() {
        return `youtube-iframe-${this.props.id}`;
    }
}