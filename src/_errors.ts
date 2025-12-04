/** Base error class for all SDK errors. */
export class HyperliquidError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "HyperliquidError";
  }
}

/** Thrown when an error occurs at the transport level (e.g., timeout). */
export class TransportError extends HyperliquidError {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TransportError";
  }
}
