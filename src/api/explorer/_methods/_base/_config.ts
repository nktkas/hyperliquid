/**
 * Configuration types for Explorer API requests.
 * @module
 */

import type { IRequestTransport, ISubscriptionTransport } from "../../../../transport/mod.ts";

/** Configuration for Explorer API requests. */
export interface ExplorerConfig<
  T extends IRequestTransport<"explorer"> | ISubscriptionTransport =
    & IRequestTransport<"explorer">
    & ISubscriptionTransport,
> {
  /** The transport used to connect to the Hyperliquid API. */
  transport: T;
}
