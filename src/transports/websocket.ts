import type { IRESTTransport } from "./base.d.ts";

type DeepRequired<T> = Required<
    {
        [K in keyof T]: T[K] extends Required<T[K]> ? T[K] : DeepRequired<T[K]>;
    }
>;

/** WebSocket API request. */
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

/** WebSocket API response. */
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

/** WebSocket API error response. */
interface ErrorResponse {
    /** The channel type. */
    channel: "error";

    /** The error message. */
    data: string;
}

/**
 * The error thrown when the WebSocket request fails.
 */
export class WebSocketRequestError extends Error {
    /** Creates a new WebSocket request error. */
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
     * Reconnection policy configuration.
     * @default { maxAttempts: 3, baseDelay: 150, maxDelay: 5000 }
     */
    reconnect?: {
        /**
         * Maximum number of reconnection attempts. Set to `0` to disable.
         * @default 3
         */
        maxAttempts?: number;

        /**
         * Base delay between reconnection attempts in milliseconds.
         * @default 150
         */
        baseDelay?: number;

        /**
         * Maximum delay between reconnection attempts in milliseconds.
         * @default 5000
         */
        maxDelay?: number;

        /**
         * Custom logic to determine if reconnection should be attempted.
         * @param event - The close event that occurred during the connection.
         * @returns A boolean indicating if reconnection should be attempted.
         * @default Non-normal close code (event.code !== 1000).
         */
        shouldReconnect?: (event: CloseEvent) => boolean | Promise<boolean>;
    };
}

/**
 * The transport connects to the Hyperliquid API via WebSocket.
 */
export class WebSocketTransport implements IRESTTransport {
    /** The transport configuration. */
    config: DeepRequired<WebSocketTransportConfig>;

    protected socket: WebSocket | null = null;
    protected keepAliveTimer: ReturnType<typeof setInterval> | null = null;
    protected reconnectCount: number = 0;
    protected readyPromise: Promise<void> | null = null;
    protected closePromise: Promise<void> | null = null;
    protected shouldReconnect: boolean = true;
    protected pendingRequests: Map<number, {
        // deno-lint-ignore no-explicit-any
        resolve: (value: any) => void;
        reject: (reason: unknown) => void;
    }> = new Map();
    protected lastRequestId: number = 0;

    /**
     * Creates a new WebSocket transport.
     */
    constructor(config: WebSocketTransportConfig = {}) {
        this.config = {
            url: config.url ?? "wss://api.hyperliquid.xyz/ws",
            timeout: config.timeout ?? 10_000,
            keepAliveInterval: config.keepAliveInterval ?? 20_000,
            reconnect: {
                maxAttempts: config.reconnect?.maxAttempts ?? 3,
                baseDelay: config.reconnect?.baseDelay ?? 150,
                maxDelay: config.reconnect?.maxDelay ?? 5000,
                shouldReconnect: config.reconnect?.shouldReconnect ?? ((event) => event.code !== 1000),
            },
        };
        this.connect();
    }

    /**
     * Establishes the WebSocket connection.
     */
    connect(): void {
        if (this.socket?.readyState === WebSocket.CONNECTING || this.socket?.readyState === WebSocket.OPEN) {
            return;
        }

        this.shouldReconnect = true;
        this.socket = new WebSocket(this.config.url);

        const handleOpen = () => {
            this.reconnectCount = 0;

            // Send keep-alive messages
            if (this.config.keepAliveInterval > 0 && !this.keepAliveTimer) {
                this.keepAliveTimer = setInterval(() => {
                    if (this.socket?.readyState === WebSocket.OPEN) {
                        this.socket.send(JSON.stringify({ method: "ping" }));
                    }
                }, this.config.keepAliveInterval);
            }
        };

        const handleClose = async (event: CloseEvent) => {
            this.socket = null;

            // Clear keep-alive timer
            if (this.keepAliveTimer) {
                clearInterval(this.keepAliveTimer);
                this.keepAliveTimer = null;
            }

            // Reject pending requests
            for (const request of this.pendingRequests.values()) {
                request.reject(new DOMException("The WebSocket is in an invalid state.", "InvalidStateError"));
            }
            this.pendingRequests.clear();

            // Reconnect
            if (
                this.shouldReconnect &&
                this.reconnectCount < this.config.reconnect.maxAttempts &&
                await this.config.reconnect.shouldReconnect(event)
            ) {
                const delay = Math.min(
                    Math.floor((1 << this.reconnectCount) * this.config.reconnect.baseDelay * (0.5 + Math.random())),
                    this.config.reconnect.maxDelay,
                );
                this.reconnectCount++;
                setTimeout(() => this.connect(), delay);
            }
        };

        const handleMessage = (event: MessageEvent<string>) => {
            try {
                const msg = JSON.parse(event.data);
                if (isPostResponse(msg)) {
                    this.pendingRequests.get(msg.data.id)?.resolve(
                        msg.data.response.type === "info" ? msg.data.response.payload.data : msg.data.response.payload,
                    );
                } else if (isErrorResponse(msg)) {
                    const responseId = Number(msg.data.match('"id":(.+?),')?.[1]);
                    this.pendingRequests.get(responseId)?.reject(new WebSocketRequestError(msg.data));
                }
            } catch {
                // Ignore errors
            }
        };

        this.socket.addEventListener("open", handleOpen, { once: true });
        this.socket.addEventListener("close", handleClose, { once: true });
        this.socket.addEventListener("message", handleMessage);
    }

    /**
     * Waits for the WebSocket connection to be established.
     * @param signal - Optional AbortSignal to cancel the operation.
     * @returns A promise that resolves when the connection is established.
     *
     * @throws {DOMException} - `AbortError` from {@link signal}.
     * @throws {DOMException} - `InvalidStateError` from invalid WebSocket state
     */
    ready(signal?: AbortSignal): Promise<void> {
        if (!signal && this.readyPromise) {
            return this.readyPromise;
        }

        const promise = new Promise<void>((resolve, reject) => {
            if (signal?.aborted) {
                return reject(new DOMException("The operation was aborted.", "AbortError"));
            }

            if (!this.socket || this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
                return reject(new DOMException("The WebSocket is in an invalid state.", "InvalidStateError"));
            }

            if (this.socket.readyState === WebSocket.OPEN) {
                return resolve();
            }

            const handleOpen = () => {
                this.socket?.removeEventListener("open", handleOpen);
                this.socket?.removeEventListener("close", handleClose);
                signal?.removeEventListener("abort", handleAbort);
                resolve();
            };

            const handleClose = () => {
                this.socket?.removeEventListener("open", handleOpen);
                this.socket?.removeEventListener("close", handleClose);
                signal?.removeEventListener("abort", handleAbort);
                reject(new DOMException("The WebSocket is in an invalid state.", "InvalidStateError"));
            };

            const handleAbort = () => {
                this.socket?.removeEventListener("open", handleOpen);
                this.socket?.removeEventListener("close", handleClose);
                signal?.removeEventListener("abort", handleAbort);
                reject(new DOMException("The operation was aborted.", "AbortError"));
            };

            this.socket.addEventListener("open", handleOpen, { once: true });
            this.socket.addEventListener("close", handleClose, { once: true });
            signal?.addEventListener("abort", handleAbort, { once: true });
        }).finally(() => {
            if (!signal) {
                this.readyPromise = null;
            }
        });

        if (!signal) {
            this.readyPromise = promise;
        }

        return promise;
    }

    /**
     * Closes the WebSocket connection.
     * @param signal - Optional AbortSignal to cancel the operation.
     * @returns A promise that resolves when the connection is closed.
     *
     * @throws {DOMException} - `AbortError` from {@link signal}.
     */
    close(signal?: AbortSignal): Promise<void> {
        this.shouldReconnect = false;

        if (!signal && this.closePromise) {
            return this.closePromise;
        }

        const promise = new Promise<void>((resolve, reject) => {
            if (signal?.aborted) {
                return reject(new DOMException("The operation was aborted.", "AbortError"));
            }

            if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
                return resolve();
            }

            const handleClose = () => {
                this.socket?.removeEventListener("close", handleClose);
                signal?.removeEventListener("abort", handleAbort);
                resolve();
            };

            const handleAbort = () => {
                this.socket?.removeEventListener("close", handleClose);
                signal?.removeEventListener("abort", handleAbort);
                reject(new DOMException("The operation was aborted.", "AbortError"));
            };

            this.socket.addEventListener("close", handleClose, { once: true });
            signal?.addEventListener("abort", handleAbort, { once: true });

            this.socket.close();
        }).finally(() => {
            if (!signal) {
                this.closePromise = null;
            }
        });

        if (!signal) {
            this.closePromise = promise;
        }

        return promise;
    }

    /**
     * Sends an API request.
     * @param endpoint - The endpoint to send the request to.
     * @param payload - The request payload.
     * @returns The response body.
     *
     * @throws {DOMException} - On `TimeoutError` from {@link WebSocketTransportConfig.timeout}.
     * @throws {DOMException} - On `InvalidStateError` from invalid WebSocket state. Indicates that the WebSocket connection was terminated before a response was received.
     * @throws {WebSocketRequestError} - On WebSocket request failure.
     */
    async request<T>(type: "info" | "action", payload: unknown): Promise<T> {
        const request: PostRequest<unknown> = {
            method: "post",
            id: ++this.lastRequestId,
            request: {
                type,
                payload: payload,
            },
        };

        const timeoutSignal = this.config.timeout > 0 ? AbortSignal.timeout(this.config.timeout) : undefined;
        const handleTimeout = () => {
            this.pendingRequests.get(request.id)?.reject(new DOMException("The operation timed out.", "TimeoutError"));
        };

        await this.ready(timeoutSignal);

        return await new Promise<T>((resolve, reject) => {
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                return reject(new DOMException("The WebSocket is in an invalid state.", "InvalidStateError"));
            }

            timeoutSignal?.addEventListener("abort", handleTimeout, { once: true });

            this.pendingRequests.set(request.id, { resolve, reject });
            this.socket.send(JSON.stringify(request));
        }).finally(() => {
            timeoutSignal?.removeEventListener("abort", handleTimeout);
            this.pendingRequests.delete(request.id);
        });
    }
}

function isPostResponse(data: unknown): data is PostResponse<unknown> {
    return typeof data === "object" && data !== null && "channel" in data && data.channel === "post";
}

function isErrorResponse(data: unknown): data is ErrorResponse {
    return typeof data === "object" && data !== null && "channel" in data && data.channel === "error";
}
