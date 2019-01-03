import React from 'react';
import './CommonBody.css'

interface CommonBodyProps {
    className?: string;
}

export class CommonBody extends React.Component<CommonBodyProps> {
    public render() {
        return <div className={this.getClassName()}>
            {this.props.children}
        </div>;
    }

    getClassName() {
        if (this.props.className === undefined) {
            return 'common-body';
        }

        return 'common-body ' + this.props.className;
    }
}