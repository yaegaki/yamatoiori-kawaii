import React from 'react';
import * as d3 from 'd3';
import { RouteComponentProps, HashRouter } from 'react-router-dom';
import { CalendarView } from './CalendarView';
import { BarChart } from './BarChart';
import { CommonBody } from '../common/CommonBody';
import { CommonSection } from '../common/CommonSection';
import './History.css'
import { fetchVideoSummary } from '../../helpers/fetch';
import { VideoSummary } from '../../models/video';
import { Component } from '../common/Component';
import { Loading } from '../common/Loading';
import { ErrorMessage } from '../common/ErrorMessage';
import { VideoItem } from '../common/VideoItem';
import { dateToDisplayStr } from '../../helpers/time';

interface HistoryState {
    summaryFilter: string;
    summaries?: VideoSummary[];
    selectedSummaries?: VideoSummary[];
    hasError: boolean;
}

export class History extends Component<RouteComponentProps, HistoryState> {
    constructor(props: RouteComponentProps) {
        super(props);

        this.wrapPromise(fetchVideoSummary())
            .then(summaries => {
                this.setState({ ...this.state, summaries });
            })
            .catch(() => {
                this.setState({...this.state, hasError: true});
            });
        
        this.state = {
            summaryFilter: '',
            hasError: false,
        };
        this.filterChange = this.filterChange.bind(this);
        this.selectCalendarDate = this.selectCalendarDate.bind(this);
    }

    public render() {
        return <CommonBody className="history">
            {this.getBody()}
        </CommonBody>;
    }

    getBody() {
        if (this.state.hasError) {
            return <ErrorMessage/>;
        }
        else {
            if (this.state.summaries === undefined) {
                return <Loading/>;
            }
            else {
                return <div>
                    {this.getCalendarSection()}
                    {this.getRecentSection()}
                    {this.getLastMonthAnalytics()}
                </div>;
            }
        }
    }

    selectCalendarDate(date: Date, summaries: VideoSummary[]) {
        this.setState({ ...this.state, selectedSummaries: summaries });
    }

    getCalendarSection() {
        return <CommonSection title="カレンダー">
            <div className="calendar">
                <input value={this.state.summaryFilter} onChange={this.filterChange} placeholder="フィルター"/>
                <CalendarView cellSize={11} summaries={this.getFilteredSummaries()} onDateClick={this.selectCalendarDate}/>
                {this.getSelectedSummariesSection()}
            </div>
        </CommonSection>;
    }

    getSelectedSummariesSection() {
        if (this.state.selectedSummaries === undefined) return null;


        return this.state.selectedSummaries.map(s => {
            const video = s;
            const days = d3.timeDay.count(video.date, new Date());
            return <VideoItem key={s.id} video={video}>
                <div>{dateToDisplayStr(video.date)}</div>
                <div>{days}日前</div>
            </VideoItem>;
        });
    }

    filterChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ ...this.state, summaryFilter: event.currentTarget.value });
    }

    getFilteredSummaries(): VideoSummary[] {
        if (this.state.summaries === undefined) return [];

        if (this.state.summaryFilter === '') return this.state.summaries;

        const words = this.state.summaryFilter
            .toLowerCase()
            .split(' ')
            .filter(w => w.length > 0);
        return this.state.summaries.filter(s => {
            const title = s.title.toLowerCase();
            return words.some(w => title.indexOf(w) >= 0);
        });
    }

    getRecentSection() {
        const summaries = this.state.summaries!;
        const days = d3.timeDay.count(summaries[0].date, new Date());
        const video = summaries[0];
        return <CommonSection title="最近の配信(投稿)">
            <VideoItem key={video.id} video={video}>
                <div>{dateToDisplayStr(summaries[0].date)}</div>
                <div>{days}日前</div>
            </VideoItem>
        </CommonSection>;
    }

    /**
     * 直近1ヶ月(30日)のVideo情報を取得
     */
    getLastMonthSummaries() {
        if (this.state.summaries === undefined) return [];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        return this.state.summaries.filter(d => d.date > startDate);
    }

    getLastMonthAnalytics() {
        return <CommonSection title="直近1ヶ月の配信(投稿)">
            <BarChart summaries={this.getLastMonthSummaries()}/>
        </CommonSection>;
    }
}