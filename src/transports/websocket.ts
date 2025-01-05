import { type IRESTTransport, TransportError } from "./base.ts";
import { ReconnectingWebSocket, type ReconnectingWebSocketConfig } from "../utils/reconnecting-websocket.ts";

/**
 * WebSocket API request.
 */
interface PostRequest<T> {
    /** The method type. */
    method: "post";

    /** The request ID. */
    id: number;

    /** The request object. */
    request: {
        /** The request type. */
        type: string;

        /** The request payload. */
        payload: T;
    };
}

/**
 * WebSocket API response.
 */
interface PostResponse<T> {
    /** The channel type. */
    channel: "post";

    /** The response data. */
    data: {
        /** The request ID. */
        id: number;

        /** The response object. */
        response:
            | {
                /** The response endpoint type. */
                type: "info";

                /** The response payload. */
                payload: {
                    /** The payload type. */
                    type: string;

                    /** The payload data. */
                    data: T;
                };
            }
            | {
                /** The response endpoint type. */
                type: "action";

                /** The response payload. */
                payload: T;
            };
    };
}

/**
 * WebSocket API error response.
 */
interface ErrorResponse {
    /** The channel type. */
    channel: "error";

    /** The error message. */
    data: string;
}

/**
 * The error thrown when the WebSocket request fails.
 */
export class WebSocketRequestError extends TransportError {
    /**
     * Creates a new WebSocket request error.
     * @param message - The error message.
     */
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

/**
 * WebSocket transport configuration.
 */
export interface WebSocketTransportConfig {
    /**
     * The WebSocket URL.
     * @default "wss://api.hyperliquid.xyz/ws"
     * @mainnet wss://api.hyperliquid.xyz/ws
     * @testnet wss://api.hyperliquid-testnet.xyz/ws
     */
    url?: string | URL;

    /**
     * The timeout for async WebSocket requests. Set to `0` to disable.
     * @default 10_000
     */
    timeout?: number;

    /**
     * The interval (in ms) to send keep-alive messages. Set to `0` to disable.
     * @default 20_000
     */
    keepAliveInterval?: number;

    /**
     * Reconnection policy configuration for closed connections.
     * @note Only re-establishes the connection, does not retry failed requests.
     */
    reconnect?: ReconnectingWebSocketConfig;
}

/**
 * The transport connects to the Hyperliquid API via WebSocket.
 */
export class WebSocketTransport implements IRESTTransport {
    /** The WebSocket URL. */
    readonly url: string | URL;

    /** The timeout for async WebSocket requests. */
    timeout: number;

    /** Reconnection policy configuration for closed connections. */
    reconnect: Required<ReconnectingWebSocketConfig>;

    /** The interval (in ms) to send keep-alive messages. */
    readonly keepAliveInterval: number;

    /** The WebSocket connection. */
    protected socket: ReconnectingWebSocket;

    /** The keep-alive timer. */
    protected keepAliveTimer: ReturnType<typeof setInterval> | null = null;

    /** The pending requests. */
    protected pendingRequests: Map<number, {
        // deno-lint-ignore no-explicit-any
        resolve: (value: any) => void;
        reject: (reason: unknown) => void;
    }> = new Map();

    /** The last request ID. */
    protected lastRequestId: number = 0;

    /**
     * Creates a new WebSocket transport.
     * @param config - The transport configuration.
     */
    constructor(config?: WebSocketTransportConfig) {
        // Set the transport configuration
        this.socket = new ReconnectingWebSocket(
            config?.url ?? "wss://api.hyperliquid.xyz/ws",
            undefined,
            config?.reconnect,
        );
        this.url = this.socket.url;
        this.reconnect = this.socket.config; // Copying reference to object
        this.timeout = config?.timeout ?? 10_000;
        this.keepAliveInterval = config?.keepAliveInterval ?? 20_000;

        // Initialize
        this.socket.addEventListener("open", () => {
            // Start keep-alive messages
            if (this.keepAliveInterval > 0 && !this.keepAliveTimer) {
                this.keepAliveTimer = setInterval(
                    () => this.socket?.send(JSON.stringify({ method: "ping" })),
                    this.keepAliveInterval,
                );
            }
        });
        this.socket.addEventListener("close", () => {
            // Stop keep-alive messages
            if (this.keepAliveTimer) {
                clearInterval(this.keepAliveTimer);
                this.keepAliveTimer = null;
            }

            // Reject all pending requests
            for (const request of this.pendingRequests.values()) {
                // Based on error: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send#exceptions
                request.reject(new DOMException("The WebSocket is in an invalid state.", "InvalidStateError"));
            }
            this.pendingRequests.clear();
        });
        this.socket.addEventListener("message", (event: MessageEvent<string>) => {
            try {
                const msg = JSON.parse(event.data);
                if (isPostResponse(msg)) {
                    const pendingRequest = this.pendingRequests.get(msg.data.id);
                    if (pendingRequest) {
                        const response = msg.data.response.type === "info"
                            ? msg.data.response.payload.data
                            : msg.data.response.payload;
                        pendingRequest.resolve(response);
                        this.pendingRequests.delete(msg.data.id);
                    }
                } else if (isErrorResponse(msg)) {
                    const responseId = Number(msg.data.match('"id":(.+?),')?.[1]?.trim());
                    const pendingRequest = this.pendingRequests.get(responseId);
                    if (pendingRequest) {
                        pendingRequest.reject(new WebSocketRequestError(msg.data));
                        this.pendingRequests.delete(responseId);
                    }
                }
            } catch {
                // Ignore errors
            }
        });
    }

    /**
     * Closes the WebSocket connection.
     * @param signal - An optional abort signal.
     * @returns A promise that resolves when the connection is closed.
     */
    close(signal?: AbortSignal): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (signal?.aborted) {
                return reject(signal.reason);
            }

            if (this.socket.readyState === WebSocket.CLOSED) {
                return resolve();
            }

            const handleClose = () => {
                signal?.removeEventListener("abort", handleAbort);
                resolve();
            };

            const handleAbort = () => {
                this.socket.removeEventListener("close", handleClose);
                reject(signal?.reason);
            };

            this.socket.addEventListener("close", handleClose, { once: true });
            signal?.addEventListener("abort", handleAbort, { once: true });

            this.socket.close();
        });
    }

    /**
     * Sends an API request.
     * @param endpoint - The endpoint to send the request to.
     * @param payload - The request payload.
     * @param signal - An optional abort signal.
     * @returns The response data.
     * @throws {WebSocketRequestError} - On WebSocket request failure.
     */
    async request<T>(type: "info" | "action", payload: unknown, signal?: AbortSignal): Promise<T> {
        const timeoutSignal = this.timeout > 0 ? AbortSignal.timeout(this.timeout) : undefined;
        const combinedSignal = signal && timeoutSignal
            ? AbortSignal.any([signal, timeoutSignal])
            : signal ?? timeoutSignal;

        // If AbortSignal is already aborted, it will no longer generate an event
        // so we need to check if it is still working.
        if (combinedSignal?.aborted) {
            return Promise.reject(combinedSignal.reason);
        }

        // A closed WebSocket by default discards all send messages.
        // For HTTP-like request this logic is not suitable.
        if (this.socket.terminationController.signal.aborted) {
            // Based on error: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send#exceptions
            return Promise.reject(new DOMException("The WebSocket is in an invalid state.", "InvalidStateError"));
        }

        const request: PostRequest<unknown> = {
            method: "post",
            id: ++this.lastRequestId,
            request: { type, payload },
        };

        const handleAbort = () => {
            const pendingRequest = this.pendingRequests.get(request.id);
            if (pendingRequest) {
                pendingRequest.reject(combinedSignal?.reason);
                this.pendingRequests.delete(request.id);
            }
        };
        combinedSignal?.addEventListener("abort", handleAbort, { once: true });

        this.socket.send(JSON.stringify(request), combinedSignal);

        try {
            return await new Promise((resolve, reject) => {
                this.pendingRequests.set(request.id, { resolve, reject });
            });
        } finally {
            combinedSignal?.removeEventListener("abort", handleAbort);
        }
    }
}

/**
 * Checks if the data is a post response.
 * @param data - The data to check.
 * @returns A boolean indicating if the data is a post response.
 */
function isPostResponse(data: unknown): data is PostResponse<unknown> {
    return typeof data === "object" && data !== null && "channel" in data && data.channel === "post";
}

/**
 * Checks if the data is an error response.
 * @param data - The data to check.
 * @returns A boolean indicating if the data is an error response.
 */
function isErrorResponse(data: unknown): data is ErrorResponse {
    return typeof data === "object" && data !== null && "channel" in data && data.channel === "error";
}
