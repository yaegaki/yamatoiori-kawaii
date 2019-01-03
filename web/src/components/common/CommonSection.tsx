import React from 'react';

interface CommonSectionProps {
    className?: string;
    title: string;
}

export class CommonSection extends React.Component<CommonSectionProps> {
    public render() {
        return <section className={this.getClassName()}>
            <h2>{this.props.title}</h2>
            {this.props.children}
        </section>;
    }

    getClassName() {
        if (this.props.className === undefined) {
            return 'common-section';
        }

        return 'common-section ' + this.props.className;
    }
}