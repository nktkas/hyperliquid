/**
 * Interface representing a REST transport.
 */
export interface IRESTTransport {
    /**
     * Sends an API request.
     * @param endpoint - The endpoint to send the request to.
     * @param payload - The request payload.
     * @param signal - An optional abort signal to prevent the initial request.
     * @returns The response data.
     */
    request<T>(endpoint: "info" | "action" | "explorer", payload: unknown, signal?: AbortSignal): Promise<T>;
}

/**
 * A base class for Hyperliquid transport errors.
 */
export class TransportError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
        this.name = this.constructor.name;
    }
}
