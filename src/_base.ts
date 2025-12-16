/** Base error class for all SDK errors. */
export class HyperliquidError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "HyperliquidError";
  }
}
