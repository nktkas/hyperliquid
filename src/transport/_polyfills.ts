// deno-lint-ignore-file no-explicit-any
/**
 * Polyfills for Node.js < 22 and React Native
 */

export const Promise_ = /* @__PURE__ */ (() => {
  return {
    /** @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers */
    withResolvers: <T>() => {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: any) => void;
      const promise = new Promise<T>((res, rej) => (resolve = res, reject = rej));
      return { promise, resolve, reject };
    },
  };
})();

export const AbortSignal_ = /* @__PURE__ */ (() => {
  return {
    /** @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static */
    any: ((signals: AbortSignal[]) => {
      const controller = new AbortController();
      for (const signal of signals) {
        if (signal.aborted) {
          controller.abort(signal.reason);
          break;
        }
        signal.addEventListener(
          "abort",
          () => controller.abort(signal.reason),
          { once: true, signal: controller.signal },
        );
      }
      return controller.signal;
    }),

    /** @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static */
    timeout: ((ms: number) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(new DOMException("signal timed out", "TimeoutError")), ms);
      return controller.signal;
    }),
  };
})();

/** @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent */
export const CustomEvent_ = /* @__PURE__ */ (() => {
  return globalThis.CustomEvent || class<T> extends Event {
    readonly detail: T;
    constructor(type: string, eventInitDict?: CustomEventInit<T>) {
      super(type, eventInitDict);
      this.detail = eventInitDict?.detail ?? null as T;
    }
  };
})();
