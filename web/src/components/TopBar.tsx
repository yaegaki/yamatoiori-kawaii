import React from 'react';
import FA from 'react-fontawesome';
import { RouteComponentProps, Link } from 'react-router-dom';
import './TopBar.css'

interface TopBarState {
    activePath: string;
}

export class TopBar extends React.Component<RouteComponentProps, TopBarState> {
    constructor(props: RouteComponentProps) {
        super(props);

        props.history.listen(l => {
            this.setState({
                activePath: l.pathname,
            });
        });


        this.state = {
            activePath: props.location.pathname,
        };
    }

    public render() {
        const activeContent = this.getActiveContentName();
        return <section className="topbar">
            {this.getContentLink('/', activeContent, 'Video', 'eye')}
            {this.getContentLink('/search', activeContent, 'Search', 'search')}
            {this.getContentLink('/history', activeContent, 'History', 'calendar-alt')}
            {this.getContentLink('/other', activeContent, 'Other', 'rocket')}
            {this.getContentLink('/about', activeContent, 'About', 'info')}
        </section>;
    }

    getActiveContentName(): string {
        const activePath = this.state.activePath.toLowerCase();
        if (activePath === '/' || activePath.indexOf('/video') === 0) {
            return 'Video';
        }
        if (activePath === '/search') {
            return 'Search';
        }
        if (activePath === '/history') {
            return 'History';
        }
        if (activePath === '/about') {
            return 'About';
        }

        return 'Other';
    }

    getContentLink(path: string, activeContent: string, text: string, icon: string) {
        return <div className={this.getLinkClassName(activeContent === text)}>
            <Link to={path}>
                <FA name={icon}/><span className="text">{text}</span>
            </Link>
        </div>;
    }

    getLinkClassName(isActive: boolean): string {
        const baseClassName = 'link';

        if (isActive) {
            return `${baseClassName} active`;
        }

        return baseClassName;
    }
}