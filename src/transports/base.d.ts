/**
 * Interface representing a REST transport.
 */
export interface IRESTTransport {
    /**
     * Sends an API request.
     * @param endpoint - The endpoint to send the request to.
     * @param payload - The request payload.
     * @returns The response data.
     */
    request<T>(endpoint: "info" | "action" | "explorer", payload: unknown): Promise<T>;
}
