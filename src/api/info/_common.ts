import type { IRequestTransport } from "../../transport/base.ts";

/** Configuration for Info API requests. */
export interface InfoRequestConfig<T extends IRequestTransport = IRequestTransport> {
  /** The transport used to connect to the Hyperliquid API. */
  transport: T;
}
