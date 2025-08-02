import { TransportError } from "../base.js";
type MaybePromise<T> = T | Promise<T>;
/** Configuration options for the `ReconnectingWebSocket`. */
export interface ReconnectingWebSocketOptions {
    /**
     * Maximum number of reconnection attempts.
     * @defaultValue `3`
     */
    maxRetries?: number;
    /**
     * Maximum time in ms to wait for a connection to open.
     * Set to `null` to disable.
     * @defaultValue `10_000`
     */
    connectionTimeout?: number | null;
    /**
     * Delay between reconnection attempts in ms.
     * May be a number or a function that returns a number.
     * @param attempt - The current attempt number.
     * @defaultValue `(attempt) => Math.min(~~(1 << attempt) * 150, 10_000)` - Exponential backoff (max 10s)
     */
    connectionDelay?: number | ((attempt: number, signal: AbortSignal) => MaybePromise<number>);
    /**
     * Custom logic to determine if reconnection is required.
     * @param event - The close event that occurred during the connection.
     * @returns A boolean indicating if reconnection should be attempted.
     * @defaultValue `() => true` - Always reconnect
     */
    shouldReconnect?: (event: CloseEvent, signal: AbortSignal) => MaybePromise<boolean>;
    /**
     * Message buffering strategy between reconnection attempts.
     * @defaultValue `new FIFOMessageBuffer()`
     */
    messageBuffer?: MessageBufferStrategy;
}
/** Message buffer strategy interface. */
export interface MessageBufferStrategy {
    push(data: string | ArrayBufferLike | Blob | ArrayBufferView, signal?: AbortSignal): void;
    [Symbol.iterator](): Iterator<string | ArrayBufferLike | Blob | ArrayBufferView>;
}
/** Error thrown when reconnection problems occur. */
export declare class ReconnectingWebSocketError extends TransportError {
    code: "RECONNECTION_LIMIT_REACHED" | "RECONNECTION_STOPPED_BY_USER" | "USER_INITIATED_CLOSE" | "UNKNOWN_ERROR";
    constructor(code: "RECONNECTION_LIMIT_REACHED" | "RECONNECTION_STOPPED_BY_USER" | "USER_INITIATED_CLOSE" | "UNKNOWN_ERROR", cause?: unknown);
}
/**
 * A WebSocket that automatically reconnects when disconnected.
 * Fully compatible with standard WebSocket API.
 */
export declare class ReconnectingWebSocket implements WebSocket {
    protected _socket: WebSocket;
    protected _protocols?: string | string[];
    protected _listeners: {
        type: string;
        listener: EventListenerOrEventListenerObject;
        options?: boolean | AddEventListenerOptions;
        listenerProxy: EventListenerOrEventListenerObject;
    }[];
    protected _attempt: number;
    reconnectOptions: Required<ReconnectingWebSocketOptions>;
    readonly reconnectAbortController: AbortController;
    constructor(url: string | URL, protocols?: string | string[], options?: ReconnectingWebSocketOptions);
    protected _createSocket(url: string | URL, protocols?: string | string[]): WebSocket;
    /** Initializes the internal event listeners for the socket. */
    protected _setupEventListeners(): void;
    protected _open: () => void;
    protected _close: (event: CloseEvent) => Promise<void>;
    /** Clean up internal resources. */
    protected _cleanup(code: ConstructorParameters<typeof ReconnectingWebSocketError>[0], cause?: unknown): void;
    get url(): string;
    get readyState(): number;
    get bufferedAmount(): number;
    get extensions(): string;
    get protocol(): string;
    get binaryType(): BinaryType;
    set binaryType(value: BinaryType);
    readonly CONNECTING = 0;
    readonly OPEN = 1;
    readonly CLOSING = 2;
    readonly CLOSED = 3;
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
    get onclose(): ((this: WebSocket, ev: CloseEvent) => any) | null;
    set onclose(value: ((this: WebSocket, ev: CloseEvent) => any) | null);
    get onerror(): ((this: WebSocket, ev: Event) => any) | null;
    set onerror(value: ((this: WebSocket, ev: Event) => any) | null);
    get onmessage(): ((this: WebSocket, ev: MessageEvent<any>) => any) | null;
    set onmessage(value: ((this: WebSocket, ev: MessageEvent<any>) => any) | null);
    get onopen(): ((this: WebSocket, ev: Event) => any) | null;
    set onopen(value: ((this: WebSocket, ev: Event) => any) | null);
    /**
     * @param permanently - If `true`, the connection will be permanently closed. Default is `true`.
     */
    close(code?: number, reason?: string, permanently?: boolean): void;
    /**
     * @param signal - `AbortSignal` to cancel sending a message if it was in the buffer.
     * @note If the connection is not open, the data will be buffered and sent when the connection is established.
     */
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView, signal?: AbortSignal): void;
    addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: ((this: ReconnectingWebSocket, ev: WebSocketEventMap[K]) => any) | {
        handleEvent: (event: WebSocketEventMap[K]) => any;
    }, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof WebSocketEventMap>(type: K, listener: ((this: ReconnectingWebSocket, ev: WebSocketEventMap[K]) => any) | {
        handleEvent: (event: WebSocketEventMap[K]) => any;
    }, options?: boolean | EventListenerOptions): void;
    dispatchEvent(event: Event): boolean;
}
export {};
//# sourceMappingURL=_reconnecting_websocket.d.ts.map