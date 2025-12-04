// deno-lint-ignore-file no-import-prefix
import { assertEquals, assertFalse } from "jsr:@std/assert@1";
import { HyperliquidEventTarget } from "../../../src/transport/websocket/_hyperliquidEventTarget.ts";

// ============================================================
// Helpers
// ============================================================

/** Creates a fake WebSocket for testing. */
function createFakeSocket(): WebSocket {
  return new EventTarget() as WebSocket;
}

/** Dispatches a message event to the socket. */
function dispatchMessage(socket: WebSocket, data: string): void {
  socket.dispatchEvent(new MessageEvent("message", { data }));
}

// ============================================================
// Test Data
// ============================================================

const MESSAGES = {
  hyperliquidEvent: {
    channel: "testChannel",
    data: { foo: "bar" },
  },
  explorerBlock: [{
    blockTime: 1678900000,
    hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    height: 123,
    numTxs: 42,
    proposer: "0x0000000000000000000000000000000000000000",
  }],
  explorerTxs: [{
    action: { type: "someAction" },
    block: 234,
    error: null,
    hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    time: 1678900001,
    user: "0x0000000000000000000000000000000000000000",
  }],
} as const;

// ============================================================
// Tests
// ============================================================

Deno.test("HyperliquidEventTarget", async (t) => {
  await t.step("message parsing", async (t) => {
    await t.step("HyperliquidEvent dispatches to channel name", () => {
      const socket = createFakeSocket();
      const target = new HyperliquidEventTarget(socket);

      let received: unknown;
      target.addEventListener(MESSAGES.hyperliquidEvent.channel, (e) => {
        received = e.detail;
      });

      dispatchMessage(socket, JSON.stringify(MESSAGES.hyperliquidEvent));
      assertEquals(received, MESSAGES.hyperliquidEvent.data);
    });

    await t.step("ExplorerBlock dispatches to _explorerBlock", () => {
      const socket = createFakeSocket();
      const target = new HyperliquidEventTarget(socket);

      let received: unknown;
      target.addEventListener("_explorerBlock", (e) => {
        received = e.detail;
      });

      dispatchMessage(socket, JSON.stringify(MESSAGES.explorerBlock));
      assertEquals(received, MESSAGES.explorerBlock);
    });

    await t.step("ExplorerTxs dispatches to _explorerTxs", () => {
      const socket = createFakeSocket();
      const target = new HyperliquidEventTarget(socket);

      let received: unknown;
      target.addEventListener("_explorerTxs", (e) => {
        received = e.detail;
      });

      dispatchMessage(socket, JSON.stringify(MESSAGES.explorerTxs));
      assertEquals(received, MESSAGES.explorerTxs);
    });
  });

  await t.step("error handling", async (t) => {
    await t.step("invalid JSON does not crash", () => {
      const socket = createFakeSocket();
      const target = new HyperliquidEventTarget(socket);

      let triggered = false;
      target.addEventListener("anything", () => {
        triggered = true;
      });

      dispatchMessage(socket, "{ invalid json ...");
      assertFalse(triggered);
    });

    await t.step("unrecognized message shape is ignored", () => {
      const socket = createFakeSocket();
      const target = new HyperliquidEventTarget(socket);

      let triggered = false;
      target.addEventListener("someChannel", () => {
        triggered = true;
      });

      dispatchMessage(socket, '{"foo":"bar"}');
      assertFalse(triggered);
    });
  });
});
