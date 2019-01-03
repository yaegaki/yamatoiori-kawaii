import React from 'react';
import FA from 'react-fontawesome';
import './Image.css';
import { Loading } from './Loading';

interface ImageProps {
    src: string;
    width?: number;
    // エラーのアイコンのみを表示する
    forceError?: boolean;
}

interface ImageState {
    isLoading: boolean;
    isError: boolean;
}

export class Image extends React.Component<ImageProps, ImageState> {
    constructor(props: ImageProps) {
        super(props);
        this.state = {
            isLoading: true,
            isError: false,
        };
        this.onLoadImage = this.onLoadImage.bind(this);
        this.onErrorImage = this.onErrorImage.bind(this);
    }

    public componentDidUpdate(prevProps: ImageProps) {
        if (this.props.src !== prevProps.src) {
            this.setState({
                ...this.state,
                isLoading: true,
                isError: false,
            });
        }
    }

    public render() {
        const containerStyle = {
            width: this.props.width,
        };

        return <div className="image-container" style={containerStyle}>
            {this.getBody()}
        </div>;
    }

    hasError(): boolean {
        if (this.state.isError) {
            return true;
        }

        if (this.props.forceError !== undefined && this.props.forceError) {
            return true;
        }

        return false;
    }

    getBody() {
        if (this.hasError()) {
            return <div className="image-error-container">
                <FA name="ban" size="4x"/>
            </div>;
        }
        else {
            if (this.state.isLoading) {
                return <div>
                    <Loading/>
                    <img src={this.props.src}  onLoad={this.onLoadImage} onError={this.onErrorImage} style={{ display: 'none' }} />
                </div>;
            }
            else {
                return <img src={this.props.src}/>;
            }
        }
    }

    onLoadImage() {
        this.setState({ ...this.state, isLoading: false });
    }

    onErrorImage() {
        this.setState({ ...this.state, isError: true });
    }
}