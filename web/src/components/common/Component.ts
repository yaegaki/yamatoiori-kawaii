import React from 'react';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
    private version: number = 0;

    protected wrapPromise<T>(promise: Promise<T>): Promise<T> {
        const _version = this.version;
        return new Promise((resolve, reject) => {
            promise
                .then(value => {
                    if (_version === this.version) {
                        resolve(value);
                    }
                })
                .catch(reason => {
                    if (_version === this.version) {
                        reject(reason);
                    }
                });
        });
    }

    public componentDidMount() {
    }

    public componentWillUnmount() {
        this.version++;
    }
}