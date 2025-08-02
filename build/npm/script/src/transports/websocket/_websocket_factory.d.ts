import { TransportError } from "../base.js";
/** Error thrown when WebSocket creation fails due to compatibility issues. */
export declare class WebSocketCompatibilityError extends TransportError {
    constructor(message?: string, options?: ErrorOptions);
}
/**
 * Creates a WebSocket instance with automatic compatibility handling.
 *
 * - For Node.js >= 24: Uses native WebSocket
 * - For Node.js < 24: Uses 'ws' package (must be installed)
 * - For other environments: Uses native WebSocket
 *
 * @param url - WebSocket URL
 * @param protocols - WebSocket protocols
 * @returns Promise resolving to WebSocket instance
 */
export declare function createCompatibleWebSocket(url: string | URL, protocols?: string | string[]): Promise<WebSocket>;
/**
 * Pre-loads the ws package if needed for Node.js < 24.
 * This should be called once at startup if using sync WebSocket creation.
 */
export declare function preloadWsPackage(): Promise<void>;
/**
 * Synchronous version that uses pre-loaded ws package for Node.js < 24.
 * Call preloadWsPackage() first for Node.js < 24, or it will throw.
 *
 * @param url - WebSocket URL
 * @param protocols - WebSocket protocols
 * @returns WebSocket instance
 */
export declare function createCompatibleWebSocketSync(url: string | URL, protocols?: string | string[]): WebSocket;
/**
 * Utility to check if the current environment needs the 'ws' package.
 * Useful for providing helpful error messages or documentation.
 */
export declare function requiresWsPackage(): boolean;
/**
 * Gets environment information for debugging purposes.
 */
export declare function getWebSocketEnvironmentInfo(): {
    isNode: boolean;
    nodeMajorVersion: number | null;
    hasReliableNativeWebSocket: boolean;
    requiresWsPackage: boolean;
};
//# sourceMappingURL=_websocket_factory.d.ts.map