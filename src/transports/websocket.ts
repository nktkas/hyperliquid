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
     * Reconnection policy configuration for closed connections.
     * @note Only re-establishes the connection, does not retry failed requests.
     * @default { maxAttempts: 3, baseDelay: 150, maxDelay: 5000 }
     */
    reconnect?: {
        /**
         * Maximum number of reconnection attempts. Set to `0` to disable.
         * @default 3
         */
        maxAttempts?: number;

        /**
         * Deler between reconnection attempts in milliseconds.
         * @default (attempt) => ~~(1 << attempt) * 150 // Exponential backoff
         */
        delay: number | ((attempt: number) => number | Promise<number>);

        /**
         * Custom logic to determine if reconnection should be attempted.
         * @param event - The close event that occurred during the connection.
         * @returns A boolean indicating if reconnection should be attempted.
         * @default (event) => event.code !== 1000
         */
        shouldReattempt?: (event: CloseEvent) => boolean | Promise<boolean>;
    };

    /**
     * Retry policy configuration for failed requests.
     * @note Only works with async requests and when reconnect is enabled.
     */
    retry?: {
        /**
         * Maximum number of retry attempts. Set to `0` to disable.
         * @default 0
         */
        maxAttempts?: number;
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
    protected shouldReconnect: boolean = true;
    protected pendingRequests: Map<number, {
        // deno-lint-ignore no-explicit-any
        resolve: (value: any) => void;
        reject: (reason: unknown) => void;
        retryCount: number;
        payload: PostRequest<unknown>;
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
                delay: config.reconnect?.delay ?? ((attempt) => ~~(1 << attempt) * 150),
                shouldReattempt: config.reconnect?.shouldReattempt ?? ((event) => event.code !== 1000),
            },
            retry: {
                maxAttempts: config.retry?.maxAttempts ?? 0,
            },
        };
        this.connect();
    }

    /**
     * Establishes the WebSocket connection.
     */
    connect(): void {
        this.shouldReconnect = true;

        if (this.socket?.readyState === WebSocket.CONNECTING || this.socket?.readyState === WebSocket.OPEN) {
            return;
        }

        this.socket = new WebSocket(this.config.url);

        const handleOpen = () => {
            this.reconnectCount = 0;

            // Retry pending requests after reconnection
            if (this.config.reconnect.maxAttempts > 0 && this.config.retry.maxAttempts > 0) {
                for (const [id, request] of this.pendingRequests.entries()) {
                    if (request.retryCount < this.config.retry.maxAttempts) {
                        request.retryCount++;
                        if (this.socket?.readyState === WebSocket.OPEN) {
                            this.socket.send(JSON.stringify(request.payload));
                        }
                    } else {
                        request.reject(new WebSocketRequestError("Max retry attempts reached"));
                        this.pendingRequests.delete(id);
                    }
                }
            }

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

            // Handle pending requests based on retry configuration
            if (this.config.reconnect.maxAttempts > 0 && this.config.retry.maxAttempts > 0) {
                // Keep requests that haven't exceeded retry attempts
                for (const [id, request] of this.pendingRequests.entries()) {
                    if (request.retryCount >= this.config.retry.maxAttempts) {
                        request.reject(new WebSocketRequestError("Max retry attempts reached"));
                        this.pendingRequests.delete(id);
                    }
                }
            } else {
                // Reject all pending requests if retry is disabled
                for (const request of this.pendingRequests.values()) {
                    request.reject(new DOMException("The WebSocket is in an invalid state.", "InvalidStateError"));
                }
                this.pendingRequests.clear();
            }

            // Reconnect
            if (
                this.shouldReconnect &&
                this.reconnectCount < this.config.reconnect.maxAttempts &&
                await this.config.reconnect.shouldReattempt(event)
            ) {
                this.reconnectCount++;
                const delayDuration = typeof this.config.reconnect.delay === "number"
                    ? this.config.reconnect.delay
                    : await this.config.reconnect.delay(this.reconnectCount);
                setTimeout(() => this.connect(), delayDuration);
            }
        };

        const handleMessage = (event: MessageEvent<string>) => {
            try {
                const msg = JSON.parse(event.data);
                if (isPostResponse(msg)) {
                    const request = this.pendingRequests.get(msg.data.id);
                    if (request) {
                        request.resolve(
                            msg.data.response.type === "info" ? msg.data.response.payload.data : msg.data.response.payload,
                        );
                        this.pendingRequests.delete(msg.data.id);
                    }
                } else if (isErrorResponse(msg)) {
                    const responseId = msg.data.match('"id":(.+?),')?.[1]?.trim();
                    if (responseId) {
                        const request = this.pendingRequests.get(Number(responseId));
                        if (request) {
                            request.reject(new WebSocketRequestError(msg.data));
                            this.pendingRequests.delete(Number(responseId));
                        }
                    }
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
     * @param signal - An optional abort signal.
     * @returns A promise that resolves when the connection is established.
     */
    ready(signal?: AbortSignal): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (signal?.aborted) {
                return reject(signal.reason);
            }

            if (!this.socket || this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
                return reject(new DOMException("The WebSocket is in an invalid state.", "InvalidStateError"));
            }

            if (this.socket.readyState === WebSocket.OPEN) {
                return resolve();
            }

            const handleOpen = () => {
                this.socket?.removeEventListener("close", handleClose);
                signal?.removeEventListener("abort", handleAbort);
                resolve();
            };

            const handleClose = () => {
                this.socket?.removeEventListener("open", handleOpen);
                signal?.removeEventListener("abort", handleAbort);
                reject(new DOMException("The WebSocket is in an invalid state.", "InvalidStateError"));
            };

            const handleAbort = () => {
                this.socket?.removeEventListener("open", handleOpen);
                this.socket?.removeEventListener("close", handleClose);
                reject(signal!.reason);
            };

            this.socket.addEventListener("open", handleOpen, { once: true });
            this.socket.addEventListener("close", handleClose, { once: true });
            signal?.addEventListener("abort", handleAbort, { once: true });
        });
    }

    /**
     * Closes the WebSocket connection.
     * @param signal - An optional abort signal.
     * @returns A promise that resolves when the connection is closed.
     */
    close(signal?: AbortSignal): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.shouldReconnect = false;

            if (signal?.aborted) {
                return reject(signal.reason);
            }

            if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
                return resolve();
            }

            const handleClose = () => {
                signal?.removeEventListener("abort", handleAbort);
                resolve();
            };

            const handleAbort = () => {
                this.socket?.removeEventListener("close", handleClose);
                reject(signal!.reason);
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
        const timeoutSignal = this.config.timeout > 0 ? AbortSignal.timeout(this.config.timeout) : undefined;
        const combinedSignal = signal && timeoutSignal ? AbortSignal.any([signal, timeoutSignal]) : signal ?? timeoutSignal;

        await this.ready(combinedSignal);

        const request: PostRequest<unknown> = {
            method: "post",
            id: ++this.lastRequestId,
            request: { type, payload },
        };

        const handleAbort = () => {
            const pendingRequest = this.pendingRequests.get(request.id);
            if (pendingRequest) {
                pendingRequest.reject(new DOMException("The operation timed out.", "TimeoutError"));
                this.pendingRequests.delete(request.id);
            }
        };

        return new Promise<T>((resolve, reject) => {
            combinedSignal?.addEventListener("abort", handleAbort, { once: true });

            this.socket!.send(JSON.stringify(request));

            this.pendingRequests.set(request.id, {
                resolve,
                reject,
                retryCount: 0,
                payload: request,
            });
        }).finally(() => {
            combinedSignal?.removeEventListener("abort", handleAbort);
        });
    }
}

function isPostResponse(data: unknown): data is PostResponse<unknown> {
    return typeof data === "object" && data !== null && "channel" in data && data.channel === "post";
}

function isErrorResponse(data: unknown): data is ErrorResponse {
    return typeof data === "object" && data !== null && "channel" in data && data.channel === "error";
}
