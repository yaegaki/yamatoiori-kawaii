import React from 'react';
import FA from 'react-fontawesome';
import './Loading.css';

export class Loading extends React.PureComponent {
    public render() {
        return <div className="loading">
            <div>
                <FA className="loading-icon" name="circle-notch" spin size="4x" />
            </div>
        </div>;
    }
}