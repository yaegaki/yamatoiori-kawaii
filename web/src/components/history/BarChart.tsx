import React from 'react';
import * as d3 from 'd3';
import { VideoSummary, VideoKind } from '../../models/video';
import './BarChart.css'

interface BarChartProps {
    summaries: VideoSummary[];
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

interface BarChartEntry {
    key: string;
    summaries: VideoSummary[];
    videoCount: number;
    archiveCount: number;
}

export class BarChart extends React.Component<BarChartProps> {
    private rootDOM: HTMLDivElement | null;
    private svg: d3.Selection<SVGSVGElement, {}, null, undefined> | null;
    private xAxis: d3.Selection<SVGGElement, {}, null, undefined> | null;
    private yGrid: d3.Selection<SVGGElement, {}, null, undefined> | null;
    private version: number;

    public static defaultProps: BarChartProps = {
        summaries: [],
    };

    public getRect(): Rect {
        let width  = 500;
        if (this.rootDOM !== null && this.rootDOM.clientWidth < 500) {
            width = this.rootDOM.clientWidth;
        }

        const aspectRatio = 2/5;
        return {
            width: width,
            height: width * aspectRatio,
            margin: {
                left: 20,
                top: 20,
                right: 20,
                bottom: 20,
            },
        }
    };
     
    constructor(props: BarChartProps) {
        super(props);
        this.prepareDOM = this.prepareDOM.bind(this);
        this.rootDOM = null;
        this.svg = null;
        this.xAxis = null;
        this.yGrid = null;
        this.version = 0;
        this.onResize = this.onResize.bind(this);
    }

    public render() {
        return <div className="barchart" ref={this.prepareDOM}></div>;
    }

    public componentDidMount() {
        this.updateBarChart();
        window.addEventListener('resize', this.onResize);
    }

    public componentDidUpdate(prevProps: BarChartProps) {
        if (this.props.summaries.length != prevProps.summaries.length) {
            this.updateBarChart();
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
        this.version++;
    }

    prepareDOM(elem: HTMLDivElement) {
        this.rootDOM = elem;

        this.svg = d3.select(this.rootDOM)
            .append('svg');

        this.yGrid = this.svg
            .append('g')
            .attr('class', 'grid');

        this.xAxis = this.svg
            .append('g');
    }

    updateAxis() {
        if (this.svg === null) return;
        if (this.yGrid === null) return;
        if (this.xAxis === null) return;

        const rect = this.getRect();
        const width = rect.width;
        const height = rect.height;
        const margin = rect.margin;

        this.svg!
            .attr('width', width)
            .attr('height', height);

        const y = d3.scaleLinear()
            .domain([0, 5])
            .range([height - margin.bottom, margin.top]);
        
        this.yGrid
            .attr('transform', `translate(${margin.left}, 0)`);

        const x = d3.scaleBand()
            .domain(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
            .range([margin.left, width - margin.right])
            .padding(.3);

        this.xAxis
            .attr('transform', `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x)
                .ticks(7)
                .tickSize(0));
    }

    updateBarChart() {
        if (this.rootDOM === null) return;

        this.updateAxis();

        const rect = this.getRect();
        const width = rect.width;
        const height = rect.height;
        const margin = rect.margin;

        const svg = this.svg!;

        const week = d3.nest<VideoSummary>()
            .key(d => d.date.getDay().toString())
            .entries(this.props.summaries);
        
        const entries: BarChartEntry[] = week.map(o => {
            const summaries: VideoSummary[] = o.values;
            let videoCount = 0;
            let archiveCount = 0;
            summaries.forEach(s => {
                if (s.kind === VideoKind.Video) {
                    videoCount++;
                }
                else {
                    archiveCount++;
                }
            });
            return {
                key: o.key,
                summaries: summaries,
                videoCount: videoCount,
                archiveCount: archiveCount,
            }
        });

        let ymax = d3.max(entries, e => e.summaries.length);
        if (ymax === undefined || ymax < 5) {
            ymax = 5;
        }

        const x = d3.scaleBand()
            .domain(['0', '1', '2', '3', '4', '5', '6'])
            .range([margin.left, width - margin.right])
            .padding(.3);

        const y = d3.scaleLinear()
            .domain([0, ymax])
            .range([height - margin.bottom, margin.top]);

        this.yGrid!
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-(width - (margin.left + margin.right))));
        
        // 動画用
        const videoRects = svg.selectAll<SVGRectElement, {}>('rect.bar.video')
            .data(entries);
        videoRects.enter().append('rect').merge(videoRects)
            .attr('class', 'bar video')
            .attr('x', e => x(e.key)!)
            .attr('y', e => {
                return y(e.videoCount);
            })
            .attr('height', e => {
                return y(0) - y(e.videoCount);
            })
            .attr('width', d => x.bandwidth());
        videoRects.exit().remove();

        // アーカイブ用
        const archiveRects = svg.selectAll<SVGRectElement, {}>('rect.bar.archive')
            .data(entries);
        archiveRects.enter().append('rect').merge(archiveRects)
            .attr('class', 'bar archive')
            .attr('x', e => x(e.key)!)
            .attr('y', e => {
                return y(e.videoCount + e.archiveCount);
            })
            .attr('height', e => {
                return y(e.videoCount) - y(e.videoCount + e.archiveCount);
            })
            .attr('width', d => x.bandwidth());
        archiveRects.exit().remove();
    }

    onResize() {
        const _version = ++this.version;
        setTimeout(() => {
            if (_version !== this.version) {
                return;
            }

            this.updateBarChart();
        }, 50);
    }
}