import { TypedEventTarget } from "@derzade/typescript-event-target";

/**
 * Represents a message from the Hyperliquid WebSocket API.
 */
interface HyperliquidMsg {
    /** Event channel name */
    channel: string;
    /** Channel-specific data */
    data: unknown;
}

/**
 * Base system events and dynamic channel events for Hyperliquid WebSocket API.
 */
export interface HyperliquidEventMap {
    /** Subscription created/removed event */
    subscriptionResponse: CustomEvent<{
        /** Type of subscription operation */
        method: "subscribe" | "unsubscribe";
        /** Original subscription request */
        subscription: unknown;
    }>;

    /** Response to post request event */
    post: CustomEvent<{
        /** Unique request identifier */
        id: number;
        /** Server response */
        response:
            /** Response containing requested information */
            | {
                /** Indicates that this is an informational response */
                type: "info";
                /** Contains the information data */
                payload: {
                    /** Type of information being returned */
                    type: string;
                    /** Information specific data */
                    data: unknown;
                };
            }
            /** Response containing action result */
            | {
                /** Indicates that this is an action response */
                type: "action";
                /** Contains the action result data */
                payload: {
                    /** Response status indicating success or failure of the action */
                    status: "ok" | "err";
                    /** Success data or error message */
                    response:
                        | {
                            /** Type of operation */
                            type: string;
                            /** Specific data for the operation */
                            data?: unknown;
                        }
                        | string;
                };
            };
    }>;

    /** Error response for message event */
    error: CustomEvent<string>;

    /** Pong response event */
    pong: CustomEvent<undefined>;

    /** Subscribed channel events */
    [key: string]: CustomEvent<unknown>;
}

/**
 * A class that listens to WebSocket messages and dispatches them as Hyperliquid typed events.
 */
export class HyperliquidEventTarget extends TypedEventTarget<HyperliquidEventMap> {
    /**
     * Creates a new Hyperliquid event target.
     * @param socket - The WebSocket to listen to.
     */
    constructor(socket: WebSocket) {
        super();
        socket.addEventListener("message", (event) => {
            try {
                const msg = JSON.parse(event.data) as unknown;
                if (isHyperliquidMsg(msg)) {
                    this.dispatchEvent(new CustomEvent(msg.channel, { detail: msg.data }));
                }
            } catch {
                // Ignore JSON parsing errors
            }
        });
    }
}

/**
 * Type guard for Hyperliquid messages.
 * @param value - The value to check.
 * @returns True if the value is a Hyperliquid message.
 */
function isHyperliquidMsg(value: unknown): value is HyperliquidMsg {
    return typeof value === "object" && value !== null &&
        "channel" in value && typeof value.channel === "string";
}
