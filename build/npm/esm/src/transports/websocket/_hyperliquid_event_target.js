/** Listens for WebSocket messages and sends them as Hyperliquid typed events. */
export class HyperliquidEventTarget extends EventTarget {
    constructor(socket) {
        super();
        socket.addEventListener("message", (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (isHyperliquidMsg(msg)) {
                    this.dispatchEvent(new CustomEvent(msg.channel, { detail: msg.data }));
                }
                else if (isExplorerBlockMsg(msg)) {
                    this.dispatchEvent(new CustomEvent("_explorerBlock", { detail: msg }));
                }
                else if (isExplorerTxsMsg(msg)) {
                    this.dispatchEvent(new CustomEvent("_explorerTxs", { detail: msg }));
                }
            }
            catch {
                // Ignore JSON parsing errors
            }
        });
    }
}
/** Type guard for Hyperliquid messages. */
function isHyperliquidMsg(value) {
    return typeof value === "object" && value !== null &&
        "channel" in value && typeof value.channel === "string";
}
/** Type guard for explorer block messages. */
function isExplorerBlockMsg(value) {
    return Array.isArray(value) && value.length > 0 &&
        (typeof value[0] === "object" && value[0] !== null && !Array.isArray(value[0]) &&
            "height" in value[0] && typeof value[0].height === "number" &&
            "blockTime" in value[0] && typeof value[0].blockTime === "number" &&
            "hash" in value[0] && typeof value[0].hash === "string" &&
            "proposer" in value[0] && typeof value[0].proposer === "string" &&
            "numTxs" in value[0] && typeof value[0].numTxs === "number");
}
/** Type guard for explorer transactions messages. */
function isExplorerTxsMsg(value) {
    return Array.isArray(value) && value.length > 0 &&
        (typeof value[0] === "object" && value[0] !== null && !Array.isArray(value[0]) &&
            "action" in value[0] && typeof value[0].action === "object" && value[0].action !== null &&
            "block" in value[0] && typeof value[0].block === "number" &&
            "error" in value[0] && (typeof value[0].error === "string" || value[0].error === null) &&
            "hash" in value[0] && typeof value[0].hash === "string" &&
            "time" in value[0] && typeof value[0].time === "number" &&
            "user" in value[0] && typeof value[0].user === "string");
}
