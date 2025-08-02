# Node.js Compatibility Guide

This document explains the Node.js compatibility solution implemented to resolve [issue #34](https://github.com/nktkas/hyperliquid/issues/34).

## Problem

Node.js versions 22 and 23 have a bug where the WebSocket "close" event is not properly triggered when closing a socket in the "CONNECTING" state. This caused hanging promises in the `WebSocketTransport.close()` method, making the library unusable with Node.js < 24.

## Solution

We've implemented an automatic compatibility layer that:

1. **Detects Node.js version at runtime**
2. **Uses native WebSocket for Node.js >= 24** (where the bug is fixed)
3. **Falls back to the `ws` package for Node.js < 24** (with proper close event handling)
4. **Provides helpful error messages** when the `ws` package is missing

## Supported Node.js Versions

- **Node.js >= 24.0.0**: Uses native WebSocket (no additional dependencies required)
- **Node.js 20.0.0 - 23.x**: Uses `ws` package fallback (requires `npm install ws`)

## Installation

### For Node.js >= 24.0.0

No additional setup required:

```bash
npm install @nktkas/hyperliquid
# or
yarn add @nktkas/hyperliquid
```

### For Node.js 20.0.0 - 23.x

Install the `ws` package as an optional dependency:

```bash
npm install @nktkas/hyperliquid ws
# or
yarn add @nktkas/hyperliquid ws
```

## Usage

The compatibility layer is completely transparent. Use WebSocket transports exactly as before:

```typescript
import { WebSocketTransport } from '@nktkas/hyperliquid';

// Works automatically with both native WebSocket and ws package
const transport = new WebSocketTransport({
    url: 'wss://api.hyperliquid.xyz/ws'
});
```

### Advanced Usage: Preloading (Optional)

For better startup performance with Node.js < 24, you can preload the `ws` package:

```typescript
import { preloadWsPackage, WebSocketTransport } from '@nktkas/hyperliquid';

// Optional: preload ws package at application startup
if (process.versions.node && parseInt(process.versions.node) < 24) {
    await preloadWsPackage();
}

// Now WebSocket creation is synchronous
const transport = new WebSocketTransport({ url: 'wss://api.hyperliquid.xyz/ws' });
```

### Environment Detection

You can check the WebSocket environment programmatically:

```typescript
import { getWebSocketEnvironmentInfo } from '@nktkas/hyperliquid';

const info = getWebSocketEnvironmentInfo();
console.log('Node.js version:', info.nodeMajorVersion);
console.log('Uses native WebSocket:', info.hasReliableNativeWebSocket);
console.log('Requires ws package:', info.requiresWsPackage);
```

## Error Handling

If you're using Node.js < 24 without the `ws` package installed, you'll get a helpful error:

```
Node.js v22 requires the 'ws' package for reliable WebSocket support.
Please install it with: npm install ws
```

## Migration Guide

### Existing Users (Node.js >= 24)

No changes required. The library continues to work exactly as before.

### New Users (Node.js < 24)

1. Install the `ws` package: `npm install ws`
2. Use the library normally - compatibility is automatic

### Package Maintainers

If you're distributing applications that use this library:

1. Add `ws` as an optional dependency in your `package.json`:
   ```json
   {
     "peerDependencies": {
       "ws": ">=8.0.0"
     },
     "peerDependenciesMeta": {
       "ws": {
         "optional": true
       }
     }
   }
   ```

2. Optionally, call `preloadWsPackage()` at startup for better performance

## Technical Details

### WebSocket Factory Implementation

The solution uses a WebSocket factory that:

1. Detects the Node.js version using `process.versions.node`
2. For Node.js >= 24: Creates native WebSocket instances
3. For Node.js < 24: Dynamically imports and uses the `ws` package
4. Caches the `ws` constructor to avoid repeated dynamic imports

### Files Changed

- `src/transports/websocket/_websocket_factory.ts` (new): WebSocket compatibility layer
- `src/transports/websocket/_reconnecting_websocket.ts`: Updated to use factory
- `src/transports/websocket/websocket_transport.ts`: Export new utilities
- `build/npm.ts`: Lowered Node.js requirement to >=20.0.0, added optional `ws` peer dependency

### Testing

Comprehensive tests verify:
- Environment detection for different Node.js versions
- WebSocket creation with both native and `ws` implementations
- Error handling when `ws` package is missing
- Integration with existing WebSocket transport classes

## Troubleshooting

### "Cannot find module 'ws'" error

Install the `ws` package:
```bash
npm install ws
```

### TypeScript errors about missing 'ws' types

Install the `ws` types (development dependency):
```bash
npm install --save-dev @types/ws
```

### Performance considerations

- Dynamic imports have a small one-time cost for Node.js < 24
- Use `preloadWsPackage()` at startup to eliminate this cost
- No performance impact for Node.js >= 24

## Contributing

When contributing to this codebase:

1. Ensure changes work with both native WebSocket and `ws` package
2. Test with multiple Node.js versions (20, 22, 24+)
3. Update tests if modifying WebSocket-related code
4. Follow the existing error message patterns for user guidance

## References

- [Node.js WebSocket close event issue #34](https://github.com/nktkas/hyperliquid/issues/34)
- [ws package documentation](https://github.com/websockets/ws)
- [Node.js WebSocket API](https://nodejs.org/api/globals.html#websocket)