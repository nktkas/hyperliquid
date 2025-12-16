import type { ISubscriptionTransport } from "../../../transport/_base.ts";

/** Configuration for subscription API requests. */
export interface SubscriptionConfig<T extends ISubscriptionTransport = ISubscriptionTransport> {
  /** The transport used to connect to the Hyperliquid API. */
  transport: T;
}
