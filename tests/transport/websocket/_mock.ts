/**
 * Shared in-memory stand-ins for the WebSocket transport tests: a mock
 * ReconnectingWebSocket, server frame factories, and a microtask drainer.
 * @module
 */

import { ReconnectingWebSocket, ReconnectingWebSocketError } from "@nktkas/rews";

/** In-memory ReconnectingWebSocket stand-in: records frames out, replays frames in. */
// @ts-expect-error: Mocking WebSocket for testing purposes
export class MockWebSocket extends EventTarget implements ReconnectingWebSocket {
  sentMessages: string[] = [];
  reconnectCalls = 0;
  readyState: 0 | 1 | 2 | 3 = ReconnectingWebSocket.OPEN;
  terminationController = new AbortController();
  terminationSignal = this.terminationController.signal;

  send(data: string): void {
    this.sentMessages.push(data);
  }

  open(): void {
    this.readyState = ReconnectingWebSocket.OPEN;
    this.dispatchEvent(new Event("open"));
  }

  /** Network drop: rews reports CONNECTING for any reconnection phase. */
  disconnect(): void {
    this.readyState = ReconnectingWebSocket.CONNECTING;
    this.dispatchEvent(new CloseEvent("close", { code: 1006 }));
  }

  /** Failed connection attempt: rews reports CONNECTING when `error` fires. */
  error(): void {
    this.readyState = ReconnectingWebSocket.CONNECTING;
    this.dispatchEvent(new Event("error"));
  }

  reconnect(): void {
    this.reconnectCalls++;
  }

  close(): void {
    this.terminate();
  }

  /** Permanent termination: abort with a `ReconnectingWebSocketError`, then the final close event. */
  terminate(cause?: unknown): void {
    if (this.terminationSignal.aborted) return;
    this.terminationController.abort(new ReconnectingWebSocketError("TERMINATED_BY_USER", cause));
    this.readyState = ReconnectingWebSocket.CLOSED;
    this.dispatchEvent(new CloseEvent("close", { code: 1006 }));
  }

  /** Replays a server frame to every listener. */
  mockMessage(data: unknown): void {
    this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(data) }));
  }
}

/** Server frame factories for the Hyperliquid protocol. */
export const RESPONSES = {
  info: (id: number, data: unknown) => ({
    channel: "post",
    data: { id, response: { type: "info", payload: { data } } },
  }),
  action: (id: number, payload: unknown) => ({
    channel: "post",
    data: { id, response: { type: "action", payload } },
  }),
  error: (id: number, message: string) => ({
    channel: "post",
    data: { id, response: { type: "error", payload: message } },
  }),
  subscriptionResponse: (method: string, subscription: unknown) => ({
    channel: "subscriptionResponse",
    data: { method, subscription },
  }),
  channelEvent: (channel: string, data: unknown) => ({
    channel,
    data,
  }),
  errorChannel: (message: string) => ({
    channel: "error",
    data: message,
  }),
} as const;

/** Gets the last sent message as parsed JSON. */
export function getLastSent(socket: MockWebSocket): Record<string, unknown> {
  return JSON.parse(socket.sentMessages[socket.sentMessages.length - 1]);
}

/** Waits until queued promise reactions have settled. */
export function drain(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}
