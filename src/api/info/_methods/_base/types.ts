import type { IRequestTransport } from "../../../../transport/mod.ts";

/** Configuration for Info API requests. */
export interface InfoConfig<T extends IRequestTransport = IRequestTransport> {
  /** The transport used to connect to the Hyperliquid API. */
  transport: T;
}
