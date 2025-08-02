/**
 * WebSocket factory utility that provides Node.js version compatibility.
 *
 * For Node.js >= 24.0.0: Uses native WebSocket implementation
 * For Node.js < 24.0.0: Falls back to 'ws' package to avoid close event issues
 *
 * The 'ws' package must be installed as an optional dependency for Node.js < 24.
 */
import * as dntShim from "../../../_dnt.shims.js";
import { TransportError } from "../base.js";
/** Error thrown when WebSocket creation fails due to compatibility issues. */
export class WebSocketCompatibilityError extends TransportError {
    constructor(message, options) {
        super(message, options);
        this.name = "WebSocketCompatibilityError";
    }
}
/**
 * Detects the Node.js version and returns major version number.
 * Returns null if not running in Node.js environment.
 */
function getNodeMajorVersion() {
    try {
        // Check if we're in a Node.js environment
        // Use globalThis to avoid TypeScript errors in Deno
        const globalProcess = dntShim.dntGlobalThis.process;
        if (typeof globalProcess !== "undefined" && globalProcess.versions?.node) {
            const nodeVersion = globalProcess.versions.node;
            const majorVersion = parseInt(nodeVersion.split(".")[0], 10);
            return majorVersion;
        }
        return null; // Not in Node.js environment (browser, Deno, etc.)
    }
    catch {
        return null;
    }
}
/**
 * Checks if the current Node.js version has reliable native WebSocket close event handling.
 * Node.js >= 24.0.0 has proper close event handling for sockets in CONNECTING state.
 */
function hasReliableNativeWebSocket() {
    const nodeMajorVersion = getNodeMajorVersion();
    if (nodeMajorVersion === null) {
        // Not in Node.js environment - assume native WebSocket is available and reliable
        return true;
    }
    // Node.js >= 24 has reliable close event handling
    return nodeMajorVersion >= 24;
}
/**
 * Attempts to dynamically import and use the 'ws' package as a fallback.
 * @param url - WebSocket URL
 * @param protocols - WebSocket protocols
 * @returns WebSocket instance from 'ws' package
 */
async function createFallbackWebSocket(url, protocols) {
    try {
        // Dynamic import using string concatenation to avoid TypeScript errors during compilation
        // when 'ws' package is not installed
        const moduleName = "ws";
        const wsModule = await import(moduleName);
        const WS = wsModule.default || wsModule.WebSocket || wsModule;
        if (typeof WS !== "function") {
            throw new Error("Invalid 'ws' module structure");
        }
        // Create WebSocket instance using 'ws' package
        const ws = new WS(url, protocols);
        // The 'ws' package has a slightly different API, but is mostly compatible
        return ws;
    }
    catch (error) {
        if (error instanceof Error && (error.message.includes("Cannot resolve module") ||
            error.message.includes("not prefixed with") ||
            error.message.includes("Module not found") ||
            error.message.includes("Cannot find module"))) {
            throw new WebSocketCompatibilityError(`Node.js v${getNodeMajorVersion()} requires the 'ws' package for reliable WebSocket support. ` +
                `Please install it with: npm install ws`, { cause: error });
        }
        throw new WebSocketCompatibilityError(`Failed to create WebSocket using 'ws' package: ${error}`, { cause: error });
    }
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
export async function createCompatibleWebSocket(url, protocols) {
    if (hasReliableNativeWebSocket()) {
        // Use native WebSocket for Node.js >= 24 or non-Node environments
        try {
            return new WebSocket(url, protocols);
        }
        catch (error) {
            throw new WebSocketCompatibilityError(`Failed to create native WebSocket: ${error}`, { cause: error });
        }
    }
    else {
        // Use 'ws' package fallback for Node.js < 24
        return await createFallbackWebSocket(url, protocols);
    }
}
// Cache for the ws WebSocket constructor to avoid repeated dynamic imports
let wsWebSocketConstructor = null;
let wsImportAttempted = false;
/**
 * Pre-loads the ws package if needed for Node.js < 24.
 * This should be called once at startup if using sync WebSocket creation.
 */
export async function preloadWsPackage() {
    if (!hasReliableNativeWebSocket() && !wsImportAttempted) {
        wsImportAttempted = true;
        try {
            const moduleName = "ws";
            const wsModule = await import(moduleName);
            const WS = wsModule.default || wsModule.WebSocket || wsModule;
            if (typeof WS === "function") {
                wsWebSocketConstructor = WS;
            }
            else {
                throw new Error("Invalid 'ws' module structure");
            }
        }
        catch (error) {
            // Will be handled in sync creation
            wsWebSocketConstructor = null;
        }
    }
}
/**
 * Synchronous version that uses pre-loaded ws package for Node.js < 24.
 * Call preloadWsPackage() first for Node.js < 24, or it will throw.
 *
 * @param url - WebSocket URL
 * @param protocols - WebSocket protocols
 * @returns WebSocket instance
 */
export function createCompatibleWebSocketSync(url, protocols) {
    if (hasReliableNativeWebSocket()) {
        try {
            return new WebSocket(url, protocols);
        }
        catch (error) {
            throw new WebSocketCompatibilityError(`Failed to create native WebSocket: ${error}`, { cause: error });
        }
    }
    else {
        // For Node.js < 24, use pre-loaded ws package
        if (wsWebSocketConstructor) {
            try {
                return new wsWebSocketConstructor(url, protocols);
            }
            catch (error) {
                throw new WebSocketCompatibilityError(`Failed to create WebSocket using 'ws' package: ${error}`, { cause: error });
            }
        }
        else {
            throw new WebSocketCompatibilityError(`Node.js v${getNodeMajorVersion()} requires the 'ws' package for reliable WebSocket support. ` +
                `Please install it with: npm install ws. ` +
                `Call preloadWsPackage() first or use createCompatibleWebSocket() async function instead.`);
        }
    }
}
/**
 * Utility to check if the current environment needs the 'ws' package.
 * Useful for providing helpful error messages or documentation.
 */
export function requiresWsPackage() {
    return !hasReliableNativeWebSocket() && getNodeMajorVersion() !== null;
}
/**
 * Gets environment information for debugging purposes.
 */
export function getWebSocketEnvironmentInfo() {
    const nodeMajorVersion = getNodeMajorVersion();
    return {
        isNode: nodeMajorVersion !== null,
        nodeMajorVersion,
        hasReliableNativeWebSocket: hasReliableNativeWebSocket(),
        requiresWsPackage: requiresWsPackage(),
    };
}
