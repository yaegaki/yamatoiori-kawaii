export interface VideoRawSummary {
    Info: string;
}

export enum VideoKind {
    Video = 0,
    Archive = 1,
}

export interface VideoSummary {
    id: string;
    title: string;
    date: Date;
    kind: VideoKind;
    existsChatData: boolean;
}

export interface VideoWord {
    word: string;
    count: number;
}

export interface VideoWordAggregate {
    msec: number;
    words: VideoWord[];
}

export interface VideoDetail {
    id: string;
    title: string;
    durationMsec: number;
    words?: VideoWordAggregate[];
}
