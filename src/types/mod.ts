/**
 * This module contains all types related to the Hyperliquid API.
 *
 * @example
 * ```ts
 * import type { OrderParams } from "@nktkas/hyperliquid/types";
 *
 * const myOrder: OrderParams = {
 *   a: 0, // Asset index
 *   b: true, // Buy order
 *   p: "30000", // Price
 *   s: "0.1", // Size
 *   r: false, // Not reduce-only
 *   t: {
 *     limit: {
 *       tif: "Gtc", // Good-til-cancelled
 *     },
 *   },
 * };
 * ```
 *
 * @module
 */

export type { Hex } from "../base.ts";

export type * from "./exchange/requests.ts";
export type * from "./exchange/responses.ts";

export type * from "./explorer/requests.ts";
export type * from "./explorer/responses.ts";

export type * from "./info/accounts.ts";
export type * from "./info/assets.ts";
export type * from "./info/markets.ts";
export type * from "./info/orders.ts";
export type * from "./info/requests.ts";
export type * from "./info/validators.ts";
export type * from "./info/vaults.ts";

export type * from "./subscriptions/responses.ts";
export type * from "./subscriptions/requests.ts";
