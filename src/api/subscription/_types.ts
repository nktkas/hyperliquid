import type { ISubscriptionTransport } from "../../transport/base.ts";

/** Configuration for subscription API requests. */
export interface SubscriptionRequestConfig<T extends ISubscriptionTransport = ISubscriptionTransport> {
  /** The transport used to connect to the Hyperliquid API. */
  transport: T;
}
