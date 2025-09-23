// deno-lint-ignore-file no-explicit-any
import { TransportError } from "../base.ts";
import { AbortSignal_ } from "../_polyfills.ts";

/** Configuration options for the `ReconnectingWebSocket`. */
export interface ReconnectingWebSocketOptions {
  /**
   * Custom WebSocket constructor.
   * @defaultValue The global `WebSocket` constructor.
   */
  WebSocket?: new (url: string | URL, protocols?: string | string[]) => WebSocket;
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
   * Delay before reconnection in ms.
   * May be a number or a function that returns a number.
   * @param attempt - The current attempt number.
   * @defaultValue `(attempt) => Math.min(~~(1 << attempt) * 150, 10_000)` - Exponential backoff (max 10s)
   */
  reconnectionDelay?: number | ((attempt: number) => number);
}

type WebSocketSendData = string | ArrayBufferLike | Blob | ArrayBufferView;

/** Error thrown when reconnection problems occur. */
export class ReconnectingWebSocketError extends TransportError {
  constructor(
    public code:
      | "RECONNECTION_LIMIT"
      | "TERMINATED_BY_USER"
      | "UNKNOWN_ERROR",
    cause?: unknown,
  ) {
    super(`Error when reconnecting WebSocket: ${code}`);
    this.name = "ReconnectingWebSocketError";
    this.cause = cause;
  }
}

/**
 * A WebSocket that automatically reconnects and restores event listeners after disconnection.
 * Fully compatible with standard WebSocket API.
 *
 * Additions:
 * - `reconnectOptions` property: The options used to configure the reconnection behavior.
 * - `terminateSignal` property: An `AbortSignal` that is aborted when the instance is permanently closed.
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
  protected _messageBuffer: { data: WebSocketSendData; signal?: AbortSignal }[] = [];
  protected _abortController = new AbortController();

  reconnectOptions: Required<ReconnectingWebSocketOptions>;
  readonly terminateSignal = this._abortController.signal;

  constructor(url: string | URL, options?: ReconnectingWebSocketOptions);
  constructor(url: string | URL, protocols?: string | string[], options?: ReconnectingWebSocketOptions);
  constructor(
    url: string | URL,
    protocolsOrOptions?: (string | string[]) | ReconnectingWebSocketOptions,
    maybeOptions?: ReconnectingWebSocketOptions,
  ) {
    const protocols = typeof protocolsOrOptions === "string" || Array.isArray(protocolsOrOptions)
      ? protocolsOrOptions
      : undefined;
    const options = typeof protocolsOrOptions === "object" && !Array.isArray(protocolsOrOptions)
      ? protocolsOrOptions
      : maybeOptions;

    if (!globalThis.WebSocket && !options?.WebSocket) {
      throw new Error(
        "No WebSocket implementation found. Please provide a custom WebSocket constructor in the options.",
      );
    }

    this.reconnectOptions = {
      WebSocket: options?.WebSocket ?? WebSocket,
      maxRetries: options?.maxRetries ?? 3,
      connectionTimeout: options?.connectionTimeout === undefined ? 10_000 : options.connectionTimeout,
      reconnectionDelay: options?.reconnectionDelay ?? ((n) => Math.min(~~(1 << n) * 150, 10_000)),
    };

    this._socket = this._createSocket(url, protocols);
    this._protocols = protocols;

    this._initInternalListeners();
  }

  protected _createSocket(url: string | URL, protocols?: string | string[]): WebSocket {
    const socket = new this.reconnectOptions.WebSocket(url, protocols);
    if (this.reconnectOptions.connectionTimeout === null) return socket;

    const handleOpen = () => {
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("error", handleError);
      signal.removeEventListener("abort", handleAbort);
    };
    const handleClose = () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("error", handleError);
      signal.removeEventListener("abort", handleAbort);
    };
    const handleError = () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("close", handleClose);
      signal.removeEventListener("abort", handleAbort);
    };
    const handleAbort = () => {
      socket.close(3008, "Timeout"); // https://www.iana.org/assignments/websocket/websocket.xml#close-code-number
    };

    const signal = AbortSignal_.timeout(this.reconnectOptions.connectionTimeout);

    socket.addEventListener("open", handleOpen, { once: true, signal });
    socket.addEventListener("close", handleClose, { once: true, signal });
    socket.addEventListener("error", handleError, { once: true, signal });
    signal.addEventListener("abort", handleAbort, { once: true });

    return socket;
  }

  protected _cleanup(code: ConstructorParameters<typeof ReconnectingWebSocketError>[0], cause?: unknown) {
    const error = new ReconnectingWebSocketError(code, cause);
    this._abortController.abort(error);
    this._listeners = [];
    this._socket.close();
  }

  /** Initializes the internal event listeners for the socket. */
  protected _initInternalListeners() {
    const handleClose = () => {
      this._socket.removeEventListener("error", handleError);
      this._close();
    };
    const handleError = () => {
      this._socket.removeEventListener("close", handleClose);
      this._close();
    };
    this._socket.addEventListener("open", this._open, { once: true });
    this._socket.addEventListener("close", handleClose, { once: true });
    this._socket.addEventListener("error", handleError, { once: true });
  }
  protected _open: () => void = () => {
    // Reset the attempt counter
    this._attempt = 0;

    // Send all buffered messages
    while (this._messageBuffer.length > 0) {
      const item = this._messageBuffer.shift()!;
      if (item.signal?.aborted) continue;
      this._socket.send(item.data);
    }
  };
  protected _close = async () => {
    try {
      // If the instance is terminated, do not attempt to reconnect
      if (this._abortController.signal.aborted) return;

      // Check if reconnection should be attempted
      if (++this._attempt > this.reconnectOptions.maxRetries) {
        this._cleanup("RECONNECTION_LIMIT");
        return;
      }

      // Delay before reconnecting
      const delay = typeof this.reconnectOptions.reconnectionDelay === "number"
        ? this.reconnectOptions.reconnectionDelay
        : this.reconnectOptions.reconnectionDelay(this._attempt);
      await sleep(delay, this._abortController.signal);

      // Create a new WebSocket instance and re-apply event listeners
      const { onclose, onerror, onmessage, onopen } = this._socket; // preserve event handlers
      this._socket = this._createSocket(this._socket.url, this._protocols);

      this._initInternalListeners();
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
    if (permanently) this._cleanup("TERMINATED_BY_USER");
  }

  /**
   * @param signal - `AbortSignal` to cancel sending a message if it was in the buffer.
   * @note If the connection is not open, the data will be buffered and sent when the connection is established.
   */
  send(data: WebSocketSendData, signal?: AbortSignal): void {
    if (signal?.aborted) return;
    if (this._socket.readyState !== ReconnectingWebSocket.OPEN && !this._abortController.signal.aborted) {
      this._messageBuffer.push({ data, signal });
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
    if (this._abortController.signal.aborted) {
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
              const index = this._listeners.findIndex((e) => listenersMatch(e, { type, listener, options }));
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
  // `EventTarget` only compares `capture` in options, even if one is an object and the other is boolean
  const aCapture = Boolean(typeof a.options === "object" ? a.options.capture : a.options);
  const bCapture = Boolean(typeof b.options === "object" ? b.options.capture : b.options);
  return a.type === b.type && a.listener === b.listener && aCapture === bCapture;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
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
