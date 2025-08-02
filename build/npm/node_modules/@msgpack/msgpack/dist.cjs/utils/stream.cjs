"use strict";
// utility for whatwg streams
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAsyncIterable = isAsyncIterable;
exports.asyncIterableFromStream = asyncIterableFromStream;
exports.ensureAsyncIterable = ensureAsyncIterable;
function isAsyncIterable(object) {
    return object[Symbol.asyncIterator] != null;
}
async function* asyncIterableFromStream(stream) {
    const reader = stream.getReader();
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                return;
            }
            yield value;
        }
    }
    finally {
        reader.releaseLock();
    }
}
function ensureAsyncIterable(streamLike) {
    if (isAsyncIterable(streamLike)) {
        return streamLike;
    }
    else {
        return asyncIterableFromStream(streamLike);
    }
}
//# sourceMappingURL=stream.cjs.map