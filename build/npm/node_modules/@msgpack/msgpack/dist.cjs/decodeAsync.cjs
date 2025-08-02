"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeAsync = decodeAsync;
exports.decodeArrayStream = decodeArrayStream;
exports.decodeMultiStream = decodeMultiStream;
const Decoder_ts_1 = require("./Decoder.cjs");;
const stream_ts_1 = require("./utils/stream.cjs");;
/**
 * @throws {@link RangeError} if the buffer is incomplete, including the case where the buffer is empty.
 * @throws {@link DecodeError} if the buffer contains invalid data.
 */
async function decodeAsync(streamLike, options) {
    const stream = (0, stream_ts_1.ensureAsyncIterable)(streamLike);
    const decoder = new Decoder_ts_1.Decoder(options);
    return decoder.decodeAsync(stream);
}
/**
 * @throws {@link RangeError} if the buffer is incomplete, including the case where the buffer is empty.
 * @throws {@link DecodeError} if the buffer contains invalid data.
 */
function decodeArrayStream(streamLike, options) {
    const stream = (0, stream_ts_1.ensureAsyncIterable)(streamLike);
    const decoder = new Decoder_ts_1.Decoder(options);
    return decoder.decodeArrayStream(stream);
}
/**
 * @throws {@link RangeError} if the buffer is incomplete, including the case where the buffer is empty.
 * @throws {@link DecodeError} if the buffer contains invalid data.
 */
function decodeMultiStream(streamLike, options) {
    const stream = (0, stream_ts_1.ensureAsyncIterable)(streamLike);
    const decoder = new Decoder_ts_1.Decoder(options);
    return decoder.decodeStream(stream);
}
//# sourceMappingURL=decodeAsync.cjs.map