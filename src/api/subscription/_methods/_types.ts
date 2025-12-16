import type { ISubscriptionTransport } from "../../../transport/mod.ts";

/** Configuration for subscription API requests. */
export interface SubscriptionConfig<T extends ISubscriptionTransport = ISubscriptionTransport> {
  /** The transport used to connect to the Hyperliquid API. */
  transport: T;
}
