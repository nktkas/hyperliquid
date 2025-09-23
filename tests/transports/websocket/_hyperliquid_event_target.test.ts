// deno-lint-ignore-file no-import-prefix
import { assert, assertEquals, assertFalse } from "jsr:@std/assert@1";
import { HyperliquidEventTarget } from "../../../src/transport/websocket/_hyperliquid_event_target.ts";

Deno.test("HyperliquidEventTarget", async (t) => {
  await t.step("HyperliquidMsg => dispatch event with msg.channel name", () => {
    const fakeWs = new EventTarget() as WebSocket;
    const eventTarget = new HyperliquidEventTarget(fakeWs);

    let receivedMsg: unknown;
    eventTarget.addEventListener("test", (e) => {
      const detail = (e as CustomEvent).detail;
      receivedMsg = detail;
    });

    const event = new MessageEvent("message", { data: '{"channel":"test","data":{"foo":"bar"}}' });
    fakeWs.dispatchEvent(event);

    assertEquals(receivedMsg, { foo: "bar" });
  });

  await t.step("isExplorerBlockMsg => dispatch event '_explorerBlock'", () => {
    const fakeWs = new EventTarget() as WebSocket;
    const eventTarget = new HyperliquidEventTarget(fakeWs);

    let receivedMsg: unknown;
    eventTarget.addEventListener("_explorerBlock", (e) => {
      const detail = (e as CustomEvent).detail;
      receivedMsg = detail;
    });

    const event = new MessageEvent("message", {
      data: JSON.stringify([
        {
          blockTime: 1678900000,
          hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          height: 123,
          numTxs: 42,
          proposer: "0x0000000000000000000000000000000000000000",
        },
      ]),
    });
    fakeWs.dispatchEvent(event);

    assert(Array.isArray(receivedMsg), "Should be an array of block details");
    const firstBlock = receivedMsg[0];
    assertEquals(firstBlock.height, 123);
    assertEquals(firstBlock.numTxs, 42);
  });

  await t.step("isExplorerTxsMsg => dispatch event '_explorerTxs'", () => {
    const fakeWs = new EventTarget() as WebSocket;
    const eventTarget = new HyperliquidEventTarget(fakeWs);

    let receivedMsg: unknown;
    eventTarget.addEventListener("_explorerTxs", (e) => {
      const detail = (e as CustomEvent).detail;
      receivedMsg = detail;
    });

    const event = new MessageEvent("message", {
      data: JSON.stringify([
        {
          action: { type: "someAction" },
          block: 234,
          error: null,
          hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          time: 1678900001,
          user: "0x0000000000000000000000000000000000000000",
        },
      ]),
    });
    fakeWs.dispatchEvent(event);

    assert(Array.isArray(receivedMsg), "Should be an array of transaction details");
    const firstTx = receivedMsg[0];
    assertEquals(firstTx.block, 234);
    assertEquals(firstTx.user, "0x0000000000000000000000000000000000000000");
  });

  await t.step("Invalid JSON => no event dispatched, no crash", () => {
    const fakeWs = new EventTarget() as WebSocket;
    const eventTarget = new HyperliquidEventTarget(fakeWs);

    let triggered = false;
    eventTarget.addEventListener("anything", () => {
      triggered = true;
    });

    const event = new MessageEvent("message", { data: "{ invalid json ... " });
    fakeWs.dispatchEvent(event);

    assertFalse(triggered);
  });

  await t.step("Unrecognized message shape => no event dispatched", () => {
    const fakeWs = new EventTarget() as WebSocket;
    const eventTarget = new HyperliquidEventTarget(fakeWs);

    let triggered = false;
    eventTarget.addEventListener("someChannel", () => {
      triggered = true;
    });

    const event = new MessageEvent("message", { data: '{"foo":"bar"}' });
    fakeWs.dispatchEvent(event);

    assertFalse(triggered);
  });
});
