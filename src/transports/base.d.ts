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
