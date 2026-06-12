/**
 * AbortSignal wiring helpers shared by the transports.
 * @module
 */

import { DOMException_, Promise_ } from "./_polyfills.ts";

/** Aborts `target` with a `TimeoutError` after `ms`; `cancel` clears the timer, `reason` identifies the abort. */
export function scheduleTimeout(target: AbortController, ms: number): { reason: Error; cancel: () => void } {
  const reason = new DOMException_("Signal timed out.", "TimeoutError");
  const timeoutId = setTimeout(() => target.abort(reason), ms);
  return { reason, cancel: () => clearTimeout(timeoutId) };
}

/** Resolves or rejects with `promise`, or rejects with `signal.reason` once `signal` aborts, whichever comes first. */
export function race<T>(promise: Promise<T>, signal: AbortSignal | undefined): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(signal.reason);
  const aborted = Promise_.withResolvers<never>();
  const onAbort = () => aborted.reject(signal.reason);
  signal.addEventListener("abort", onAbort, { once: true });
  return Promise.race([promise, aborted.promise])
    .finally(() => signal.removeEventListener("abort", onAbort));
}

/** Relays abort events from `sources` into `target` and returns a detach function. */
export function relay(sources: (AbortSignal | null | undefined)[], target: AbortController): () => void {
  const detach = new AbortController();
  for (const source of sources) {
    if (!source) continue;
    if (source.aborted) {
      target.abort(source.reason);
      break;
    }
    source.addEventListener("abort", () => target.abort(source.reason), {
      once: true,
      signal: detach.signal,
    });
  }
  return () => detach.abort();
}
