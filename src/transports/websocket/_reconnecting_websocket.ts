// deno-lint-ignore-file no-explicit-any
import type { MaybePromise } from "../../base.ts";
import { TransportError } from "../base.ts";

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

/** Simple FIFO (First In, First Out) buffer implementation. */
class FIFOMessageBuffer implements MessageBufferStrategy {
    queue: {
        data: string | ArrayBufferLike | Blob | ArrayBufferView;
        signal?: AbortSignal;
    }[] = [];

    push(data: string | ArrayBufferLike | Blob | ArrayBufferView, signal?: AbortSignal): void {
        this.queue.push({ data, signal });
    }

    *[Symbol.iterator](): Iterator<string | ArrayBufferLike | Blob | ArrayBufferView> {
        while (this.queue.length > 0) {
            const { data, signal } = this.queue.shift()!;
            if (signal?.aborted) continue;
            yield data;
        }
    }
}

/** Error thrown when reconnection problems occur. */
export class ReconnectingWebSocketError extends TransportError {
    constructor(
        public code:
            | "RECONNECTION_LIMIT_REACHED"
            | "RECONNECTION_STOPPED_BY_USER"
            | "USER_INITIATED_CLOSE"
            | "UNKNOWN_ERROR",
        cause?: unknown,
    ) {
        super(`Error when reconnecting WebSocket: ${code}`);
        this.name = "ReconnectingWebSocketError";
        this.cause = cause;
    }
}

/**
 * A WebSocket that automatically reconnects when disconnected.
 * Fully compatible with standard WebSocket API.
 */
export class ReconnectingWebSocket implements WebSocket {
    protected _socket: WebSocket;
    protected _protocols?: string | string[];
    protected _listeners: {
        type: string;
        listener: EventListenerOrEventListenerObject;
        options?: boolean | AddEventListenerOptions;
        listenerProxy: EventListenerOrEventListenerObject;
    }[] = [];
    protected _attempt = 0;
    reconnectOptions: Required<ReconnectingWebSocketOptions>;
    readonly reconnectAbortController: AbortController = new AbortController();

    constructor(url: string | URL, protocols?: string | string[], options?: ReconnectingWebSocketOptions) {
        this.reconnectOptions = {
            maxRetries: options?.maxRetries ?? 3,
            connectionTimeout: options?.connectionTimeout === undefined ? 10_000 : options.connectionTimeout,
            connectionDelay: options?.connectionDelay ?? ((n) => Math.min(~~(1 << n) * 150, 10_000)),
            shouldReconnect: options?.shouldReconnect ?? (() => true),
            messageBuffer: options?.messageBuffer ?? new FIFOMessageBuffer(),
        };

        this._socket = this._createSocket(url, protocols);
        this._protocols = protocols;
        this._setupEventListeners();
    }

    protected _createSocket(url: string | URL, protocols?: string | string[]): WebSocket {
        const socket = new WebSocket(url, protocols);
        if (this.reconnectOptions.connectionTimeout === null) return socket;

        const timeoutId = setTimeout(() => {
            socket.removeEventListener("open", openHandler);
            socket.removeEventListener("close", closeHandler);
            socket.close(3008, "Timeout"); // https://www.iana.org/assignments/websocket/websocket.xml#close-code-number
        }, this.reconnectOptions.connectionTimeout);

        const openHandler = () => {
            socket.removeEventListener("close", closeHandler);
            clearTimeout(timeoutId);
        };
        const closeHandler = () => {
            socket.removeEventListener("open", openHandler);
            clearTimeout(timeoutId);
        };

        socket.addEventListener("open", openHandler, { once: true });
        socket.addEventListener("close", closeHandler, { once: true });

        return socket;
    }

    /** Initializes the internal event listeners for the socket. */
    protected _setupEventListeners() {
        this._socket.addEventListener("open", this._open, { once: true });
        this._socket.addEventListener("close", this._close, { once: true });
    }
    protected _open: () => void = () => {
        // Reset the attempt counter
        this._attempt = 0;

        // Send all buffered messages
        for (const message of this.reconnectOptions.messageBuffer) {
            this._socket.send(message);
        }
    };
    protected _close = async (event: CloseEvent) => {
        try {
            // If the event was triggered but the socket is not closing, ignore it
            if (
                this._socket.readyState !== ReconnectingWebSocket.CLOSING &&
                this._socket.readyState !== ReconnectingWebSocket.CLOSED
            ) return;

            // If the instance is terminated, do not attempt to reconnect
            if (this.reconnectAbortController.signal.aborted) return;

            // Check if reconnection should be attempted
            if (++this._attempt > this.reconnectOptions.maxRetries) {
                this._cleanup("RECONNECTION_LIMIT_REACHED");
                return;
            }

            const userDecision = await this.reconnectOptions.shouldReconnect(
                event,
                this.reconnectAbortController.signal,
            );
            if (this.reconnectAbortController.signal.aborted) return;
            if (!userDecision) {
                this._cleanup("RECONNECTION_STOPPED_BY_USER");
                return;
            }

            // Delay before reconnecting
            const reconnectDelay = typeof this.reconnectOptions.connectionDelay === "number"
                ? this.reconnectOptions.connectionDelay
                : await this.reconnectOptions.connectionDelay(this._attempt, this.reconnectAbortController.signal);
            if (this.reconnectAbortController.signal.aborted) return;
            await delay(reconnectDelay, this.reconnectAbortController.signal);

            // Create a new WebSocket instance
            const { onclose, onerror, onmessage, onopen } = this._socket;
            this._socket = this._createSocket(this._socket.url, this._protocols);

            // Reconnect all listeners
            this._setupEventListeners();

            this._listeners.forEach(({ type, listenerProxy, options }) => {
                this._socket.addEventListener(type, listenerProxy, options);
            });

            this._socket.onclose = onclose;
            this._socket.onerror = onerror;
            this._socket.onmessage = onmessage;
            this._socket.onopen = onopen;
        } catch (error) {
            this._cleanup("UNKNOWN_ERROR", error);
        }
    };

    /** Clean up internal resources. */
    protected _cleanup(code: ConstructorParameters<typeof ReconnectingWebSocketError>[0], cause?: unknown) {
        this.reconnectAbortController.abort(new ReconnectingWebSocketError(code, cause));
        this._listeners = [];
        this._socket.close();
    }

    // WebSocket property implementations
    get url(): string {
        return this._socket.url;
    }
    get readyState(): number {
        return this._socket.readyState;
    }
    get bufferedAmount(): number {
        return this._socket.bufferedAmount;
    }
    get extensions(): string {
        return this._socket.extensions;
    }
    get protocol(): string {
        return this._socket.protocol;
    }
    get binaryType(): BinaryType {
        return this._socket.binaryType;
    }
    set binaryType(value: BinaryType) {
        this._socket.binaryType = value;
    }

    readonly CONNECTING = 0;
    readonly OPEN = 1;
    readonly CLOSING = 2;
    readonly CLOSED = 3;

    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;

    get onclose(): ((this: WebSocket, ev: CloseEvent) => any) | null {
        return this._socket.onclose;
    }
    set onclose(value: ((this: WebSocket, ev: CloseEvent) => any) | null) {
        this._socket.onclose = value;
    }

    get onerror(): ((this: WebSocket, ev: Event) => any) | null {
        return this._socket.onerror;
    }
    set onerror(value: ((this: WebSocket, ev: Event) => any) | null) {
        this._socket.onerror = value;
    }

    get onmessage(): ((this: WebSocket, ev: MessageEvent<any>) => any) | null {
        return this._socket.onmessage;
    }
    set onmessage(value: ((this: WebSocket, ev: MessageEvent<any>) => any) | null) {
        this._socket.onmessage = value;
    }

    get onopen(): ((this: WebSocket, ev: Event) => any) | null {
        return this._socket.onopen;
    }
    set onopen(value: ((this: WebSocket, ev: Event) => any) | null) {
        this._socket.onopen = value;
    }

    /**
     * @param permanently - If `true`, the connection will be permanently closed. Default is `true`.
     */
    close(code?: number, reason?: string, permanently: boolean = true): void {
        this._socket.close(code, reason);
        if (permanently) this._cleanup("USER_INITIATED_CLOSE");
    }

    /**
     * @param signal - `AbortSignal` to cancel sending a message if it was in the buffer.
     * @note If the connection is not open, the data will be buffered and sent when the connection is established.
     */
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView, signal?: AbortSignal): void {
        if (signal?.aborted) return;
        if (this._socket.readyState !== ReconnectingWebSocket.OPEN && !this.reconnectAbortController.signal.aborted) {
            this.reconnectOptions.messageBuffer.push(data, signal);
        } else {
            this._socket.send(data);
        }
    }

    addEventListener<K extends keyof WebSocketEventMap>(
        type: K,
        listener:
            | ((this: ReconnectingWebSocket, ev: WebSocketEventMap[K]) => any)
            | { handleEvent: (event: WebSocketEventMap[K]) => any },
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void {
        // Wrap the listener to handle reconnection
        let listenerProxy: EventListenerOrEventListenerObject;
        if (this.reconnectAbortController.signal.aborted) {
            // If the instance is terminated, use the original listener
            listenerProxy = listener;
        } else {
            // Check if the listener is already registered
            const index = this._listeners.findIndex((e) => listenersMatch(e, { type, listener, options }));
            if (index !== -1) {
                // Use the existing listener proxy
                listenerProxy = this._listeners[index].listenerProxy;
            } else {
                // Wrap the original listener to follow the once option when reconnecting
                listenerProxy = (event: Event) => {
                    try {
                        if (typeof listener === "function") {
                            listener.call(this, event);
                        } else {
                            listener.handleEvent(event);
                        }
                    } finally {
                        // If the listener is marked as once, remove it after the first invocation
                        if (typeof options === "object" && options.once === true) {
                            const index = this._listeners.findIndex((e) =>
                                listenersMatch(e, { type, listener, options })
                            );
                            if (index !== -1) {
                                this._listeners.splice(index, 1);
                            }
                        }
                    }
                };
                this._listeners.push({ type, listener, options, listenerProxy });
            }
        }

        // Add the wrapped (or original) listener
        this._socket.addEventListener(type, listenerProxy, options);
    }

    removeEventListener<K extends keyof WebSocketEventMap>(
        type: K,
        listener:
            | ((this: ReconnectingWebSocket, ev: WebSocketEventMap[K]) => any)
            | { handleEvent: (event: WebSocketEventMap[K]) => any },
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void {
        // Remove a wrapped listener, not an original listener
        const index = this._listeners.findIndex((e) => listenersMatch(e, { type, listener, options }));
        if (index !== -1) {
            const { listenerProxy } = this._listeners[index];
            this._socket.removeEventListener(type, listenerProxy, options);
            this._listeners.splice(index, 1);
        } else {
            // If the wrapped listener is not found, remove the original listener
            this._socket.removeEventListener(type, listener, options);
        }
    }

    dispatchEvent(event: Event): boolean {
        return this._socket.dispatchEvent(event);
    }
}

function listenersMatch(
    a: { type: string; listener: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions },
    b: { type: string; listener: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions },
): boolean {
    // EventTarget only compares capture in options, even if one is an object and the other is boolean
    const aCapture = Boolean(typeof a.options === "object" ? a.options.capture : a.options);
    const bCapture = Boolean(typeof b.options === "object" ? b.options.capture : b.options);
    return a.type === b.type && a.listener === b.listener && aCapture === bCapture;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) return Promise.reject(signal.reason);
    return new Promise((resolve, reject) => {
        const onAbort = () => {
            clearTimeout(timer);
            reject(signal?.reason);
        };
        const onTimeout = () => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        };
        const timer = setTimeout(onTimeout, ms);
        signal?.addEventListener("abort", onAbort, { once: true });
    });
}
