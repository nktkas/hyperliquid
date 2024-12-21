import type {
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CreateSubAccountRequest,
    ModifyRequest,
    OrderRequest,
    ScheduleCancelRequest,
    SetReferrerRequest,
    SubAccountTransferRequest,
    TwapCancelRequest,
    TwapOrderRequest,
    UpdateIsolatedMarginRequest,
    UpdateLeverageRequest,
    VaultTransferRequest,
} from "../types/exchange/requests.d.ts";

// Union type of all possible action types
type ActionType =
    | BatchModifyRequest["action"]
    | CancelRequest["action"]
    | CancelByCloidRequest["action"]
    | CreateSubAccountRequest["action"]
    | ModifyRequest["action"]
    | OrderRequest["action"]
    | ScheduleCancelRequest["action"]
    | SetReferrerRequest["action"]
    | SubAccountTransferRequest["action"]
    | TwapCancelRequest["action"]
    | TwapOrderRequest["action"]
    | UpdateIsolatedMarginRequest["action"]
    | UpdateLeverageRequest["action"]
    | VaultTransferRequest["action"];

// Type for nested schemas
type NestedSchema = {
    readonly keys: readonly string[];
    readonly nested?: {
        readonly [key: string]: NestedSchema;
    };
};

// Nested object schemas
const orderSchema: NestedSchema = {
    keys: ["a", "b", "p", "s", "r", "t", "c"],
    nested: {
        t: {
            keys: ["limit", "trigger"],
            nested: {
                limit: {
                    keys: ["tif"],
                },
                trigger: {
                    keys: ["isMarket", "triggerPx", "tpsl"],
                },
            },
        },
    },
};

// Sorting schema for action keys
const actionSortingSchemas: { [K in ActionType["type"]]: NestedSchema } = {
    batchModify: {
        keys: ["type", "modifies"],
        nested: {
            modifies: {
                keys: ["oid", "order"],
                nested: {
                    order: orderSchema,
                },
            },
        },
    },

    cancel: {
        keys: ["type", "cancels"],
        nested: {
            cancels: {
                keys: ["a", "o"],
            },
        },
    },

    cancelByCloid: {
        keys: ["type", "cancels"],
        nested: {
            cancels: {
                keys: ["asset", "cloid"],
            },
        },
    },

    createSubAccount: {
        keys: ["type", "name"],
    },

    modify: {
        keys: ["type", "oid", "order"],
        nested: {
            order: orderSchema,
        },
    },

    order: {
        keys: ["type", "orders", "grouping", "builder"],
        nested: {
            orders: orderSchema,
            builder: {
                keys: ["b", "f"],
            },
        },
    },

    scheduleCancel: {
        keys: ["type", "time"],
    },

    setReferrer: {
        keys: ["type", "code"],
    },

    subAccountTransfer: {
        keys: ["type", "subAccountUser", "isDeposit", "usd"],
    },

    twapCancel: {
        keys: ["type", "a", "t"],
    },

    twapOrder: {
        keys: ["type", "twap"],
        nested: {
            twap: {
                keys: ["a", "b", "s", "r", "m", "t"],
            },
        },
    },

    updateIsolatedMargin: {
        keys: ["type", "asset", "isBuy", "ntli"],
    },

    updateLeverage: {
        keys: ["type", "asset", "isCross", "leverage"],
    },

    vaultTransfer: {
        keys: ["type", "vaultAddress", "isDeposit", "usd"],
    },
};

/**
 * Sort an object according to schema
 * @param obj - Object to sort
 * @param schema - Schema to sort by
 * @returns Sorted object
 */
function sortBySchema<T extends Record<string, unknown>>(obj: T, schema: NestedSchema): T {
    function sortValue(value: unknown, subSchema?: NestedSchema): unknown {
        if (!subSchema || typeof value !== "object" || value === null) {
            return value;
        }
        if (Array.isArray(value)) {
            return value.map((item) => sortBySchema(item as Record<string, unknown>, subSchema));
        }
        return sortBySchema(value as Record<string, unknown>, subSchema);
    }

    for (const key of Object.keys(obj)) {
        if (!schema.keys.includes(key)) {
            throw new Error(`Invalid key "${key}" found in object`);
        }
    }

    const sortedObj: Record<string, unknown> = {};
    for (const key of schema.keys) {
        if (key in obj) {
            sortedObj[key] = sortValue(obj[key], schema.nested?.[key]);
        }
    }
    return sortedObj as T;
}

/**
 * Sort the keys of an action object according to the schema.
 * @param action - The action object to sort.
 * @returns The sorted action object.
 */
export function sortActionKeys<T extends ActionType>(action: T): T {
    const schema = actionSortingSchemas[action.type];
    if (!schema) {
        throw new Error(`No sorting schema found for action type: ${action.type}`);
    }

    return sortBySchema(action, schema);
}
