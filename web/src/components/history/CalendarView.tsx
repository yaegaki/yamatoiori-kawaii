import * as d3 from 'd3';
import React from 'react';
import './CalendarView.css';
import { getThumbnailLink } from '../../helpers/youtube';
import { VideoSummary, VideoKind } from '../../models/video';

interface CalendarViewProps {
    cellSize: number;
    className?: string;
    lastDate: Date;
    summaries: VideoSummary[];
    onDateClick?: (date: Date, summaries: VideoSummary[]) => void;
}

export class CalendarView extends React.Component<CalendarViewProps> {
    private rootDOM: HTMLDivElement | null;
    private tooltipDiv: d3.Selection<HTMLDivElement, {}, null, undefined> | null;
    private svg: d3.Selection<SVGSVGElement, {}, null, undefined> | null;
    // unmount後にイベント発火しないための値
    private version: number;

    public static defaultProps: CalendarViewProps = {
        cellSize: 10,
        lastDate: new Date(),
        summaries: [],
    };

    constructor(props: CalendarViewProps) {
        super(props);
        this.rootDOM = null;
        this.tooltipDiv = null;
        this.svg = null;
        this.prepareDOM = this.prepareDOM.bind(this);
        this.onResize = this.onResize.bind(this);
        this.version = 0;
    }

    public componentDidMount() {
        this.updateCalendar();
        window.addEventListener('resize', this.onResize);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
        this.version++;
    }

    public componentDidUpdate(prevProps: CalendarViewProps) {
        // 本当はもっと詳しくチェックした方がいいんだけどこれでも十分
        if (this.props.summaries.length !== prevProps.summaries.length) {
            if (this.rootDOM !== null) {
                this.updateCalendar();
            }
        }
    }

    public render() {
        return <div className="calendarview" ref={this.prepareDOM}></div>;
    }

    prepareDOM(elem: HTMLDivElement) {
        this.rootDOM = elem;

        this.tooltipDiv = d3.select(this.rootDOM)
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        this.svg = d3.select(this.rootDOM)
            .append('svg');
    }


    updateCalendar() {
        var timeformat = d3.timeFormat("%Y/%m/%d(%a)");
        const dd = d3.nest<VideoSummary>()
            .key(d => timeformat(d3.timeDay(d.date)))
            .map(this.props.summaries);


        const dayCount = this.calcDayCount();
        const startDate = new Date(this.props.lastDate);
        startDate.setDate(this.props.lastDate.getDate() - dayCount);

        const totalWeek = d3.timeWeek.count(startDate, this.props.lastDate) + 1;
        const svgWidth = totalWeek * this.props.cellSize;
        const svgHeight = 7 * this.props.cellSize;
        this.svg!
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        const days = d3.timeDays(startDate, this.props.lastDate);
        const rects = this.svg!.selectAll<SVGRectElement, {}>('rect').data(days);
        rects.enter().append('rect').merge(rects)
            .attr('width', this.props.cellSize)
            .attr('height', this.props.cellSize)
            .attr('class', d => {
                let k = 'day';

                const data: VideoSummary[] | undefined = dd.get(timeformat(d));
                if (data !== undefined) {
                    k = `${k} active`;
                    if (data.some(s => s.kind === VideoKind.Archive)) {
                        k = `${k} archive`;
                    }
                }
                return k;
            })
            .attr('x', d => {
                return d3.timeWeek.count(startDate, d) * this.props.cellSize;
            })
            .attr('y', d => {
                return d.getDay() * this.props.cellSize;
            })
            .on('mousemove', d => {
                const t = timeformat(d);
                const data: VideoSummary[] | undefined = dd.get(t);
                if (data === undefined) {
                    return;
                }

                const pageX: number = d3.event.pageX;
                const pageY: number = d3.event.pageY;

                this.tooltipDiv!.transition()
                    .duration(100)
                    .style('opacity', 0.9);

                this.tooltipDiv!
                    .style('left', `${pageX + 15}px`)
                    .style('top', `${pageY + 15}px`)
                    .html(`<div>
                    <h3>${t}</h3>
                    ${this.getTooltipBody(data)}
                    </div>`);
            })
            .on('mouseout', d => {
                const t = timeformat(d);
                if (!dd.has(timeformat(d))) {
                    return;
                }

                this.tooltipDiv!.transition()
                    .duration(300)
                    .style('opacity', 0);
            })
            .on('click', d => {
                if (this.props.onDateClick === undefined) return;

                const t = timeformat(d);
                let data: VideoSummary[] | undefined = dd.get(t);
                if (data === undefined) {
                    data = [];
                }

                this.props.onDateClick(d, data);
            });
        rects.exit().remove();
    }

    getTooltipBody(data: VideoSummary[]): string {
        const body = data.map(d => `<div>
            <div>
                ${d.title}
            </div>
            <div>
                <img src="${getThumbnailLink(d.id)}" width="100">
            </div>
        </div>`).join('');

        return `<div>${body}</div>`;
    }

    calcDayCount() {
        if (this.rootDOM === null) return 0;

        const weekCount = Math.floor(this.rootDOM.clientWidth  / this.props.cellSize);
        let dayCount = (weekCount - 1) * 7;
        if (dayCount < 7) {
            dayCount = 7;
        }
        else if (dayCount > 365) {
            dayCount = 365;
        }

        return dayCount;
    }

    onResize() {
        const _version = ++this.version;
        setTimeout(() => {
            if (_version !== this.version) {
                return;
            }

            this.updateCalendar();
        }, 50);
    }
}