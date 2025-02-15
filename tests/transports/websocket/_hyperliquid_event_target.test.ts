import { assert, assertEquals } from "jsr:@std/assert@^1.0.10";
import { HyperliquidEventTarget } from "../../../src/transports/websocket/_hyperliquid_event_target.ts";

Deno.test("HyperliquidEventTarget Tests", async (t) => {
    await t.step("HyperliquidMsg => dispatch event with msg.channel name", () => {
        const fakeWs = new EventTarget() as WebSocket;
        const eventTarget = new HyperliquidEventTarget(fakeWs);

        let receivedDetail: unknown = null;
        eventTarget.addEventListener("testChannel", (e) => {
            receivedDetail = e.detail;
        });

        const event = new MessageEvent("message", {
            data: JSON.stringify({ channel: "testChannel", data: { foo: "bar" } }),
        });
        fakeWs.dispatchEvent(event);

        assertEquals(receivedDetail, { foo: "bar" });
    });

    await t.step("isExplorerBlockMsg => dispatch event '_explorerBlock'", () => {
        const fakeWs = new EventTarget() as WebSocket;
        const eventTarget = new HyperliquidEventTarget(fakeWs);

        let blockDetails: unknown = null;
        eventTarget.addEventListener("_explorerBlock", (e) => {
            blockDetails = e.detail;
        });

        const event = new MessageEvent("message", {
            data: JSON.stringify([
                {
                    height: 123,
                    blockTime: 1678900000,
                    hash: "0x1234",
                    proposer: "0x1234",
                    numTxs: 42,
                },
            ]),
        });
        fakeWs.dispatchEvent(event);

        assert(Array.isArray(blockDetails), "Should be an array of block details");
        const firstBlock = blockDetails[0];
        assertEquals(firstBlock.height, 123);
        assertEquals(firstBlock.numTxs, 42);
    });

    await t.step("isExplorerTxsMsg => dispatch event '_explorerTxs'", () => {
        const fakeWs = new EventTarget() as WebSocket;
        const eventTarget = new HyperliquidEventTarget(fakeWs);

        let txDetails: unknown = null;
        eventTarget.addEventListener("_explorerTxs", (e) => {
            txDetails = e.detail;
        });

        const event = new MessageEvent("message", {
            data: JSON.stringify([
                {
                    action: { someField: 1 },
                    block: 234,
                    error: null,
                    hash: "0x1234",
                    time: 1678900001,
                    user: "0x1234",
                },
            ]),
        });
        fakeWs.dispatchEvent(event);

        assert(Array.isArray(txDetails), "Should be an array of transaction details");
        const firstTx = txDetails[0];
        assertEquals(firstTx.block, 234);
        assertEquals(firstTx.user, "0x1234");
    });

    await t.step("Invalid JSON => no event dispatched, no crash", () => {
        const fakeWs = new EventTarget() as WebSocket;
        const eventTarget = new HyperliquidEventTarget(fakeWs);

        let eventTriggered = false;
        eventTarget.addEventListener("anything", () => {
            eventTriggered = true;
        });

        const event = new MessageEvent("message", { data: "{ invalid json ... " });
        fakeWs.dispatchEvent(event);

        assertEquals(eventTriggered, false);
    });

    await t.step("Unrecognized message shape => no event dispatched", () => {
        const fakeWs = new EventTarget() as WebSocket;
        const eventTarget = new HyperliquidEventTarget(fakeWs);

        let triggered = false;
        eventTarget.addEventListener("someChannel", () => {
            triggered = true;
        });

        const event = new MessageEvent("message", { data: JSON.stringify({ foo: "bar" }) });
        fakeWs.dispatchEvent(event);

        assertEquals(triggered, false);
    });
});
