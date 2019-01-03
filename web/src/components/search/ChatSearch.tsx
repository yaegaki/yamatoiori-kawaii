import React from 'react';
import FA from 'react-fontawesome';
import { RouteComponentProps } from 'react-router-dom';
import { SearchVideoItem } from './SearchVideoItem';
import { Loading } from '../common/Loading';
import { parseQueryString } from '../../helpers/query';
import './ChatSearch.css';
import { fetchVideoSummary } from '../../helpers/fetch';
import { VideoSummary } from '../../models/video';
import { VideoGrid } from '../common/VideoGrid';
import { SearchBox } from '../common/SearchBox';
import { CommonBody } from '../common/CommonBody';
import { Component } from '../common/Component';
import { string } from 'prop-types';
import { ErrorMessage } from '../common/ErrorMessage';

interface VideoRawChatEntry {
    Message: string;
}

export interface VideoChatEntry {
    offsetMsec: number;
    message: string;
}

export interface VideoEntry {
    summary: VideoSummary;
    chats: VideoChatEntry[];
}

interface ChatSearchState {
    // 現在fetch中のサーチワード
    search: string;
    // 現在入力中のサーチワード
    willSearch: string;
    lastSearch?: string;
    summaryMap?: Map<string, VideoSummary>;
    videos?: VideoEntry[];
    isSearching: boolean;
    hasError: boolean;
}

export class ChatSearch extends Component<RouteComponentProps, ChatSearchState> {
    constructor(props: RouteComponentProps) {
        super(props);
        this.submitSearch = this.submitSearch.bind(this);
        this.searchWordChange = this.searchWordChange.bind(this);
        this.getBody = this.getBody.bind(this);


        this.wrapPromise(fetchVideoSummary())
            .then(summaries => {
                const map = new Map<string, VideoSummary>();
                summaries.forEach(s => {
                    map.set(s.id, s);
                });

                this.setState({
                    ...this.state,
                    summaryMap: map,
                });

                if (this.state.willSearch !== '') {
                    this.scheduleSearch(this.state.willSearch);
                }
            })
            .catch(() => {
                this.setState({
                    ...this.state,
                    hasError: true,
                });
            });

        const query = parseQueryString(this.props.history.location.search);
        const q = query.get('q') || '';

        this.state = {
            search: '',
            willSearch: q,
            isSearching: false,
            hasError: false,
        };
    }

    public render() {
        return <CommonBody className="chatsearch-body">
            <SearchBox onSubmit={this.submitSearch} onChange={this.searchWordChange} value={this.state.willSearch} placeholder="何を探す？"/>
            <article className="chatsearch-result">
                {this.getBody()}
            </article>
        </CommonBody>;
    }

    public componentDidUpdate(prevProps: RouteComponentProps) {
        if (prevProps.location.search === this.props.location.search) return;

        const query = parseQueryString(this.props.history.location.search);

        const q = query.get('q') || '';
        this.setState({ ...this.state, willSearch: q}, () => {
            if (q === '') {
                this.setState({ ...this.state,
                    videos: undefined,
                    search: '',
                    lastSearch: '',
                });
            }
            else {
                this.scheduleSearch(q);
            }
        });
    }

    getBody(): any {
        if (this.state.hasError) {
            return <ErrorMessage/>;
        }

        if (this.state.isSearching) {
            return <Loading/>;
        }
        else {
            if (this.state.videos === undefined) return null;

            if (this.state.videos.length == 0) {
                return <ErrorMessage message="ごめんなさい、見つかりませんでした。"/>;
            }
            else {
                const children = this.state.videos.map((v, videoIndex) => {
                    return <SearchVideoItem key={videoIndex} video={v} />
                });
                return <VideoGrid className="chatsearch-result">
                    {children}
                </VideoGrid>;
            }
        }
    }


    getVideoTitle(id: string): string {
        if (this.state.summaryMap === undefined) return id;

        const summary = this.state.summaryMap.get(id);
        if (summary == undefined) return id;

        return summary.title;
    }

    offsetMsecToStr(offsetMsec: number): string {
        let sec = Math.floor(offsetMsec / 1000);
        let s = '';
        if (sec > 3600) {
            const h = Math.floor(sec / 3600);
            sec -= h * 3600;
            s += `${h}h`;
        }
        if (sec > 60) {
            const m = Math.floor(sec / 60);
            sec -= m * 60;
            s += `${(s.length> 0 && m < 10) ? '0' : ''}${m}m`;
        }
        s += `${(s.length > 0 && sec < 10) ? '0' : ''}${sec}s`;
        return s;
    }

    searchWordChange(value: string) {
        this.setState({ ...this.state, willSearch: value });
    }

    submitSearch() {
        const search = this.state.willSearch;
        if (search.length > 0) {
            this.props.history.push(`/search?q=${encodeURIComponent(search)}`);
        }
    }

    async scheduleSearch(search: string) {
        try {
            await this.wrapPromise(this.scheduleSearchCore(search));
        }
        catch {
            this.setState({ ...this.state, hasError: true });
        }
    }
    async scheduleSearchCore(search: string) {
        // 動画情報が取得できていない場合は検索しない
        if (this.state.summaryMap === undefined) return;
        const summaryMap = this.state.summaryMap;

        // 無条件での検索は許可しない
        if (search === '') return;

        // 同じのをサーチしないようにする
        if (search === this.state.lastSearch) return;

        this.setState({ ...this.state, search, isSearching: true });

        const res = await this.wrapPromise(fetch(`/api/search?q=${search}`));

        // fetchしている間に検索対象が変わった場合
        if (search !== this.state.search) return;

        const rawMessages: VideoRawChatEntry[] = await this.wrapPromise(res.json());
        const chatMap = new Map<string, VideoChatEntry[]>();
        rawMessages.forEach(m => {
            const [message, videoId, offsetMsec] = m.Message.split(':');

            let entries = chatMap.get(videoId);
            if (entries === undefined) {
                entries = [];
                chatMap.set(videoId, entries);
            }

            entries.push({ message, offsetMsec: Number(offsetMsec) });
        });

        const videos: VideoEntry[] = [];
        chatMap.forEach((chats, id) => {
            const summary = summaryMap.get(id);
            if (summary === undefined) return;

            const title = this.getVideoTitle(id);
            chats.sort((a, b) => {
                if (a.offsetMsec < b.offsetMsec) return -1;
                if (a.offsetMsec > b.offsetMsec) return 1;

                return 0;
            });

            videos.push({ summary, chats });
        });

        this.setState({ ...this.state, lastSearch: search, videos, isSearching: false, })
    }
}