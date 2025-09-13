export const Promise_ = {
    withResolvers: Promise.withResolvers || (<T>() => { // Node.js | React Native
        let resolve: (value: T | PromiseLike<T>) => void;
        // deno-lint-ignore no-explicit-any
        let reject: (reason?: any) => void;
        const promise = new Promise<T>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve: resolve!, reject: reject! };
    }),
};

export const AbortSignal_ = {
    any: AbortSignal.any || ((signals: AbortSignal[]) => { // React Native
        const controller = new AbortController();
        for (const signal of signals) {
            if (signal.aborted) {
                controller.abort(signal.reason);
                return controller.signal;
            }
            signal.addEventListener("abort", () => {
                controller.abort(signal.reason);
            }, { once: true, signal: controller.signal });
        }
        return controller.signal;
    }),
    timeout: AbortSignal.timeout || ((milliseconds: number) => { // React Native
        const controller = new AbortController();
        setTimeout(() => controller.abort(new Error("Signal timed out")), milliseconds);
        return controller.signal;
    }),
};

export const CustomEvent_ = globalThis.CustomEvent || class<T> extends Event { // React Native
    readonly detail: T;
    constructor(type: string, eventInitDict?: CustomEventInit<T>) {
        super(type, eventInitDict);
        this.detail = eventInitDict?.detail as T;
    }
};
