// deno-lint-ignore-file no-explicit-any
import { delay } from "@std/async/delay";

import { type MaybePromise, TransportError } from "../../base.ts";

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
    connectionDelay?: number | ((attempt: number) => MaybePromise<number>);

    /**
     * Custom logic to determine if reconnection is required.
     * @param event - The close event that occurred during the connection.
     * @returns A boolean indicating if reconnection should be attempted.
     * @defaultValue `() => true` - Always reconnect
     */
    shouldReconnect?: (event: CloseEvent) => MaybePromise<boolean>;

    /**
     * Message buffering strategy between reconnection attempts.
     * @defaultValue `new FIFOMessageBuffer()`
     */
    messageBuffer?: MessageBufferStrategy;
}

/** Message buffer strategy interface. */
export interface MessageBufferStrategy {
    /** Array of buffered messages. */
    messages: (string | ArrayBufferLike | Blob | ArrayBufferView)[];
    /**
     * Add a message to the buffer.
     * @param data - The message to buffer.
     */
    push(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;

    /**
     * Get and remove the next message from the buffer.
     * @returns The next message or `undefined` if no more messages are available.
     */
    shift(): (string | ArrayBufferLike | Blob | ArrayBufferView) | undefined;

    /** Clear all buffered messages. */
    clear(): void;
}

/** Simple FIFO (First In, First Out) buffer implementation. */
class FIFOMessageBuffer implements MessageBufferStrategy {
    messages: (string | ArrayBufferLike | Blob | ArrayBufferView)[] = [];
    constructor() {}
    push(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
        this.messages.push(data);
    }
    shift(): (string | ArrayBufferLike | Blob | ArrayBufferView) | undefined {
        return this.messages.shift();
    }
    clear(): void {
        this.messages = [];
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
        public originalError?: unknown,
    ) {
        super(`Error when reconnecting WebSocket: ${code}`);
        this.name = "ReconnectingWebSocketError";
    }
}

/**
 * A WebSocket that automatically reconnects when disconnected.
 * Fully compatible with standard WebSocket API.
 */
export class ReconnectingWebSocket implements WebSocket {
    /** Controller for handling connection termination. */
    private _terminationController: AbortController = new AbortController();

    /** WebSocket protocols defined in constructor. */
    private _protocols?: string | string[];

    /** Non-permanent original instance of WebSocket. */
    private _socket: WebSocket;

    /** Current number of reconnection attempts */
    protected _reconnectCount: number = 0;

    /** The array of registered event listeners to recover from reconnection. */
    private _eventListeners: {
        type: string;
        listener: EventListenerOrEventListenerObject;
        options?: boolean | AddEventListenerOptions;
        listenerProxy: EventListenerOrEventListenerObject;
    }[] = [];

    /** WebSocket event handlers for reconnection. */
    private _onclose: ((this: WebSocket, ev: CloseEvent) => any) | null;
    /** WebSocket event handlers for reconnection. */
    private _onerror: ((this: WebSocket, ev: Event) => any) | null;
    /** WebSocket event handlers for reconnection. */
    private _onmessage: ((this: WebSocket, ev: MessageEvent<any>) => any) | null;
    /** WebSocket event handlers for reconnection. */
    private _onopen: ((this: WebSocket, ev: Event) => any) | null;

    /** Configuration options for WebSocket reconnection. */
    public reconnectOptions: Required<ReconnectingWebSocketOptions>;

    /** The signal that is aborted when the connection is permanently closed. */
    public terminationSignal: AbortSignal = this._terminationController.signal;

    /**
     * Creates a new reconnecting WebSocket.
     * @param url - The WebSocket URL to connect to.
     * @param protocols - The WebSocket protocols to use.
     * @param options - The configuration options.
     */
    constructor(
        url: string | URL,
        protocols?: string | string[],
        options?: ReconnectingWebSocketOptions,
    ) {
        // Set the default options
        this.reconnectOptions = {
            maxRetries: options?.maxRetries ?? 3,
            connectionTimeout: options?.connectionTimeout === undefined ? 10_000 : options.connectionTimeout,
            connectionDelay: options?.connectionDelay ?? ((attempt) => Math.min(~~(1 << attempt) * 150, 10_000)),
            shouldReconnect: options?.shouldReconnect ?? (() => true),
            messageBuffer: options?.messageBuffer ?? new FIFOMessageBuffer(),
        };
        this._protocols = protocols;

        // Create the WebSocket instance
        this._socket = createWebSocketWithTimeout(
            url,
            this._protocols,
            this.reconnectOptions.connectionTimeout,
        );

        // Initialize the reconnection event listeners
        this._initEventListeners();

        // Store the original event listeners for reconnection
        this._onclose = this._socket.onclose;
        this._onerror = this._socket.onerror;
        this._onmessage = this._socket.onmessage;
        this._onopen = this._socket.onopen;
    }

    /** Initializes the internal event listeners for the WebSocket. */
    private _initEventListeners(): void {
        this._socket.addEventListener("open", () => {
            // Send all buffered messages
            let message: (string | ArrayBufferLike | Blob | ArrayBufferView) | undefined;
            while ((message = this.reconnectOptions.messageBuffer.shift()) !== undefined) {
                this._socket.send(message);
            }
        }, { once: true });
        this._socket.addEventListener("close", async (event) => {
            try {
                // If the termination signal is already aborted, do not attempt to reconnect
                if (this._terminationController.signal.aborted) return;

                // Check if reconnection should be attempted
                if (++this._reconnectCount > this.reconnectOptions.maxRetries) {
                    this._cleanup(new ReconnectingWebSocketError("RECONNECTION_LIMIT_REACHED"));
                    return;
                }

                const userDecision = await this.reconnectOptions.shouldReconnect(event);
                if (this._terminationController.signal.aborted) return; // Check again after the await
                if (!userDecision) {
                    this._cleanup(new ReconnectingWebSocketError("RECONNECTION_STOPPED_BY_USER"));
                    return;
                }

                // Delay before reconnecting
                const delayTime = typeof this.reconnectOptions.connectionDelay === "number"
                    ? this.reconnectOptions.connectionDelay
                    : await this.reconnectOptions.connectionDelay(this._reconnectCount);
                if (this._terminationController.signal.aborted) return; // Check again after the await
                await delay(delayTime, { signal: this._terminationController.signal });

                // Create a new WebSocket instance
                this._socket = createWebSocketWithTimeout(
                    this.url,
                    this._protocols,
                    this.reconnectOptions.connectionTimeout,
                );

                // Reconnect all listeners
                this._initEventListeners();

                this._eventListeners.forEach(({ type, listenerProxy, options }) => {
                    this._socket.addEventListener(type, listenerProxy, options);
                });

                this._socket.onclose = this._onclose;
                this._socket.onerror = this._onerror;
                this._socket.onmessage = this._onmessage;
                this._socket.onopen = this._onopen;
            } catch (error) {
                this._cleanup(new ReconnectingWebSocketError("UNKNOWN_ERROR", error));
            }
        }, { once: true });
    }

    /**
     * Clean up internal resources.
     * @param reason - The reason for cleanup.
     */
    private _cleanup(reason: ReconnectingWebSocketError): void {
        this._terminationController.abort(reason);
        this.reconnectOptions.messageBuffer.clear();
        this._eventListeners = [];
        this._socket.dispatchEvent(new CustomEvent("error", { detail: reason }));
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

    readonly CLOSED = WebSocket.CLOSED;
    readonly CLOSING = WebSocket.CLOSING;
    readonly CONNECTING = WebSocket.CONNECTING;
    readonly OPEN = WebSocket.OPEN;

    static readonly CLOSED = WebSocket.CLOSED;
    static readonly CLOSING = WebSocket.CLOSING;
    static readonly CONNECTING = WebSocket.CONNECTING;
    static readonly OPEN = WebSocket.OPEN;

    get onclose(): ((this: WebSocket, ev: CloseEvent) => any) | null {
        return this._socket.onclose;
    }
    set onclose(value: ((this: WebSocket, ev: CloseEvent) => any) | null) {
        this._socket.onclose = value;
        this._onclose = value; // Store the listener for reconnection
    }

    get onerror(): ((this: WebSocket, ev: Event) => any) | null {
        return this._socket.onerror;
    }
    set onerror(value: ((this: WebSocket, ev: Event) => any) | null) {
        this._socket.onerror = value;
        this._onerror = value; // Store the listener for reconnection
    }

    get onmessage(): ((this: WebSocket, ev: MessageEvent<any>) => any) | null {
        return this._socket.onmessage;
    }
    set onmessage(value: ((this: WebSocket, ev: MessageEvent<any>) => any) | null) {
        this._socket.onmessage = value;
        this._onmessage = value; // Store the listener for reconnection
    }

    get onopen(): ((this: WebSocket, ev: Event) => any) | null {
        return this._socket.onopen;
    }
    set onopen(value: ((this: WebSocket, ev: Event) => any) | null) {
        this._socket.onopen = value;
        this._onopen = value; // Store the listener for reconnection
    }

    /**
     * @param permanently - If `true`, the connection will be permanently closed. Default is `true`.
     */
    close(code?: number, reason?: string, permanently: boolean = true): void {
        this._socket.close(code, reason);
        if (permanently) {
            this._cleanup(new ReconnectingWebSocketError("USER_INITIATED_CLOSE"));
        }
    }

    /**
     * @note If the connection is not open, the data will be buffered and sent when the connection is established.
     */
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
        if (this._socket.readyState !== WebSocket.OPEN && !this._terminationController.signal.aborted) {
            this.reconnectOptions.messageBuffer.push(data);
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
        if (this._terminationController.signal.aborted) {
            // If the connection is permanently closed, use the original listener
            listenerProxy = listener;
        } else {
            // Check if the listener is already registered
            const index = this._eventListeners.findIndex((e) => listenersMatch(e, { type, listener, options }));
            if (index !== -1) {
                // Use the existing listener proxy
                listenerProxy = this._eventListeners[index].listenerProxy;
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
                        if (typeof options === "object" && options.once === true) {
                            const index = this._eventListeners.findIndex((e) =>
                                listenersMatch(e, { type, listener, options })
                            );
                            if (index !== -1) {
                                this._eventListeners.splice(index, 1);
                            }
                        }
                    }
                };
                this._eventListeners.push({ type, listener, options, listenerProxy });
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
        const index = this._eventListeners.findIndex((e) => listenersMatch(e, { type, listener, options }));
        if (index !== -1) {
            const { listenerProxy } = this._eventListeners[index];
            this._socket.removeEventListener(type, listenerProxy, options);
            this._eventListeners.splice(index, 1);
        } else {
            // If the wrapped listener is not found, remove the original listener
            this._socket.removeEventListener(type, listener, options);
        }
    }

    dispatchEvent(event: Event): boolean {
        return this._socket.dispatchEvent(event);
    }
}

/** Creates a WebSocket with connection timeout. */
function createWebSocketWithTimeout(
    url: string | URL,
    protocols?: string | string[],
    timeout?: number | null,
): WebSocket {
    const socket = new WebSocket(url, protocols);
    if (timeout === null || timeout === undefined) return socket;

    const timeoutId = setTimeout(() => {
        socket.removeEventListener("open", openHandler);
        socket.removeEventListener("close", closeHandler);
        socket.close(3008, "Timeout"); // https://www.iana.org/assignments/websocket/websocket.xml#close-code-number
    }, timeout);

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

/** Check if two event listeners are the same (just like EventTarget). */
function listenersMatch(
    a: { type: string; listener: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions },
    b: { type: string; listener: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions },
): boolean {
    // EventTarget only compares capture in options, even if one is an object and the other is boolean
    const aCapture = Boolean(typeof a.options === "object" ? a.options.capture : a.options);
    const bCapture = Boolean(typeof b.options === "object" ? b.options.capture : b.options);
    return a.type === b.type && a.listener === b.listener && aCapture === bCapture;
}
