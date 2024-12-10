// deno-lint-ignore-file no-explicit-any

/**
 * ReconnectingWebSocket configuration
 */
export interface ReconnectingWebSocketConfig {
    /**
     * Maximum number of reconnection attempts.
     * @default 3
     */
    maxAttempts?: number;

    /**
     * Delay between reconnection attempts in milliseconds.
     * @default (attempt) => Math.min(~~(1 << attempt) * 150, 10_000) // Exponential backoff (max 10s)
     */
    delay?: number | ((attempt: number) => number | Promise<number>);

    /**
     * Custom logic to determine if reconnection should be attempted.
     * @param event - The close event that occurred during the connection.
     * @returns A boolean indicating if reconnection should be attempted.
     * @default (event) => event.code !== 1008 && event.code !== 1011
     */
    shouldReattempt?: (event: CloseEvent) => boolean | Promise<boolean>;

    /**
     * Message buffering strategy between reconnection
     * @default new FifoMessageBuffer(100) // FIFO buffer with a maximum size of 100 messages
     */
    messageBuffer?: MessageBufferStrategy;
}

/**
 * Custom events for reconnection monitoring
 */
export interface ReconnectionEventMap {
    /**
     * Dispatched when the WebSocket is reconnecting.
     */
    reconnecting: CustomEvent<{ attempt: number }>;

    /**
     * Dispatched when the WebSocket is reconnected.
     */
    reconnected: CustomEvent<void>;
}

/**
 * Message buffer strategy
 */
export interface MessageBufferStrategy {
    /**
     * Add a message to the buffer
     * @param data - The message to buffer
     * @param signal - An AbortSignal for buffered message to cancel sending on reconnection
     * @returns true if message was buffered, false if rejected
     */
    push(data: string | ArrayBufferLike | Blob | ArrayBufferView, signal?: AbortSignal): boolean;

    /**
     * Get and remove the next message from the buffer
     * @returns The next message or undefined if no more messages are available
     */
    shift(): (string | ArrayBufferLike | Blob | ArrayBufferView) | undefined;

    /**
     * Clear all buffered messages
     */
    clear(): void;
}

/**
 * Simple FIFO buffer implementation
 */
class FifoMessageBuffer implements MessageBufferStrategy {
    private messages: Array<{
        data: string | ArrayBufferLike | Blob | ArrayBufferView;
        signal?: AbortSignal;
    }> = [];

    constructor(private maxSize: number) {}

    push(data: string | ArrayBufferLike | Blob | ArrayBufferView, signal?: AbortSignal): boolean {
        if (this.messages.length >= this.maxSize) {
            return false;
        }
        this.messages.push({ data, signal });
        return true;
    }

    shift(): (string | ArrayBufferLike | Blob | ArrayBufferView) | undefined {
        while (this.messages.length > 0) {
            const message = this.messages.shift();
            if (message && !message.signal?.aborted) {
                return message.data;
            }
        }
        return undefined;
    }

    clear(): void {
        this.messages = [];
    }
}

/**
 * A WebSocket that automatically reconnects when disconnected
 */
export class ReconnectingWebSocket implements WebSocket {
    /**
     * Configuration for the ReconnectingWebSocket
     */
    config: Required<ReconnectingWebSocketConfig>;

    /**
     * Controls permanent termination state.
     * Contains termination reason when aborted.
     */
    readonly terminationController: AbortController = new AbortController();

    protected protocols?: string | string[];
    protected socket: WebSocket;
    protected reconnectCount: number = 0;
    protected eventListeners: {
        type: string;
        listener: EventListenerOrEventListenerObject;
        options?: boolean | AddEventListenerOptions;
        wrappedListener: EventListenerOrEventListenerObject;
    }[] = [];

    constructor(url: string | URL, protocols?: string | string[], config: ReconnectingWebSocketConfig = {}) {
        this.config = {
            maxAttempts: config.maxAttempts ?? 3,
            delay: config.delay ?? ((attempt) => Math.min(~~(1 << attempt) * 150, 10_000)),
            shouldReattempt: config.shouldReattempt ?? ((event) => event.code !== 1008 && event.code !== 1011),
            messageBuffer: config.messageBuffer ?? new FifoMessageBuffer(100),
        };
        this.protocols = protocols;

        // Initialize the socket
        this.socket = new WebSocket(url, protocols);
        this.addEventListener("open", () => {
            // Send buffered messages
            let message: (string | ArrayBufferLike | Blob | ArrayBufferView) | undefined;
            while ((message = this.config.messageBuffer.shift()) !== undefined) {
                this.send(message);
            }
        });
        this.addEventListener("close", async (event: CloseEvent) => {
            try {
                // Ignore if the connection was terminated
                if (this.terminationController.signal.aborted) return;

                // Ignore if the maximum number of reconnection attempts has been reached
                // or the connection should not be reattempted
                if (
                    ++this.reconnectCount > this.config.maxAttempts ||
                    !await this.config.shouldReattempt(event)
                ) {
                    this.cleaner(new Error("Reconnection limit reached"));
                    return;
                }

                // Dispatch the reconnection event
                this.dispatchEvent(new CustomEvent("reconnecting", { detail: { attempt: this.reconnectCount } }));

                // Sleep for the delay
                const delay = typeof this.config.delay === "number"
                    ? this.config.delay
                    : await this.config.delay(this.reconnectCount);
                await sleep(delay, this.terminationController.signal);

                // Reconnect
                this.socket = new WebSocket(this.url, this.protocols);

                // Reattach event listeners
                this.eventListeners.forEach((entry) => {
                    this.socket.addEventListener(entry.type, entry.wrappedListener, entry.options);
                });

                // Attach the open event listener
                this.socket.addEventListener("open", () => {
                    // Reset the reconnection attempt count
                    this.reconnectCount = 0;

                    // Dispatch the reconnected event
                    this.dispatchEvent(new CustomEvent("reconnected"));
                }, { once: true });
            } catch (error) {
                this.cleaner(new Error("Reconnection error", { cause: error }));
            }
        });
    }

    // Implement WebSocket properties
    get url(): string {
        return this.socket.url;
    }
    get readyState(): number {
        return this.socket.readyState;
    }
    get bufferedAmount(): number {
        return this.socket.bufferedAmount;
    }
    get extensions(): string {
        return this.socket.extensions;
    }
    get protocol(): string {
        return this.socket.protocol;
    }
    get binaryType(): BinaryType {
        return this.socket.binaryType;
    }
    set binaryType(value: BinaryType) {
        this.socket.binaryType = value;
    }
    readonly CLOSED = WebSocket.CLOSED;
    readonly CLOSING = WebSocket.CLOSING;
    readonly CONNECTING = WebSocket.CONNECTING;
    readonly OPEN = WebSocket.OPEN;

    // Event handlers
    get onclose(): ((this: WebSocket, ev: CloseEvent) => any) | null {
        return this.socket.onclose;
    }
    set onclose(value: ((this: WebSocket, ev: CloseEvent) => any) | null) {
        this.socket.onclose = value;
    }

    get onerror(): ((this: WebSocket, ev: Event) => any) | null {
        return this.socket.onerror;
    }
    set onerror(value: ((this: WebSocket, ev: Event) => any) | null) {
        this.socket.onerror = value;
    }

    get onmessage(): ((this: WebSocket, ev: MessageEvent<any>) => any) | null {
        return this.socket.onmessage;
    }
    set onmessage(value: ((this: WebSocket, ev: MessageEvent<any>) => any) | null) {
        this.socket.onmessage = value;
    }

    get onopen(): ((this: WebSocket, ev: Event) => any) | null {
        return this.socket.onopen;
    }
    set onopen(value: ((this: WebSocket, ev: Event) => any) | null) {
        this.socket.onopen = value;
    }

    // Methods
    close(code?: number, reason?: string): void {
        this.cleaner("User-initiated close");
        this.socket.close(code, reason);
    }

    /**
     * @param signal - An optional abort signal for message buffering
     */
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView, signal?: AbortSignal): void {
        if (this.socket.readyState !== WebSocket.OPEN) {
            this.config.messageBuffer.push(data, signal);
        } else {
            this.socket.send(data);
        }
    }

    addEventListener<K extends keyof WebSocketEventMap>(
        type: K,
        listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener<K extends keyof ReconnectionEventMap>(
        type: K,
        listener: (this: WebSocket, ev: ReconnectionEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void {
        const wrappedListener = (event: Event) => {
            try {
                if (typeof listener === "function") {
                    listener.call(this, event);
                } else {
                    listener.handleEvent(event);
                }
            } finally {
                const index = this.eventListeners.findIndex((e) => e.type === type && e.listener === listener);
                if (index !== -1) {
                    const { options } = this.eventListeners[index];
                    if (typeof options === "object" && options.once) {
                        this.eventListeners.splice(index, 1);
                    }
                }
            }
        };

        this.socket.addEventListener(type, wrappedListener, options);

        this.eventListeners.push({ type, listener, wrappedListener, options });
    }

    removeEventListener<K extends keyof WebSocketEventMap>(
        type: K,
        listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void {
        const index = this.eventListeners.findIndex((e) => e.type === type && e.listener === listener);
        if (index !== -1) {
            const { wrappedListener } = this.eventListeners[index];
            this.socket.removeEventListener(type, wrappedListener, options);
            this.eventListeners.splice(index, 1);
        }
    }

    dispatchEvent(event: Event): boolean {
        return this.socket.dispatchEvent(event);
    }

    // Custom methods
    protected cleaner(reason?: unknown): void {
        this.terminationController.abort(reason);
        this.eventListeners = [];
        this.config.messageBuffer.clear();
    }
}

/**
 * Returns a new promise that resolves after the specified number of milliseconds,
 * or rejects as soon as the given signal is aborted.
 * @param ms - The number of milliseconds to sleep.
 * @param signal - An optional abort signal.
 * @returns A promise that resolves after the specified number of milliseconds.
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            return reject(signal.reason);
        }

        const onAbort = function (this: AbortSignal) {
            clearTimeout(timer);
            reject(this.reason);
        };

        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);

        signal?.addEventListener("abort", onAbort, { once: true });
    });
}
