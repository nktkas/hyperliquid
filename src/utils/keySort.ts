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
    | UpdateIsolatedMarginRequest["action"]
    | UpdateLeverageRequest["action"]
    | VaultTransferRequest["action"];

// Type for action type discriminator
type ActionTypeDiscriminator = ActionType["type"];

// Type for nested schemas
type NestedSchema = {
    readonly keys: readonly string[];
    readonly nested?: {
        readonly [key: string]: NestedSchema;
    };
};

// Type-safe schema definition
type ActionSchema = {
    [K in ActionTypeDiscriminator]: NestedSchema;
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
const actionSortingSchemas: ActionSchema = {
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
    // Check if all keys in object exist in schema
    Object.keys(obj).forEach((key) => {
        if (!schema.keys.includes(key)) {
            throw new Error(`Invalid key "${key}" found in object`);
        }
    });

    const sortedObj: Partial<T> = {};

    // Add keys in schema order
    schema.keys.forEach((key) => {
        if (key in obj) {
            const value = obj[key as keyof T];

            if (schema.nested?.[key] && typeof value === "object" && value !== null) {
                if (Array.isArray(value)) {
                    // Handle array of objects
                    sortedObj[key as keyof T] = value.map((item) =>
                        sortBySchema(item as Record<string, unknown>, schema.nested![key])
                    ) as T[keyof T];
                } else {
                    // Handle nested object
                    sortedObj[key as keyof T] = sortBySchema(
                        value as Record<string, unknown>,
                        schema.nested[key],
                    ) as T[keyof T];
                }
            } else {
                sortedObj[key as keyof T] = value;
            }
        }
    });

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
