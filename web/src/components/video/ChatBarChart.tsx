import React from 'react';
import * as d3 from 'd3';
import { VideoDetail, VideoWordAggregate } from '../../models/video';
import './ChatBarChart.css';
import { number } from 'prop-types';

interface ChatBarChartProps {
    video: VideoDetail;
    targetMsec?: number;
    onTargetMsecChange?: (msec: number) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

interface ChatBarChartState {
}

interface Margin {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

interface Rect {
    width: number;
    height: number;
    margin: Margin;
}

interface ChatAggregateEntry {
    count: number;  // 集計期間での全単語数
    records: {word: string, count: number}[]
}

export class ChatBarChart extends React.Component<ChatBarChartProps, ChatBarChartState> {
    private version: number = 0;
    private rootDOM: HTMLDivElement | null = null;
    private svg: d3.Selection<SVGSVGElement, {}, null, undefined> | null = null;
    private svgRectGroup: d3.Selection<SVGGElement, {}, null, undefined> | null = null;
    private targetLine: d3.Selection<SVGPathElement, {}, null, undefined> | null = null;
    private textContainer: d3.Selection<HTMLDivElement, {}, null, undefined> | null = null;
    private aggregateUnit: number = 0;
    private aggregateMap = new Map<number, VideoWordAggregate>();
    private chatEntries: ChatAggregateEntry[] = [];
    private lastTargetIndex: number = -1;

    constructor(props: ChatBarChartProps) {
        super(props);
        this.prepareDOM = this.prepareDOM.bind(this);
        this.onResize = this.onResize.bind(this);
        this.state = {
        };
    }

    public componentDidMount() {
        ++this.version;
        window.addEventListener('resize', this.onResize);
    }

    public componentDidUpdate(prevProps: ChatBarChartProps, prevState: ChatBarChartState) {
        if (this.props.video.id !== prevProps.video.id) {
            this.prepareData();
            this.updateChart();
        }
        else if (this.props.targetMsec !== prevProps.targetMsec) {
            this.updateTargetMsec();
        }
    }

    public componentWillUnmount() {
        ++this.version;
        window.removeEventListener('resize', this.onResize);
    }

    public render() {
        return <div className="chat-barchart" ref={this.prepareDOM}/>;
    }

    prepareDOM(elem: HTMLDivElement) {
        this.rootDOM = elem;
        this.svg = d3.select(this.rootDOM)
            .append('svg')
            .style('background', 'white');
        this.svgRectGroup = this.svg.append('g');
        
        this.targetLine = this.svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', '1.5');

        this.textContainer = d3.select(this.rootDOM)
            .append('div')
            .attr('class', 'text-container');
        
        const svgElem = this.svg.node()!
        const handler = () => {
            if (this.props.onTargetMsecChange === undefined) return;

            const rect = this.getRect();
            const [x, _] = d3.mouse(svgElem);


            const ratio = (x - rect.margin.left) / rect.width;
            let msec = this.props.video.durationMsec * ratio;
            if (msec < 0) {
                msec = 0;
            }
            else if (msec > this.props.video.durationMsec) {
                msec = this.props.video.durationMsec;
            }

            this.props.onTargetMsecChange(msec);
        };

        const drag = d3.drag<SVGSVGElement, {}>()
            .on('start', () => {
                if (this.props.onDragStart !== undefined) {
                    this.props.onDragStart();
                }
                handler();
            })
            .on('drag', handler)
            .on('end', () => {
                if (this.props.onDragEnd !== undefined) {
                    this.props.onDragEnd();
                }
            });
        this.svg.call(drag);

        this.prepareData();
        this.updateChart();
    }

    prepareData() {
        // 動画全体を100で割ったものを一つのバーのミリ秒とする
        this.aggregateUnit = this.props.video.durationMsec / 100;
        this.aggregateMap.clear();

        if (this.props.video.words !== undefined) {
            this.props.video.words.forEach(w => {
                this.aggregateMap.set(w.msec, w);
            });
        }

        this.chatEntries = [];
        for (let time = 0; time < this.props.video.durationMsec; time += this.aggregateUnit) {
            const wordMap = this.getWordsWithRange(time, time + this.aggregateUnit);
            let sum = 0;
            const records: { word: string, count: number }[] = [];

            Array.from(wordMap.keys()).forEach(word => {
                const count = wordMap.get(word)!;
                records.push({ word: word, count: count });
                sum += count;
            });

            records.sort((a, b) => {
                if (a.count < b.count) return 1;
                if (a.count > b.count) return -1;
                return 0;
            });
            this.chatEntries.push({ count: sum, records: records });
        }
    }

    updateChart() {
        if (this.svg === null) return;
        if (this.svgRectGroup === null) return;
        if (this.targetLine === null) return;
        if (this.textContainer === null) return;

        const rect = this.getRect();

        this.svg
            .attr('width', rect.width)
            .attr('hegith', rect.height);

        const yscale = d3.scaleLinear()
            .domain([0, d3.max(this.chatEntries, e => e.count)!])
            .range([rect.height, 0]);

        
        const rects = this.svgRectGroup.selectAll<SVGRectElement, {}>('rect')
            .data(this.chatEntries);
        
        const barWidth = rect.width / 100;

        rects.enter()
            .append('rect')
            .merge(rects)
            .attr('x', (_, i) => i * barWidth)
            .attr('y', d => yscale(d.count))
            .attr('width', barWidth)
            .attr('height', d => yscale(0) - yscale(d.count));

        rects.exit().remove();

        const line = d3.line()([[0,0], [0, rect.height]])!;
        this.targetLine.attr('d', line);

        this.updateTargetMsec();
    }

    updateTargetMsec() {
        if (this.props.targetMsec === undefined) return;

        const rect = this.getRect();
        const x = rect.margin.left + rect.width * this.props.targetMsec / this.props.video.durationMsec;
        let index = Math.floor(this.props.targetMsec / this.aggregateUnit);
        if (index < 0) {
            index = 0;
        }
        else if (index >= this.chatEntries.length){
            index = this.chatEntries.length - 1;
        }

        this.targetLine!.attr('transform', `translate(${x},0)`);

        if (this.lastTargetIndex === index) return;
        this.lastTargetIndex = index;
        if (this.lastTargetIndex < 0) return;

        this.textContainer!.transition()
            .duration(300)
            .style('opacity', 0)
            .on('end', () => {
                const children = this.textContainer!
                    .selectAll<HTMLDivElement, {}>('div')
                    .data(this.chatEntries[index].records);

                children.exit().remove();

                const enter = children.enter().append('div');
                enter.merge(children)
                    .text(r => r.word);
            })
            .transition()
            .duration(300)
            .style('opacity', 1);
        
        this.svgRectGroup!.selectAll('rect')
            .data(this.chatEntries)
            .attr('class', (_, i) => {
                return i === index ? 'bar active' : 'bar';
            });
    }

    getWordsWithRange(startMsec: number, endMsec: number) : Map<string, number> {
        const startKey = startMsec -  startMsec % 10000;
        const section = this.aggregateMap.get(startKey);
        if (section === undefined) {
            // 10秒ごとにキーはあるはず...
            return new Map<string, number>();
        }

        let sectionEndMSec = startKey + 10000;

        let result:  Map<string, number> | null = null;
        if (endMsec > sectionEndMSec) {
            result = this.getWordsWithRange(sectionEndMSec, endMsec);
        }
        else {
            sectionEndMSec = endMsec;
            result = new Map<string, number>();
        }

        const ratio = (sectionEndMSec - startMsec) / 10000;

        section.words.forEach(w => {
            const word = w.word;
            const count = w.count;
            let nextCount = result!.get(word);
            if (nextCount === undefined) {
                nextCount = count * ratio;
            }
            else {
                nextCount = nextCount + count * ratio;
            }
            result!.set(word, nextCount);
        });

        return result;
    }

    getRect(): Rect {
        let width  = 800;
        if (this.rootDOM !== null && this.rootDOM.clientWidth < width) {
            width = this.rootDOM.clientWidth;
        }

        return {
            width: width,
            height: 150,
            margin: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 20,
            },
        }
    };

    onResize() {
        const _version = ++this.version;
        setTimeout(() => {
            if (_version !== this.version) return;

            this.updateChart();
        }, 50);
    }
}