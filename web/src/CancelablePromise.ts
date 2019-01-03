export class CancelablePromise<T> {
    promise: Promise<T>;
    isResolved: boolean;
    isRejected: boolean;
    isCanceled: boolean;
    resolve?: (value: T) => void;
    reject?: (reason: any) => void;

    constructor(original: Promise<T> ) {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });

        original
            .then(v => {
                if (!this.isCanceled) {
                    this.isResolved = true;
                    this.resolve!(v);
                }
            })
            .catch(r => {
                if (!this.isCanceled) {
                    this.isRejected = true;
                    this.reject!(r);
                }
            });

        this.isResolved = false;
        this.isRejected = false;
        this.isCanceled = false;
    }

    public getPromise(): Promise<T> {
        return this.promise;
    }

    public cancel() {
        if (!this.isResolved && !this.isRejected && !this.isCanceled) {
            this.isCanceled = true;
            this.reject!({ isCanceled: true });
            this.reject = undefined;
            this.resolve = undefined;
        }
    }
}