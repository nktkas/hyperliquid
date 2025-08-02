import { assertEquals, assertRejects, assertThrows } from "jsr:@std/assert";
import { 
    createCompatibleWebSocket, 
    createCompatibleWebSocketSync, 
    WebSocketCompatibilityError,
    getWebSocketEnvironmentInfo,
    requiresWsPackage
} from "../../../src/transports/websocket/_websocket_factory.ts";

// Mock process.versions for testing different Node.js versions
function mockNodeVersion(version: string | null) {
    const originalProcess = (globalThis as any).process;
    
    if (version === null) {
        // Mock non-Node environment
        delete (globalThis as any).process;
    } else {
        (globalThis as any).process = {
            versions: { node: version }
        };
    }
    
    return () => {
        if (originalProcess) {
            (globalThis as any).process = originalProcess;
        } else {
            delete (globalThis as any).process;
        }
    };
}

Deno.test("WebSocket Factory - Environment Detection", async (t) => {
    await t.step("should detect non-Node environment", () => {
        const restore = mockNodeVersion(null);
        try {
            const info = getWebSocketEnvironmentInfo();
            assertEquals(info.isNode, false);
            assertEquals(info.nodeMajorVersion, null);
            assertEquals(info.hasReliableNativeWebSocket, true);
            assertEquals(info.requiresWsPackage, false);
        } finally {
            restore();
        }
    });

    await t.step("should detect Node.js v20", () => {
        const restore = mockNodeVersion("20.15.0");
        try {
            const info = getWebSocketEnvironmentInfo();
            assertEquals(info.isNode, true);
            assertEquals(info.nodeMajorVersion, 20);
            assertEquals(info.hasReliableNativeWebSocket, false);
            assertEquals(info.requiresWsPackage, true);
        } finally {
            restore();
        }
    });

    await t.step("should detect Node.js v22", () => {
        const restore = mockNodeVersion("22.4.0");
        try {
            const info = getWebSocketEnvironmentInfo();
            assertEquals(info.isNode, true);
            assertEquals(info.nodeMajorVersion, 22);
            assertEquals(info.hasReliableNativeWebSocket, false);
            assertEquals(info.requiresWsPackage, true);
        } finally {
            restore();
        }
    });

    await t.step("should detect Node.js v24", () => {
        const restore = mockNodeVersion("24.0.0");
        try {
            const info = getWebSocketEnvironmentInfo();
            assertEquals(info.isNode, true);
            assertEquals(info.nodeMajorVersion, 24);
            assertEquals(info.hasReliableNativeWebSocket, true);
            assertEquals(info.requiresWsPackage, false);
        } finally {
            restore();
        }
    });

    await t.step("should detect Node.js v25", () => {
        const restore = mockNodeVersion("25.1.0");
        try {
            const info = getWebSocketEnvironmentInfo();
            assertEquals(info.isNode, true);
            assertEquals(info.nodeMajorVersion, 25);
            assertEquals(info.hasReliableNativeWebSocket, true);
            assertEquals(info.requiresWsPackage, false);
        } finally {
            restore();
        }
    });
});

Deno.test("WebSocket Factory - requiresWsPackage utility", async (t) => {
    await t.step("should return false for non-Node environment", () => {
        const restore = mockNodeVersion(null);
        try {
            assertEquals(requiresWsPackage(), false);
        } finally {
            restore();
        }
    });

    await t.step("should return true for Node.js < 24", () => {
        const restore = mockNodeVersion("20.15.0");
        try {
            assertEquals(requiresWsPackage(), true);
        } finally {
            restore();
        }
    });

    await t.step("should return false for Node.js >= 24", () => {
        const restore = mockNodeVersion("24.0.0");
        try {
            assertEquals(requiresWsPackage(), false);
        } finally {
            restore();
        }
    });
});

Deno.test("WebSocket Factory - Sync WebSocket Creation", async (t) => {
    await t.step("should create native WebSocket in non-Node environment", () => {
        const restore = mockNodeVersion(null);
        try {
            // This should work in Deno environment
            const ws = createCompatibleWebSocketSync("wss://echo.websocket.org");
            assertEquals(ws.constructor.name, "WebSocket");
            ws.close();
        } finally {
            restore();
        }
    });

    await t.step("should create native WebSocket for Node.js >= 24", () => {
        const restore = mockNodeVersion("24.0.0");
        try {
            // Mock native WebSocket for testing
            const originalWebSocket = globalThis.WebSocket;
            const mockWebSocket = class extends EventTarget {
                constructor(public url: string | URL, public protocols?: string | string[]) {
                    super();
                }
                close() {}
                send() {}
                readonly readyState = 1;
                readonly bufferedAmount = 0;
                readonly extensions = "";
                readonly protocol = "";
                binaryType: BinaryType = "blob";
                onopen: ((ev: Event) => any) | null = null;
                onclose: ((ev: CloseEvent) => any) | null = null;
                onerror: ((ev: Event) => any) | null = null;
                onmessage: ((ev: MessageEvent) => any) | null = null;
                static readonly CONNECTING = 0;
                static readonly OPEN = 1;
                static readonly CLOSING = 2;
                static readonly CLOSED = 3;
                readonly CONNECTING = 0;
                readonly OPEN = 1;
                readonly CLOSING = 2;
                readonly CLOSED = 3;
            };
            
            (globalThis as any).WebSocket = mockWebSocket;
            
            try {
                const ws = createCompatibleWebSocketSync("wss://echo.websocket.org");
                assertEquals(ws.constructor.name, "mockWebSocket");
            } finally {
                (globalThis as any).WebSocket = originalWebSocket;
            }
        } finally {
            restore();
        }
    });

    await t.step("should throw error for Node.js < 24 without ws package", () => {
        const restore = mockNodeVersion("20.15.0");
        try {
            assertThrows(
                () => createCompatibleWebSocketSync("wss://echo.websocket.org"),
                WebSocketCompatibilityError,
                "requires the 'ws' package"
            );
        } finally {
            restore();
        }
    });
});

Deno.test("WebSocket Factory - Async WebSocket Creation", async (t) => {
    await t.step("should create native WebSocket in non-Node environment", async () => {
        const restore = mockNodeVersion(null);
        try {
            const ws = await createCompatibleWebSocket("wss://echo.websocket.org");
            assertEquals(ws.constructor.name, "WebSocket");
            ws.close();
        } finally {
            restore();
        }
    });

    await t.step("should create native WebSocket for Node.js >= 24", async () => {
        const restore = mockNodeVersion("24.0.0");
        try {
            // Mock native WebSocket for testing
            const originalWebSocket = globalThis.WebSocket;
            const mockWebSocket = class extends EventTarget {
                constructor(public url: string | URL, public protocols?: string | string[]) {
                    super();
                }
                close() {}
                send() {}
                readonly readyState = 1;
                readonly bufferedAmount = 0;
                readonly extensions = "";
                readonly protocol = "";
                binaryType: BinaryType = "blob";
                onopen: ((ev: Event) => any) | null = null;
                onclose: ((ev: CloseEvent) => any) | null = null;
                onerror: ((ev: Event) => any) | null = null;
                onmessage: ((ev: MessageEvent) => any) | null = null;
                static readonly CONNECTING = 0;
                static readonly OPEN = 1;
                static readonly CLOSING = 2;
                static readonly CLOSED = 3;
                readonly CONNECTING = 0;
                readonly OPEN = 1;
                readonly CLOSING = 2;
                readonly CLOSED = 3;
            };
            
            (globalThis as any).WebSocket = mockWebSocket;
            
            try {
                const ws = await createCompatibleWebSocket("wss://echo.websocket.org");
                assertEquals(ws.constructor.name, "mockWebSocket");
            } finally {
                (globalThis as any).WebSocket = originalWebSocket;
            }
        } finally {
            restore();
        }
    });

    await t.step("should reject for Node.js < 24 without ws package", async () => {
        const restore = mockNodeVersion("20.15.0");
        try {
            await assertRejects(
                () => createCompatibleWebSocket("wss://echo.websocket.org"),
                WebSocketCompatibilityError,
                "requires the 'ws' package"
            );
        } finally {
            restore();
        }
    });
});

Deno.test("WebSocket Factory - Error Handling", async (t) => {
    await t.step("should handle invalid WebSocket URL gracefully", () => {
        const restore = mockNodeVersion(null);
        try {
            assertThrows(
                () => createCompatibleWebSocketSync("invalid-url"),
                WebSocketCompatibilityError,
                "Failed to create native WebSocket"
            );
        } finally {
            restore();
        }
    });

    await t.step("should handle async WebSocket creation errors", async () => {
        const restore = mockNodeVersion(null);
        try {
            await assertRejects(
                () => createCompatibleWebSocket("invalid-url"),
                WebSocketCompatibilityError,
                "Failed to create native WebSocket"
            );
        } finally {
            restore();
        }
    });
});

Deno.test("WebSocket Factory - URL and Protocol Support", async (t) => {
    await t.step("should handle string URLs", () => {
        const restore = mockNodeVersion(null);
        try {
            const ws = createCompatibleWebSocketSync("wss://echo.websocket.org");
            assertEquals(typeof ws.url, "string");
            ws.close();
        } finally {
            restore();
        }
    });

    await t.step("should handle URL objects", () => {
        const restore = mockNodeVersion(null);
        try {
            const url = new URL("wss://echo.websocket.org");
            const ws = createCompatibleWebSocketSync(url);
            assertEquals(typeof ws.url, "string");
            ws.close();
        } finally {
            restore();
        }
    });

    await t.step("should handle protocols parameter", () => {
        const restore = mockNodeVersion(null);
        try {
            const ws = createCompatibleWebSocketSync("wss://echo.websocket.org", ["protocol1", "protocol2"]);
            assertEquals(typeof ws.url, "string");
            ws.close();
        } finally {
            restore();
        }
    });
});

// Integration test with ReconnectingWebSocket (if available)
Deno.test("WebSocket Factory - Integration", async (t) => {
    await t.step("should work with ReconnectingWebSocket", async () => {
        // This test verifies that our factory integrates properly with the reconnecting WebSocket
        const { ReconnectingWebSocket } = await import("../../../src/transports/websocket/_reconnecting_websocket.ts");
        
        const restore = mockNodeVersion(null); // Use native WebSocket in Deno
        try {
            // Create a ReconnectingWebSocket which will use our factory internally
            const rws = new ReconnectingWebSocket("wss://echo.websocket.org", undefined, {
                maxRetries: 1,
                connectionTimeout: 1000
            });
            
            // Verify it was created successfully
            assertEquals(typeof rws.url, "string");
            assertEquals(rws.url, "wss://echo.websocket.org/");
            
            // Clean up
            rws.close(1000, "Test complete", true);
        } finally {
            restore();
        }
    });
});