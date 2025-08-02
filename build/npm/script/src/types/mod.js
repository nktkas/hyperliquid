"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
