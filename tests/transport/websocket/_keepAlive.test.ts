// deno-lint-ignore-file no-import-prefix

/**
 * Tests for the WebSocket keep-alive watchdog: the ping cadence, the pong
 * deadline, and the watchdog teardown on disconnect.
 * @module
 */

import { assertEquals } from "jsr:@std/assert@1";
import { FakeTime } from "jsr:@std/testing@1/time";
import { ReconnectingWebSocket } from "@nktkas/rews";
import { WebSocketKeepAlive, type WebSocketKeepAliveOptions } from "../../../src/transport/websocket/_keepAlive.ts";
import { HyperliquidEventTarget } from "../../../src/transport/websocket/_events.ts";
import { getLastSent, MockWebSocket } from "./_mock.ts";

/** Creates a keep-alive watchdog over a mock socket. */
function createKeepAlive(options?: WebSocketKeepAliveOptions): { socket: MockWebSocket } {
  const socket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
  const hlEvents = new HyperliquidEventTarget(socket);
  new WebSocketKeepAlive(socket, hlEvents, options);
  return { socket };
}

Deno.test("WebSocketKeepAlive", async (t) => {
  await t.step("reconnects when a ping stays unanswered", () => {
    using time = new FakeTime();
    const { socket } = createKeepAlive();

    socket.open();
    time.tick(30_000);
    assertEquals(getLastSent(socket).method, "ping");

    time.tick(10_000);
    assertEquals(socket.reconnectCalls, 1);
  });

  await t.step("a pong in time keeps the connection", () => {
    using time = new FakeTime();
    const { socket } = createKeepAlive();

    socket.open();
    time.tick(30_000);
    socket.mockMessage({ channel: "pong" });

    time.tick(10_000);
    assertEquals(socket.reconnectCalls, 0);
  });

  await t.step("disconnect clears the watchdog", () => {
    using time = new FakeTime();
    const { socket } = createKeepAlive();

    socket.open();
    time.tick(30_000);
    socket.disconnect();

    const sentBeforeTick = socket.sentMessages.length;
    time.tick(60_000);
    assertEquals(socket.reconnectCalls, 0);
    assertEquals(socket.sentMessages.length, sentBeforeTick);
  });

  await t.step("honors custom interval and timeout", () => {
    using time = new FakeTime();
    const { socket } = createKeepAlive({ interval: 5_000, timeout: 1_000 });

    socket.open();
    time.tick(5_000);
    assertEquals(getLastSent(socket).method, "ping");

    time.tick(1_000);
    assertEquals(socket.reconnectCalls, 1);
  });
});
