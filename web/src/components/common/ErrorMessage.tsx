import React from 'react';
import FA from 'react-fontawesome';
import './ErrorMessage.css';

interface ErrorMessageProps {
    message?: string;
}

export class ErrorMessage extends React.Component<ErrorMessageProps> {
    public render() {
        return <div className="error">
            <div className="error-inner">
                <FA className="error-icon" name="dizzy" size="4x" />
                <div>{this.getMessage()}</div>
            </div>
        </div>;
    }

    getMessage() {
        if (this.props.message === undefined) {
            return 'ごめんなさい、エラーが発生しました。';
        }
        else {
            return this.props.message;
        }
    }
}