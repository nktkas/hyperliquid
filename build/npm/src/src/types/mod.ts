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

export type Hex = `0x${string}`;

export type * from "./exchange/requests.js";
export type * from "./exchange/responses.js";

export type * from "./explorer/requests.js";
export type * from "./explorer/responses.js";

export type * from "./info/accounts.js";
export type * from "./info/assets.js";
export type * from "./info/markets.js";
export type * from "./info/orders.js";
export type * from "./info/requests.js";
export type * from "./info/validators.js";
export type * from "./info/vaults.js";

export type * from "./subscriptions/responses.js";
export type * from "./subscriptions/requests.js";
