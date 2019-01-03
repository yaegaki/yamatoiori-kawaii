import * as d3 from 'd3';
import { VideoRawSummary, VideoSummary, VideoDetail, VideoKind } from '../models/video';

export async function fetchVideoSummary(): Promise<VideoSummary[]> {
    const res = await fetch('/api/summary');
    const rawSumaries: VideoRawSummary[] = await res.json();

    const parser = d3.timeParse("%Y-%m-%dT%H;%M;%S%Z");
    const summaries = rawSumaries.map(s => {
        const [id, title, dateStr, kind, existsChadData] = s.Info.split(':');
        // 時刻はJSTで保存されているので+0900をつける
        const date = parser(`${dateStr.split('.')[0]}+0900`);
        if (date === null) return null;
        return {
            id: id,
            title: title,
            date: date,
            kind: kind === '0' ? VideoKind.Video : VideoKind.Archive,
            existsChatData: existsChadData === '0' ? false : true,
        };
    })
    .filter(s => s !== null)
    .map(s => s!);

    // 配信が新しい順にソートする
    summaries.sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
    });

    return summaries;
}

export async function fetchVideoDetail(id: string): Promise<VideoDetail> {
    const res = await fetch(`/asset/video/${id}/detail.json`);
    return await res.json();
}