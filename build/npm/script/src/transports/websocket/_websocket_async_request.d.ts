import type { ReconnectingWebSocket } from "./_reconnecting_websocket.js";
import type { HyperliquidEventTarget } from "./_hyperliquid_event_target.js";
/**
 * Manages WebSocket requests to the Hyperliquid API.
 * Handles request creation, sending, and mapping responses to their corresponding requests.
 */
export declare class WebSocketAsyncRequest {
    protected socket: ReconnectingWebSocket;
    protected lastId: number;
    protected queue: {
        id: number | string;
        resolve: (value?: any) => void;
        reject: (reason?: any) => void;
    }[];
    lastRequestTime: number;
    /**
     * Creates a new WebSocket async request handler.
     * @param socket - WebSocket connection instance for sending requests to the Hyperliquid WebSocket API
     * @param hlEvents - Used to recognize Hyperliquid responses and match them with sent requests
     */
    constructor(socket: ReconnectingWebSocket, hlEvents: HyperliquidEventTarget);
    /**
     * Sends a request to the Hyperliquid API.
     * @returns A promise that resolves with the parsed JSON response body.
     */
    request(method: "ping", signal?: AbortSignal): Promise<void>;
    request<T>(method: "post" | "subscribe" | "unsubscribe", payload: unknown, signal?: AbortSignal): Promise<T>;
    /** Normalizes an object and then converts it to a string. */
    static requestToId(value: unknown): string;
}
//# sourceMappingURL=_websocket_async_request.d.ts.map