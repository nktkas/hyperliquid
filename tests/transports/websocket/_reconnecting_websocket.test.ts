// deno-lint-ignore-file no-import-prefix
import { assert, assertEquals, assertInstanceOf, assertIsError, assertNotEquals } from "jsr:@std/assert@1";
import {
  ReconnectingWebSocket,
  ReconnectingWebSocketError,
} from "../../../src/transport/websocket/_reconnecting_websocket.ts";

Deno.test("ReconnectingWebSocket", async (t) => {
  const server = Deno.serve(
    { port: 8080, onListen: () => {} },
    async (request) => {
      if (request.headers.get("upgrade") !== "websocket") {
        return new Response("Not a websocket", { status: 400 });
      }

      const url = new URL(request.url);
      const delay = url.searchParams.has("delay") ? parseInt(url.searchParams.get("delay") ?? "1000") : 1000;

      await new Promise((resolve) => setTimeout(resolve, delay));

      const protocolsHeader = request.headers.get("sec-websocket-protocol") ?? "";
      const requestedProtocols = protocolsHeader.split(",").map((p) => p.trim())[0] ?? "";

      const { socket, response } = Deno.upgradeWebSocket(request, { protocol: requestedProtocols });
      socket.addEventListener("message", (event) => {
        socket.send(event.data);
      });

      return response;
    },
  );

  await t.step("Basic WebSocket", async (t) => {
    await t.step("get url()", () => {
      const rws = new ReconnectingWebSocket("ws://localhost:8080/");

      assertEquals(rws.url, "ws://localhost:8080/");

      rws.close();
    });

    await t.step("get readyState()", () => {
      const rws = new ReconnectingWebSocket("ws://localhost:8080/");

      assertEquals(rws.readyState, WebSocket.CONNECTING);

      rws.close();
    });

    await t.step("get bufferedAmount()", () => {
      const rws = new ReconnectingWebSocket("ws://localhost:8080/");

      assertEquals(rws.bufferedAmount, 0);

      rws.close();
    });

    await t.step("get extensions()", () => {
      const rws = new ReconnectingWebSocket("ws://localhost:8080/");

      assertEquals(rws.extensions, "");

      rws.close();
    });

    await t.step("get protocol()", async () => {
      const rws = new ReconnectingWebSocket("ws://localhost:8080/", "superchat");
      await new Promise((resolve) => rws.addEventListener("open", resolve)); // Wait for the connection to open

      assertEquals(rws.protocol, "superchat");

      rws.close();
    });

    await t.step("binaryType", async (t) => {
      await t.step("get binaryType()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        assertEquals(rws.binaryType, "blob");

        rws.close();
      });
      await t.step("set binaryType()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        rws.binaryType = "arraybuffer";
        assertEquals(rws.binaryType, "arraybuffer");

        rws.close();
      });
    });

    await t.step("CONNECTING", async (t) => {
      await t.step("get CONNECTING()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        assertEquals(rws.CONNECTING, WebSocket.CONNECTING);

        rws.close();
      });
      await t.step("static CONNECTING", () => {
        assertEquals(ReconnectingWebSocket.CONNECTING, WebSocket.CONNECTING);
      });
    });
    await t.step("OPEN", async (t) => {
      await t.step("get OPEN()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        assertEquals(rws.OPEN, WebSocket.OPEN);

        rws.close();
      });
      await t.step("static OPEN", () => {
        assertEquals(ReconnectingWebSocket.OPEN, WebSocket.OPEN);
      });
    });
    await t.step("CLOSING", async (t) => {
      await t.step("get CLOSING()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        assertEquals(rws.CLOSING, WebSocket.CLOSING);

        rws.close();
      });
      await t.step("static CLOSING", () => {
        assertEquals(ReconnectingWebSocket.CLOSING, WebSocket.CLOSING);
      });
    });
    await t.step("CLOSED", async (t) => {
      await t.step("get CLOSED()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        assertEquals(rws.CLOSED, WebSocket.CLOSED);

        rws.close();
      });
      await t.step("static CLOSED", () => {
        assertEquals(ReconnectingWebSocket.CLOSED, WebSocket.CLOSED);
      });
    });

    await t.step("onclose", async (t) => {
      await t.step("get onclose()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        assertEquals(rws.onclose, null);

        rws.close();
      });
      await t.step("set onclose()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        const onclose = () => {};
        rws.onclose = onclose;

        assertEquals(rws.onclose, onclose);

        rws.close();
      });
    });
    await t.step("onerror", async (t) => {
      await t.step("get onerror()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        assertEquals(rws.onerror, null);

        rws.close();
      });
      await t.step("set onerror()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        const onerror = () => {};
        rws.onerror = onerror;

        assertEquals(rws.onerror, onerror);

        rws.close();
      });
    });
    await t.step("onmessage", async (t) => {
      await t.step("get onmessage()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        assertEquals(rws.onmessage, null);

        rws.close();
      });
      await t.step("set onmessage()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        const onmessage = () => {};
        rws.onmessage = onmessage;

        assertEquals(rws.onmessage, onmessage);

        rws.close();
      });
    });
    await t.step("onopen", async (t) => {
      await t.step("get onopen()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        assertEquals(rws.onopen, null);

        rws.close();
      });
      await t.step("set onopen()", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        const onopen = () => {};
        rws.onopen = onopen;

        assertEquals(rws.onopen, onopen);

        rws.close();
      });
    });

    await t.step("close()", () => {
      const rws = new ReconnectingWebSocket("ws://localhost:8080/");

      assertNotEquals(rws.readyState, WebSocket.CLOSED);

      rws.close();

      assertEquals(rws.readyState, WebSocket.CLOSING);
    });

    await t.step("send()", () => {
      const rws = new ReconnectingWebSocket("ws://localhost:8080/");

      const message = "Hello, World!";
      let received = "";
      rws.addEventListener("message", (e) => received = e.data);
      rws.dispatchEvent(new MessageEvent("message", { data: message }));
      assertEquals(received, message);

      rws.close();
    });

    await t.step("addEventListener()", async (t) => {
      await t.step("listener is fn", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        let called = false;
        rws.addEventListener("message", () => called = true);
        rws.dispatchEvent(new Event("message"));
        assert(called);

        rws.close();
      });
      await t.step("listener is an object", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        let called = false;
        rws.addEventListener("message", { handleEvent: () => called = true });
        rws.dispatchEvent(new Event("message"));
        assert(called);

        rws.close();
      });

      await t.step("Does not wrap listener when termination signal is aborted", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");
        rws.close();

        rws.addEventListener("message", () => {});
        // @ts-ignore - accessing private property for testing purposes
        const finalListenersCount = rws._listeners.length;
        assertEquals(finalListenersCount, 0);
      });
    });

    await t.step("removeEventListener()", async (t) => {
      await t.step("listener is fn", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        let called = false;
        const listener = () => called = true;
        rws.addEventListener("message", listener);
        rws.removeEventListener("message", listener);
        rws.dispatchEvent(new Event("message"));
        assert(!called);

        rws.close();
      });
      await t.step("listener is an object", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080/");

        let called = false;
        const listener = { handleEvent: () => called = true };
        rws.addEventListener("message", listener);
        rws.removeEventListener("message", listener);
        rws.dispatchEvent(new Event("message"));
        assert(!called);

        rws.close();
      });

      await t.step("Removes original listener when wrapped listener not found", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080");

        // First, terminate the connection to prevent wrapping
        rws.close();

        let called = false;
        const listener = () => called = true;

        // Add listener after termination (will not be wrapped)
        rws.addEventListener("message", listener);

        // @ts-ignore - accessing private property
        assertEquals(rws._listeners.length, 0, "No wrapped listeners should be stored");

        // Remove the listener - should fall back to removing original
        rws.removeEventListener("message", listener);

        // Verify it was removed by trying to dispatch event
        rws.dispatchEvent(new Event("message"));
        assert(!called, "Listener should have been removed");
      });
    });

    await t.step("dispatchEvent()", () => {
      const rws = new ReconnectingWebSocket("ws://localhost:8080/");

      let called = false;
      rws.addEventListener("open", () => called = true);
      rws.dispatchEvent(new Event("open"));
      assert(called);

      rws.close();
    });
  });

  await t.step("Reconnecting WebSocket", async (t) => {
    await t.step("protocols: Retains chosen protocol across reconnect", async () => {
      const rws = new ReconnectingWebSocket("ws://localhost:8080", "superchat");

      await new Promise<void>((resolve) => {
        rws.addEventListener("open", () => {
          assertEquals(rws.protocol, "superchat");
          resolve();
        }, { once: true });
      });

      rws.close(undefined, undefined, false); // Close without permanently aborting

      await new Promise<void>((resolve) => {
        rws.addEventListener("open", () => {
          assertEquals(rws.protocol, "superchat");
          resolve();
        }, { once: true });
      });

      rws.close();
    });

    await t.step("maxRetries: Respects maxRetries limit", async () => {
      const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", {
        maxRetries: 2,
        reconnectionDelay: 0,
      });

      let closeCount = 0;
      rws.addEventListener("close", () => closeCount++);

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations

      assertEquals(rws.readyState, WebSocket.CLOSED, "WebSocket should be closed");
      // Typically: 1st "close" after initial connect fails, then 2 more reconnect attempts => total 3 close events
      // so `closeCount - 1 = 2` means it tried 2 reconnect attempts.
      assertEquals(closeCount - 1, 2);

      rws.close();
    });

    await t.step("connectionTimeout:", async (t) => {
      await t.step("Connection timeout is disabled if set to 'connectionTimeout: null'", async () => {
        const defaultConnectionTimeout = new ReconnectingWebSocket("ws://example.com")
          .reconnectOptions.connectionTimeout!;
        const rws = new ReconnectingWebSocket(
          `ws://localhost:8080?delay=${defaultConnectionTimeout + 5000}`,
          { connectionTimeout: null },
        );

        await new Promise((resolve) => setTimeout(resolve, defaultConnectionTimeout + 2000)); // Wait longer than default timeout but less than server delay
        assertEquals(rws.readyState, WebSocket.CONNECTING);

        rws.close();
      });

      await t.step("Connection timeout if not opened in time", async () => {
        const rwsTimeout = new ReconnectingWebSocket("ws://localhost:8080", {
          maxRetries: 0,
          connectionTimeout: 10, // too short to connect
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
        assertEquals(rwsTimeout.readyState, WebSocket.CLOSED);

        rwsTimeout.close();
      });
    });

    await t.step("reconnectionDelay:", async (t) => {
      await t.step("Custom delay", async () => {
        const customDelay = 500;
        const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", {
          maxRetries: 3,
          reconnectionDelay: customDelay,
        });

        const closeTimes: number[] = [];
        rws.addEventListener("close", () => closeTimes.push(performance.now()));

        await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay for network operations
        rws.close();

        for (let i = 1; i < closeTimes.length; i++) {
          const diff = closeTimes[i] - closeTimes[i - 1];
          assert(
            diff >= customDelay,
            `Close event #${i} waited less than "customDelay". Expected at least ${customDelay}ms, got ${diff}ms`,
          );
        }
      });

      await t.step("Custom delay via function", async () => {
        const delays = [200, 500, 700];
        const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", {
          maxRetries: delays.length,
          reconnectionDelay: (attempt) => delays[attempt] || delays[delays.length - 1],
        });

        const closeTimes: number[] = [];
        rws.addEventListener("close", () => closeTimes.push(performance.now()));

        await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay for network operations
        rws.close();

        for (let i = 1; i < closeTimes.length; i++) {
          const diff = closeTimes[i] - closeTimes[i - 1];
          const expected = delays[i - 1] || delays[delays.length - 1];
          assert(
            diff >= expected,
            `Close event #${i} waited less than the function-supplied delay. Expected at least ${expected}ms, got ${diff}ms`,
          );
        }
      });
    });

    await t.step("messageBuffer: Buffers messages when not open and replays on reconnect", async () => {
      const rws = new ReconnectingWebSocket("ws://localhost:8080", {
        maxRetries: 1,
        reconnectionDelay: 0,
      });

      await new Promise((resolve) => rws.addEventListener("open", resolve)); // Wait for the connection to open

      rws.close(undefined, undefined, false); // Close without permanently aborting
      rws.send("HelloAfterClose1");
      rws.send("HelloAfterClose2");

      // @ts-ignore - accessing private property
      assertEquals(rws._messageBuffer.length, 2);

      const receivedMessages: string[] = [];
      rws.addEventListener("message", (ev) => receivedMessages.push(ev.data));

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations

      assertEquals(receivedMessages.length, 2);
      assert(receivedMessages.includes("HelloAfterClose1"));
      assert(receivedMessages.includes("HelloAfterClose2"));

      // @ts-ignore - accessing private property
      assertEquals(rws._messageBuffer.length, 0);

      rws.close();
    });

    await t.step("close():", async (t) => {
      await t.step("close(permanently = true) prevents reconnection", async () => {
        const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", {
          maxRetries: 3,
          reconnectionDelay: 0,
        });

        let closeEvents = 0;
        rws.addEventListener("close", () => closeEvents++);

        rws.close();

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for network operations

        assertEquals(closeEvents, 1, "should have only 1 close event");
        assertEquals(rws.readyState, WebSocket.CLOSED, "socket should remain closed");
        assert(rws.terminateSignal.aborted, "should be permanently closed");
      });

      await t.step("close(permanently = false) closes but does not stop reconnection logic", async () => {
        const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", {
          maxRetries: 3,
          reconnectionDelay: 0,
        });

        let closeEvents = 0;
        rws.addEventListener("close", () => closeEvents++);

        rws.close(undefined, undefined, false); // Close without permanently aborting

        await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay for network operations

        assertEquals(closeEvents, 4, "should have multiple close events for reconnection");
        assertEquals(rws.readyState, WebSocket.CLOSED, "socket should remain closed");
        assert(rws.terminateSignal.aborted, "should be permanently closed");

        rws.close();
      });
    });

    await t.step("send():", async (t) => {
      await t.step("Check 'signal' logic", async () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080", {
          maxRetries: 1,
          reconnectionDelay: 0,
        });

        // Create abort controller and immediately abort it (should not be in buffer)
        const abortController1 = new AbortController();
        abortController1.abort();
        rws.send("ShouldNotBeSent1", abortController1.signal);

        // Send normal message
        rws.send("ShouldBeSent");

        // Create another abort controller, send message, then abort
        const abortController2 = new AbortController();
        rws.send("ShouldNotBeSent2", abortController2.signal);
        abortController2.abort();

        // @ts-ignore - accessing private property
        assertEquals(rws._messageBuffer.length, 2);

        const receivedMessages: string[] = [];
        rws.addEventListener("message", (ev) => receivedMessages.push(ev.data));

        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for reconnection

        // Only the non-aborted message should be received
        assertEquals(receivedMessages.length, 1);
        assertEquals(receivedMessages[0], "ShouldBeSent");

        rws.close();
      });
    });

    await t.step("Event listeners:", async (t) => {
      await t.step("Re-registers event listeners after reconnection", async () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080", {
          maxRetries: 1,
          reconnectionDelay: 0,
        });

        let openCount = 0;
        rws.addEventListener("open", () => openCount++);
        let messageCount = 0;
        rws.addEventListener("message", () => messageCount++);

        await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations
        assertEquals(openCount, 1);

        rws.close(undefined, undefined, false); // Close without permanently aborting

        await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations
        assertEquals(openCount, 2);

        rws.send("TestingReRegistration");

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for network operations
        assertEquals(messageCount, 1);

        rws.close();
      });

      await t.step("Executes { once: true } listener only 1 time and does not reconnect", async () => {
        const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", {
          maxRetries: 3,
          reconnectionDelay: 0,
        });

        let closeOnceCalls = 0;
        const onceClose = () => closeOnceCalls++;
        rws.addEventListener("close", onceClose, { once: true }); // `maxRetries` is 3, but should only be called once

        await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay for network operations
        assertEquals(closeOnceCalls, 1);

        rws.close();
      });

      await t.step("Adding identical listeners does not increase eventListeners array", () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080");
        const handler = () => {};

        // @ts-ignore - internal property
        assertEquals(rws._listeners.length, 0, "Initially no event listeners stored");

        rws.addEventListener("message", handler);
        rws.addEventListener("message", handler);
        rws.addEventListener("message", handler);

        // @ts-ignore - internal property
        assertEquals(rws._listeners.length, 1, "should still only have 1 event listener after duplicates");

        // Remove it once, array should be empty
        rws.removeEventListener("message", handler);

        // @ts-ignore - internal property
        assertEquals(rws._listeners.length, 0, "should have no listeners after removal");

        rws.close();
      });

      await t.step("Reattaches on* properties after reconnection", async () => {
        const rws = new ReconnectingWebSocket("ws://localhost:8080");

        let onopenCalled = 0;
        let oncloseCalled = 0;
        let onerrorCalled = 0;
        let onmessageCalled = 0;
        const onopen = () => onopenCalled++;
        const onclose = () => oncloseCalled++;
        const onerror = () => onerrorCalled++;
        const onmessage = () => onmessageCalled++;
        rws.onopen = onopen;
        rws.onclose = onclose;
        rws.onerror = onerror;
        rws.onmessage = onmessage;

        await new Promise((resolve) => rws.addEventListener("open", resolve, { once: true })); // Wait for the connection to open
        rws.close(undefined, undefined, false); // Close without permanently aborting
        await new Promise((resolve) => rws.addEventListener("open", resolve, { once: true })); // Wait for the connection to reopen

        assertEquals(rws.onopen, onopen);
        assertEquals(rws.onclose, onclose);
        assertEquals(rws.onerror, onerror);
        assertEquals(rws.onmessage, onmessage);

        rws.close();
      });
    });

    await t.step("terminateSignal:", async (t) => {
      await t.step("'terminateSignal' indicates permanent closure and reason for termination", async () => {
        // Check maxRetries reached reason
        const rws1 = new ReconnectingWebSocket("ws://invalid4567t7281.com", {
          maxRetries: 0,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for network operations

        assertIsError(
          rws1.terminateSignal.reason,
          ReconnectingWebSocketError,
          "Error when reconnecting WebSocket: RECONNECTION_LIMIT",
        );

        rws1.close();

        // Check user-initiated close reason
        const rws2 = new ReconnectingWebSocket("ws://localhost:8080");
        rws2.close();

        assertIsError(
          rws2.terminateSignal.reason,
          ReconnectingWebSocketError,
          "Error when reconnecting WebSocket: TERMINATED_BY_USER",
        );
      });

      await t.step("Check abort signal in 'sleep' on reconnect (fast exit from sleep)", async () => {
        const reconnectionDelay = 10_000;
        const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
          maxRetries: 2,
          reconnectionDelay,
        });

        await new Promise((resolve) => setTimeout(resolve, reconnectionDelay / 3)); // Wait until in sleep

        rws.close(); // Close connection during sleep from `reconnectionDelay`

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for network operations

        assertInstanceOf(
          rws.terminateSignal.reason,
          ReconnectingWebSocketError,
          "Error when reconnecting WebSocket: TERMINATED_BY_USER",
        );
      });
    });
  });

  await server.shutdown();
});
