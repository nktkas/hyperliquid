// deno-lint-ignore-file no-explicit-any

/**
 * Runtime shims for APIs missing on some supported platforms, mainly React Native.
 * @module
 */

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
  return globalThis.DOMException || class DOMException extends Error {
    constructor(message = "", name = "Error") {
      super(message);
      this.name = name;
    }
  };
})();

/** @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent */
export const CustomEvent_ = /* @__PURE__ */ (() => {
  return globalThis.CustomEvent || class CustomEvent<T> extends Event {
    readonly detail: T | null;
    constructor(type: string, eventInitDict?: CustomEventInit<T>) {
      super(type, eventInitDict);
      this.detail = eventInitDict?.detail ?? null;
    }
    initCustomEvent(): void {}
  };
})();
