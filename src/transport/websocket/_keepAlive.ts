/**
 * Keep-alive watchdog for the WebSocket connection: pings the server on an
 * interval and reconnects when a ping stays unanswered.
 *
 * @module
 */

import type { ReconnectingWebSocket } from "@nktkas/rews";
import type { HyperliquidEventTarget } from "./_events.ts";

/** Configuration options for the keep-alive watchdog. */
export interface WebSocketKeepAliveOptions {
  /**
   * Interval between pings in ms.
   *
   * The server closes a connection that has been silent for ~60 s, so pings must come more often than that.
   *
   * Default: `30_000`
   */
  interval?: number;
  /**
   * Time to wait for a pong before forcing a reconnect, in ms.
   *
   * Default: `10_000`
   */
  timeout?: number;
}

/** Pings the server while the connection is open and reconnects when a ping stays unanswered. */
export class WebSocketKeepAlive {
  private readonly _socket: ReconnectingWebSocket;
  private readonly _interval: number;
  private readonly _timeout: number;
  private _pingInterval: ReturnType<typeof setInterval> | undefined;
  private _pongTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(socket: ReconnectingWebSocket, hlEvents: HyperliquidEventTarget, options?: WebSocketKeepAliveOptions) {
    this._socket = socket;
    this._interval = options?.interval ?? 30_000;
    this._timeout = options?.timeout ?? 10_000;

    hlEvents.addEventListener("pong", () => this._disarm());
    socket.addEventListener("open", () => this._start());
    socket.addEventListener("close", () => this._stop());
    socket.addEventListener("error", () => this._stop());
  }

  private _start(): void {
    if (this._pingInterval) return;
    this._pingInterval = setInterval(() => {
      this._socket.send('{"method":"ping"}');
      // A half-open connection never answers: reconnect once a ping stays unanswered.
      this._pongTimeout ??= setTimeout(() => this._socket.reconnect(), this._timeout);
    }, this._interval);
  }

  private _stop(): void {
    clearInterval(this._pingInterval);
    this._pingInterval = undefined;
    this._disarm();
  }

  private _disarm(): void {
    clearTimeout(this._pongTimeout);
    this._pongTimeout = undefined;
  }
}
