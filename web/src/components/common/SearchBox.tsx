import React from 'react';
import FA from 'react-fontawesome';
import './SearchBox.css';

interface SearchBoxProps {
    value: string;
    placeholder?: string;
    onSubmit: () => void;
    onChange: (value: string) => void;
}

export class SearchBox extends React.Component<SearchBoxProps> {
    constructor(props: SearchBoxProps) {
        super(props);
        this.onValueChange = this.onValueChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            value: this.props.value,
        };
    }

    public render() {
        return <form className="searchbox" onSubmit={this.onSubmit}>
            <div className="searchbox-container">
                <input type="text" value={this.props.value} onChange={this.onValueChange} placeholder={this.props.placeholder}/>
                <button>
                    <FA name="search"/>
                </button>
            </div>
        </form>;
    }

    onValueChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.props.onChange(event.currentTarget.value);
    }

    onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        this.props.onSubmit();
    }
}