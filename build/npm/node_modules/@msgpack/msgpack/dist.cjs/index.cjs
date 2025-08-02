"use strict";
// Main Functions:
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeTimestampExtension = exports.encodeTimestampExtension = exports.decodeTimestampToTimeSpec = exports.encodeTimeSpecToTimestamp = exports.encodeDateToTimeSpec = exports.EXT_TIMESTAMP = exports.ExtData = exports.ExtensionCodec = exports.Encoder = exports.DecodeError = exports.Decoder = exports.decodeMultiStream = exports.decodeArrayStream = exports.decodeAsync = exports.decodeMulti = exports.decode = exports.encode = void 0;
const encode_ts_1 = require("./encode.cjs");;
Object.defineProperty(exports, "encode", { enumerable: true, get: function () { return encode_ts_1.encode; } });
const decode_ts_1 = require("./decode.cjs");;
Object.defineProperty(exports, "decode", { enumerable: true, get: function () { return decode_ts_1.decode; } });
Object.defineProperty(exports, "decodeMulti", { enumerable: true, get: function () { return decode_ts_1.decodeMulti; } });
const decodeAsync_ts_1 = require("./decodeAsync.cjs");;
Object.defineProperty(exports, "decodeAsync", { enumerable: true, get: function () { return decodeAsync_ts_1.decodeAsync; } });
Object.defineProperty(exports, "decodeArrayStream", { enumerable: true, get: function () { return decodeAsync_ts_1.decodeArrayStream; } });
Object.defineProperty(exports, "decodeMultiStream", { enumerable: true, get: function () { return decodeAsync_ts_1.decodeMultiStream; } });
const Decoder_ts_1 = require("./Decoder.cjs");;
Object.defineProperty(exports, "Decoder", { enumerable: true, get: function () { return Decoder_ts_1.Decoder; } });
const DecodeError_ts_1 = require("./DecodeError.cjs");;
Object.defineProperty(exports, "DecodeError", { enumerable: true, get: function () { return DecodeError_ts_1.DecodeError; } });
const Encoder_ts_1 = require("./Encoder.cjs");;
Object.defineProperty(exports, "Encoder", { enumerable: true, get: function () { return Encoder_ts_1.Encoder; } });
// Utilities for Extension Types:
const ExtensionCodec_ts_1 = require("./ExtensionCodec.cjs");;
Object.defineProperty(exports, "ExtensionCodec", { enumerable: true, get: function () { return ExtensionCodec_ts_1.ExtensionCodec; } });
const ExtData_ts_1 = require("./ExtData.cjs");;
Object.defineProperty(exports, "ExtData", { enumerable: true, get: function () { return ExtData_ts_1.ExtData; } });
const timestamp_ts_1 = require("./timestamp.cjs");;
Object.defineProperty(exports, "EXT_TIMESTAMP", { enumerable: true, get: function () { return timestamp_ts_1.EXT_TIMESTAMP; } });
Object.defineProperty(exports, "encodeDateToTimeSpec", { enumerable: true, get: function () { return timestamp_ts_1.encodeDateToTimeSpec; } });
Object.defineProperty(exports, "encodeTimeSpecToTimestamp", { enumerable: true, get: function () { return timestamp_ts_1.encodeTimeSpecToTimestamp; } });
Object.defineProperty(exports, "decodeTimestampToTimeSpec", { enumerable: true, get: function () { return timestamp_ts_1.decodeTimestampToTimeSpec; } });
Object.defineProperty(exports, "encodeTimestampExtension", { enumerable: true, get: function () { return timestamp_ts_1.encodeTimestampExtension; } });
Object.defineProperty(exports, "decodeTimestampExtension", { enumerable: true, get: function () { return timestamp_ts_1.decodeTimestampExtension; } });
//# sourceMappingURL=index.cjs.map