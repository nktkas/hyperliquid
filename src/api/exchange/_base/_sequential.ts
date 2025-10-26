/**
 * Sequential request execution to prevent nonce race conditions.
 *
 * Problem: When multiple requests are sent rapidly, they may execute in different order
 * on the transport layer, causing nonce errors (e.g., server receives nonce 101 before 100).
 *
 * Solution: Queue ensures requests execute sequentially in order.
 */

import type { ExchangeRequestConfig, MultiSignRequestConfig } from "./_types.ts";
import { getWalletAddress } from "../../../signing/mod.ts";

/**
 * Request queue for sequential execution of requests.
 * Ensures that requests are executed in order, preventing them from arriving at the server out of sequence.
 */
class RequestQueue {
  private queue: Promise<unknown> = Promise.resolve();

  /**
   * Enqueue a request to be executed sequentially.
   * @param fn - The function to execute.
   * @returns A promise that resolves with the result of the function.
   */
  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const current = this.queue.then(() => fn());
    this.queue = current.catch(() => {}); // Prevent unhandled rejection
    return current;
  }
}

/**
 * Map of wallet addresses to weak references of request queues.
 * Uses WeakRef to allow garbage collection of unused queues:
 * - When a queue is no longer referenced (all requests completed), GC can remove it
 * - FinalizationRegistry automatically cleans up the Map entry when queue is GC'd
 * - This prevents memory leaks in long-running applications without manual cleanup
 */
const requestQueueMap = /* @__PURE__ */ new Map<string, WeakRef<RequestQueue>>();

/**
 * Registry to clean up Map entries when queues are garbage collected.
 * When a RequestQueue is GC'd, this callback removes the corresponding Map entry.
 */
const requestQueueRegistry = /* @__PURE__ */ new FinalizationRegistry<string>((address) => {
  requestQueueMap.delete(address);
});

/**
 * Get or create a request queue for the given config.
 * Uses a global Map keyed by wallet address to ensure the same wallet uses the same queue
 * regardless of whether called via client or direct function.
 */
export async function getRequestQueue(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
): Promise<RequestQueue | undefined> {
  const sequentialRequests = config.sequentialRequests ?? true; // default to true
  if (!sequentialRequests) {
    return undefined;
  }

  // Get wallet address to use as key
  const walletAddress = "signers" in config
    ? await getWalletAddress(config.signers[0])
    : await getWalletAddress(config.wallet);

  const address = walletAddress.toLowerCase();

  // Try to get existing queue from weak reference
  const queueRef = requestQueueMap.get(address);
  let queue = queueRef?.deref();

  if (!queue) {
    // Create new queue if it doesn't exist or was garbage collected
    queue = new RequestQueue();
    requestQueueMap.set(address, new WeakRef(queue));
    // Register for automatic cleanup when queue is GC'd
    requestQueueRegistry.register(queue, address);
  }

  return queue;
}
