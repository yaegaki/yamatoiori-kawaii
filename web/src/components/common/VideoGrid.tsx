import React from 'react';
import './VideoGrid.css';

interface VideoGridProps {
    className?: string;
}

export class VideoGrid extends React.PureComponent<VideoGridProps> {
    constructor(props: VideoGridProps) {
        super(props);
    }

    public render() {
        return <article className={this.getClassName()}>
            {this.props.children}
        </article>
    }

    getClassName(): string {
        if (this.props.className === undefined) {
            return 'video-grid';
        }

        return `video-grid ${this.props.className}`;
    }
}