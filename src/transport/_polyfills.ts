// deno-lint-ignore-file no-explicit-any

/** @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise */
export const Promise_ = /* @__PURE__ */ (() => {
  return {
    /** @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers */
    withResolvers: Promise.withResolvers ? <T>() => Promise.withResolvers<T>() : <T>() => {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: any) => void;
      const promise = new Promise<T>((res, rej) => (resolve = res, reject = rej));
      return { promise, resolve, reject };
    },
  };
})();

/** @see https://developer.mozilla.org/en-US/docs/Web/API/DOMException */
export const DOMException_ = /* @__PURE__ */ (() => {
  return globalThis.DOMException || class DOMExceptionPolyfill extends Error {
    constructor(message = "", name = "Error") {
      super(message);
      this.name = name;
    }
  };
})();

/** @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal */
export const AbortSignal_ = /* @__PURE__ */ (() => {
  return {
    /** @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static */
    any: AbortSignal.any ? (signals: AbortSignal[]) => AbortSignal.any(signals) : (signals: AbortSignal[]) => {
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
    },

    /** @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static */
    timeout: AbortSignal.timeout ? (ms: number) => AbortSignal.timeout(ms) : (ms: number) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(new DOMException_("Signal timed out.", "TimeoutError")), ms);
      return controller.signal;
    },
  };
})();

/** @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent */
export const CustomEvent_ = /* @__PURE__ */ (() => {
  return globalThis.CustomEvent || class CustomEventPolyfill<T> extends Event {
    readonly detail: T | null;
    constructor(type: string, eventInitDict?: CustomEventInit<T>) {
      super(type, eventInitDict);
      this.detail = eventInitDict?.detail ?? null;
    }
  };
})();
