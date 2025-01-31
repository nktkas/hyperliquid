import type { Hex } from "../common.ts";
import type { TIF } from "../info/orders.ts";

/** Order parameters. */
export type OrderParams = {
    /** Asset ID. */
    a: number;
    /** Position side (`true` for long, `false` for short). */
    b: boolean;
    /** Price. */
    p: string;
    /** Size (in base currency units). */
    s: string;
    /** Is reduce-only? */
    r: boolean;
    /** Order type. */
    t:
        | {
            /** Limit order parameters. */
            limit: {
                /** Time-in-force. */
                tif: TIF;
            };
        }
        | {
            /** Trigger order parameters. */
            trigger: {
                /** Is market order? */
                isMarket: boolean;
                /** Trigger price. */
                triggerPx: string;
                /** Indicates whether it is take profit or stop loss. */
                tpsl: "tp" | "sl";
            };
        };
    /** Client Order ID. */
    c?: Hex;
};
