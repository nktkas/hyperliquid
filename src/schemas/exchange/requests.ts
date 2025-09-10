import * as v from "valibot";
import { Hex, TokenId, UnsignedDecimalMayInputNumber, UnsignedIntegerMayInputString } from "../_base.ts";
import { TIF } from "../info/orders.ts";

/** Deeply removes undefined keys from an object.  */
function removeUndefinedKeys<T>(obj: T): T {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((value) => removeUndefinedKeys(value)) as T;
    }

    const result: Record<string, unknown> = {};
    const entries = Object.entries(obj);
    for (const [key, value] of entries) {
        if (value !== undefined) {
            result[key] = removeUndefinedKeys(value);
        }
    }

    return result as T;
}

const Percent = v.pipe(v.string(), v.regex(/^[0-9]+(\.[0-9]+)?%$/), v.transform((value) => value as `${string}%`));

/** ECDSA signature components for Ethereum typed data. */
export const Signature = v.pipe(
    v.object({
        /** First 32-byte component of ECDSA signature. */
        r: v.pipe(
            v.pipe(
                Hex,
                v.length(66),
                v.transform((value) => value.replace(/^0x0+/, "0x") as `0x${string}`),
            ),
            v.description("First 32-byte component of ECDSA signature."),
        ),
        /** Second 32-byte component of ECDSA signature. */
        s: v.pipe(
            v.pipe(
                Hex,
                v.length(66),
                v.transform((value) => value.replace(/^0x0+/, "0x") as `0x${string}`),
            ),
            v.description("Second 32-byte component of ECDSA signature."),
        ),
        /** Recovery identifier. */
        v: v.pipe(
            v.union([v.literal(27), v.literal(28)]),
            v.description("Recovery identifier."),
        ),
    }),
    v.description("ECDSA signature components for Ethereum typed data."),
);
export type Signature = v.InferOutput<typeof Signature>;

/** Order parameters. */
export const OrderParams = v.pipe(
    v.object({
        /** Asset ID. */
        a: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Asset ID."),
        ),
        /** Position side (`true` for long, `false` for short). */
        b: v.pipe(
            v.boolean(),
            v.description("Position side (`true` for long, `false` for short)."),
        ),
        /** Price. */
        p: v.pipe(
            UnsignedDecimalMayInputNumber,
            v.description("Price."),
        ),
        /** Size (in base currency units). */
        s: v.pipe(
            UnsignedDecimalMayInputNumber,
            v.description("Size (in base currency units)."),
        ),
        /** Is reduce-only? */
        r: v.pipe(
            v.boolean(),
            v.description("Is reduce-only?"),
        ),
        /** Order type. */
        t: v.pipe(
            v.union([
                v.object({
                    /** Limit order parameters. */
                    limit: v.pipe(
                        v.object({
                            /** Time-in-force. */
                            tif: v.pipe(
                                TIF,
                                v.description("Time-in-force."),
                            ),
                        }),
                        v.description("Limit order parameters."),
                    ),
                }),
                v.object({
                    /** Trigger order parameters. */
                    trigger: v.pipe(
                        v.object({
                            /** Is market order? */
                            isMarket: v.pipe(
                                v.boolean(),
                                v.description("Is market order?"),
                            ),
                            /** Trigger price. */
                            triggerPx: v.pipe(
                                UnsignedDecimalMayInputNumber,
                                v.description("Trigger price."),
                            ),
                            /** Indicates whether it is take profit or stop loss. */
                            tpsl: v.pipe(
                                v.union([v.literal("tp"), v.literal("sl")]),
                                v.description("Indicates whether it is take profit or stop loss."),
                            ),
                        }),
                        v.description("Trigger order parameters."),
                    ),
                }),
            ]),
            v.description("Order type."),
        ),
        /** Client Order ID. */
        c: v.pipe(
            v.optional(v.pipe(Hex, v.length(34))),
            v.description("Client Order ID."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Order parameters."),
);
export type OrderParams = v.InferOutput<typeof OrderParams>;

/**
 * Approve an agent to sign on behalf of the master account.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
 */
export const ApproveAgentRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("approveAgent"),
                    v.description("Type of action."),
                ),
                /** Chain ID used for signing. */
                signatureChainId: v.pipe(
                    Hex,
                    v.description("Chain ID used for signing."),
                ),
                /** HyperLiquid network. */
                hyperliquidChain: v.pipe(
                    v.union([v.literal("Mainnet"), v.literal("Testnet")]),
                    v.description("HyperLiquid network."),
                ),
                /** Agent address. */
                agentAddress: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Agent address."),
                ),
                /** Agent name or null for unnamed agent. */
                agentName: v.pipe(
                    v.nullable(v.string()),
                    v.description("Agent name or null for unnamed agent."),
                ),
                /** Unique request identifier (current timestamp in ms). */
                nonce: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Unique request identifier (current timestamp in ms)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Approve an agent to sign on behalf of the master account."),
);
export type ApproveAgentRequest = v.InferOutput<typeof ApproveAgentRequest>;

/**
 * Approve a maximum fee rate for a builder.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
 */
export const ApproveBuilderFeeRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("approveBuilderFee"),
                    v.description("Type of action."),
                ),
                /** Chain ID used for signing. */
                signatureChainId: v.pipe(
                    Hex,
                    v.description("Chain ID used for signing."),
                ),
                /** HyperLiquid network. */
                hyperliquidChain: v.pipe(
                    v.union([v.literal("Mainnet"), v.literal("Testnet")]),
                    v.description("HyperLiquid network."),
                ),
                /** Max fee rate (e.g., "0.01%"). */
                maxFeeRate: v.pipe(
                    Percent,
                    v.description('Max fee rate (e.g., "0.01%").'),
                ),
                /** Builder address. */
                builder: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Builder address."),
                ),
                /** Unique request identifier (current timestamp in ms). */
                nonce: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Unique request identifier (current timestamp in ms)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Approve a maximum fee rate for a builder."),
);
export type ApproveBuilderFeeRequest = v.InferOutput<typeof ApproveBuilderFeeRequest>;

/**
 * Modify multiple orders.
 * @returns {OrderResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
 */
export const BatchModifyRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("batchModify"),
                    v.description("Type of action."),
                ),
                /** Order modifications. */
                modifies: v.pipe(
                    v.array(v.object({
                        /** Order ID or Client Order ID. */
                        oid: v.pipe(
                            v.union([
                                UnsignedIntegerMayInputString,
                                v.pipe(Hex, v.length(34)),
                            ]),
                            v.description("Order ID or Client Order ID."),
                        ),
                        /** New order parameters. */
                        order: v.pipe(
                            OrderParams,
                            v.description("New order parameters."),
                        ),
                    })),
                    v.description("Order modifications."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Vault address (for vault trading). */
        vaultAddress: v.pipe(
            v.optional(v.pipe(Hex, v.length(42))),
            v.description("Vault address (for vault trading)."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Modify multiple orders."),
);
export type BatchModifyRequest = v.InferOutput<typeof BatchModifyRequest>;

/**
 * Cancel order(s).
 * @returns {CancelResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
 */
export const CancelRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("cancel"),
                    v.description("Type of action."),
                ),
                /** Orders to cancel. */
                cancels: v.pipe(
                    v.array(v.object({
                        /** Asset ID. */
                        a: v.pipe(
                            UnsignedIntegerMayInputString,
                            v.description("Asset ID."),
                        ),
                        /** Order ID. */
                        o: v.pipe(
                            UnsignedIntegerMayInputString,
                            v.description("Order ID."),
                        ),
                    })),
                    v.description("Orders to cancel."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Vault address (for vault trading). */
        vaultAddress: v.pipe(
            v.optional(v.pipe(Hex, v.length(42))),
            v.description("Vault address (for vault trading)."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Cancel order(s)."),
);
export type CancelRequest = v.InferOutput<typeof CancelRequest>;

/**
 * Cancel order(s) by cloid.
 * @returns {CancelResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
 */
export const CancelByCloidRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("cancelByCloid"),
                    v.description("Type of action."),
                ),
                /** Orders to cancel. */
                cancels: v.pipe(
                    v.array(v.object({
                        /** Asset ID. */
                        asset: v.pipe(
                            UnsignedIntegerMayInputString,
                            v.description("Asset ID."),
                        ),
                        /** Client Order ID. */
                        cloid: v.pipe(
                            v.pipe(Hex, v.length(34)),
                            v.description("Client Order ID."),
                        ),
                    })),
                    v.description("Orders to cancel."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Vault address (for vault trading). */
        vaultAddress: v.pipe(
            v.optional(v.pipe(Hex, v.length(42))),
            v.description("Vault address (for vault trading)."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Cancel order(s) by cloid."),
);
export type CancelByCloidRequest = v.InferOutput<typeof CancelByCloidRequest>;

/**
 * Transfer native token from the user spot account into staking for delegating to validators.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
 */
export const CDepositRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("cDeposit"),
                    v.description("Type of action."),
                ),
                /** Chain ID used for signing. */
                signatureChainId: v.pipe(
                    Hex,
                    v.description("Chain ID used for signing."),
                ),
                /** HyperLiquid network. */
                hyperliquidChain: v.pipe(
                    v.union([v.literal("Mainnet"), v.literal("Testnet")]),
                    v.description("HyperLiquid network."),
                ),
                /** Amount of wei to deposit into staking balance (float * 1e8). */
                wei: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Amount of wei to deposit into staking balance (float * 1e8)."),
                ),
                /** Unique request identifier (current timestamp in ms). */
                nonce: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Unique request identifier (current timestamp in ms)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Transfer native token from the user spot account into staking for delegating to validators."),
);
export type CDepositRequest = v.InferOutput<typeof CDepositRequest>;

/**
 * Claim rewards from referral program.
 * @returns {SuccessResponse}
 * @see null
 */
export const ClaimRewardsRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("claimRewards"),
                    v.description("Type of action."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Claim rewards from referral program."),
);
export type ClaimRewardsRequest = v.InferOutput<typeof ClaimRewardsRequest>;

/** Signers configuration for {@linkcode ConvertToMultiSigUserRequest}. */
export const ConvertToMultiSigUserRequestSigners = v.pipe(
    v.union([
        v.object({
            /** List of authorized user addresses. */
            authorizedUsers: v.pipe(
                v.array(v.pipe(Hex, v.length(42))),
                v.description("List of authorized user addresses."),
            ),
            /** Minimum number of signatures required. */
            threshold: v.pipe(
                UnsignedIntegerMayInputString,
                v.description("Minimum number of signatures required."),
            ),
        }),
        /** Convert a multi-signature account to a single-signature account. */
        v.pipe(
            v.null(),
            v.description("Convert a multi-signature account to a single-signature account."),
        ),
    ]),
    v.description("Signers configuration for `ConvertToMultiSigUserRequest`"),
);
export type ConvertToMultiSigUserRequestSigners = v.InferOutput<typeof ConvertToMultiSigUserRequestSigners>;

/**
 * Convert a single-signature account to a multi-signature account.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
 */
export const ConvertToMultiSigUserRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("convertToMultiSigUser"),
                    v.description("Type of action."),
                ),
                /** Chain ID used for signing. */
                signatureChainId: v.pipe(
                    Hex,
                    v.description("Chain ID used for signing."),
                ),
                /** HyperLiquid network. */
                hyperliquidChain: v.pipe(
                    v.union([v.literal("Mainnet"), v.literal("Testnet")]),
                    v.description("HyperLiquid network."),
                ),
                /**
                 * Signers configuration.
                 *
                 * Must be {@linkcode ConvertToMultiSigUserRequestSigners} converted to a string via `JSON.stringify(...)`.
                 */
                signers: v.pipe(
                    v.union([
                        v.pipe(
                            v.string(),
                            v.parseJson(),
                            ConvertToMultiSigUserRequestSigners,
                            v.stringifyJson(),
                        ),
                        v.pipe(
                            ConvertToMultiSigUserRequestSigners,
                            v.stringifyJson(),
                        ),
                    ]),
                    v.description(
                        "Signers configuration." +
                            "\n\nMust be `ConvertToMultiSigUserRequestSigners` converted to a string via `JSON.stringify(...)`.",
                    ),
                ),
                /** Unique request identifier (current timestamp in ms). */
                nonce: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Unique request identifier (current timestamp in ms)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Convert a single-signature account to a multi-signature account."),
);
export type ConvertToMultiSigUserRequest = v.InferOutput<typeof ConvertToMultiSigUserRequest>;

/**
 * Create a sub-account.
 * @returns {CreateSubAccountResponse}
 * @see null
 */
export const CreateSubAccountRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("createSubAccount"),
                    v.description("Type of action."),
                ),
                /** Sub-account name. */
                name: v.pipe(
                    v.string(),
                    v.minLength(1),
                    v.description("Sub-account name."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Create a sub-account."),
);
export type CreateSubAccountRequest = v.InferOutput<typeof CreateSubAccountRequest>;

/**
 * Create a vault.
 * @returns {CreateVaultResponse}
 * @see null
 */
export const CreateVaultRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("createVault"),
                    v.description("Type of action."),
                ),
                /** Vault name. */
                name: v.pipe(
                    v.string(),
                    v.minLength(3),
                    v.description("Vault name."),
                ),
                /** Vault description. */
                description: v.pipe(
                    v.string(),
                    v.minLength(10),
                    v.description("Vault description."),
                ),
                /** Initial balance (float * 1e6). */
                initialUsd: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.minValue(100000000), // 100 USDC
                    v.description("Initial balance (float * 1e6)."),
                ),
                /** Unique request identifier (current timestamp in ms). */
                nonce: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Unique request identifier (current timestamp in ms)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Create a vault."),
);
export type CreateVaultRequest = v.InferOutput<typeof CreateVaultRequest>;

/**
 * Perform an action on a signer:
 * - Jail to prevent them from signing transactions.
 * - Unjail to allow them to sign transactions again.
 * @returns {SuccessResponse}
 * @see null
 */
export const CSignerActionRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.union([
                v.object({
                    /** Type of action. */
                    type: v.pipe(
                        v.literal("CSignerAction"),
                        v.description("Type of action."),
                    ),
                    /** Jail the signer. */
                    jailSelf: v.pipe(
                        v.null(),
                        v.description("Jail the signer."),
                    ),
                }),
                v.object({
                    /** Type of action. */
                    type: v.pipe(
                        v.literal("CSignerAction"),
                        v.description("Type of action."),
                    ),
                    /** Unjail the signer. */
                    unjailSelf: v.pipe(
                        v.null(),
                        v.description("Unjail the signer."),
                    ),
                }),
            ]),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description(
        "Perform an action on a signer." +
            "\n- Jail to prevent them from signing transactions." +
            "\n- Unjail to allow them to sign transactions again.",
    ),
);
export type CSignerActionRequest = v.InferOutput<typeof CSignerActionRequest>;

/**
 * Perform an action on a validator:
 * - Change profile information.
 * - Register a new validator.
 * - Unregister an existing validator.
 * @returns {SuccessResponse}
 * @see null
 */
export const CValidatorActionRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.union([
                v.object({
                    /** Type of action. */
                    type: v.pipe(
                        v.literal("CValidatorAction"),
                        v.description("Type of action."),
                    ),
                    /** Profile changes to apply. */
                    changeProfile: v.pipe(
                        v.object({
                            /** Validator node IP address. */
                            node_ip: v.pipe(
                                v.union([
                                    v.object({
                                        /** IP address. */
                                        Ip: v.pipe(
                                            v.string(),
                                            v.ip(),
                                            v.description("IP address."),
                                        ),
                                    }),
                                    v.null(),
                                ]),
                                v.description("Validator node IP address."),
                            ),
                            /** Validator name. */
                            name: v.pipe(
                                v.nullable(v.string()),
                                v.description("Validator name."),
                            ),
                            /** Validator description. */
                            description: v.pipe(
                                v.nullable(v.string()),
                                v.description("Validator description."),
                            ),
                            /** Validator jail status. */
                            unjailed: v.pipe(
                                v.boolean(),
                                v.description("Validator jail status."),
                            ),
                            /** Enable or disable delegations. */
                            disable_delegations: v.pipe(
                                v.nullable(v.boolean()),
                                v.description("Enable or disable delegations."),
                            ),
                            /** Commission rate in basis points (1 = 0.0001%). */
                            commission_bps: v.pipe(
                                v.nullable(UnsignedIntegerMayInputString),
                                v.description("Commission rate in basis points (1 = 0.0001%)."),
                            ),
                            /** Signer address. */
                            signer: v.pipe(
                                v.nullable(v.pipe(Hex, v.length(42))),
                                v.description("Signer address."),
                            ),
                        }),
                        v.description("Profile changes to apply."),
                    ),
                }),
                v.object({
                    /** Type of action. */
                    type: v.pipe(
                        v.literal("CValidatorAction"),
                        v.description("Type of action."),
                    ),
                    /** Registration parameters. */
                    register: v.pipe(
                        v.object({
                            /** Validator profile information. */
                            profile: v.pipe(
                                v.object({
                                    /** Validator node IP address. */
                                    node_ip: v.pipe(
                                        v.object({
                                            /** IP address. */
                                            Ip: v.pipe(
                                                v.string(),
                                                v.ip(),
                                                v.description("IP address."),
                                            ),
                                        }),
                                        v.description("Validator node IP address."),
                                    ),
                                    /** Validator name. */
                                    name: v.pipe(
                                        v.string(),
                                        v.description("Validator name."),
                                    ),
                                    /** Validator description. */
                                    description: v.pipe(
                                        v.string(),
                                        v.description("Validator description."),
                                    ),
                                    /** Whether delegations are disabled. */
                                    delegations_disabled: v.pipe(
                                        v.boolean(),
                                        v.description("Whether delegations are disabled."),
                                    ),
                                    /** Commission rate in basis points (1 = 0.0001%). */
                                    commission_bps: v.pipe(
                                        UnsignedIntegerMayInputString,
                                        v.description("Commission rate in basis points (1 = 0.0001%)."),
                                    ),
                                    /** Signer address. */
                                    signer: v.pipe(
                                        v.pipe(Hex, v.length(42)),
                                        v.description("Signer address."),
                                    ),
                                }),
                                v.description("Validator profile information."),
                            ),
                            /** Initial jail status. */
                            unjailed: v.pipe(
                                v.boolean(),
                                v.description("Initial jail status."),
                            ),
                            /** Initial stake amount in wei. */
                            initial_wei: v.pipe(
                                UnsignedIntegerMayInputString,
                                v.description("Initial stake amount in wei."),
                            ),
                        }),
                        v.description("Registration parameters."),
                    ),
                }),
                v.object({
                    /** Type of action. */
                    type: v.pipe(
                        v.literal("CValidatorAction"),
                        v.description("Type of action."),
                    ),
                    /** Unregister the validator. */
                    unregister: v.pipe(
                        v.null(),
                        v.description("Unregister the validator."),
                    ),
                }),
            ]),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description(
        "Perform an action on a validator:" +
            "\n- Change profile information." +
            "\n- Register a new validator." +
            "\n- Unregister an existing validator.",
    ),
);
export type CValidatorActionRequest = v.InferOutput<typeof CValidatorActionRequest>;

/**
 * Transfer native token from staking into the user spot account.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
 */
export const CWithdrawRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("cWithdraw"),
                    v.description("Type of action."),
                ),
                /** Chain ID used for signing. */
                signatureChainId: v.pipe(
                    Hex,
                    v.description("Chain ID used for signing."),
                ),
                /** HyperLiquid network. */
                hyperliquidChain: v.pipe(
                    v.union([v.literal("Mainnet"), v.literal("Testnet")]),
                    v.description("HyperLiquid network."),
                ),
                /** Amount of wei to withdraw from staking balance (float * 1e8). */
                wei: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Amount of wei to withdraw from staking balance (float * 1e8)."),
                ),
                /** Unique request identifier (current timestamp in ms). */
                nonce: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Unique request identifier (current timestamp in ms)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Transfer native token from staking into the user spot account."),
);
export type CWithdrawRequest = v.InferOutput<typeof CWithdrawRequest>;

/**
 * Configure block type for EVM transactions.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture
 */
export const EvmUserModifyRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("evmUserModify"),
                    v.description("Type of action."),
                ),
                /** `true` for large blocks, `false` for small blocks. */
                usingBigBlocks: v.pipe(
                    v.boolean(),
                    v.description("`true` for large blocks, `false` for small blocks."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Configure block type for EVM transactions."),
);
export type EvmUserModifyRequest = v.InferOutput<typeof EvmUserModifyRequest>;

/**
 * Modify an order.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order
 */
export const ModifyRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("modify"),
                    v.description("Type of action."),
                ),
                /** Order ID or Client Order ID. */
                oid: v.pipe(
                    v.union([
                        UnsignedIntegerMayInputString,
                        v.pipe(Hex, v.length(34)),
                    ]),
                    v.description("Order ID or Client Order ID."),
                ),
                /** New order parameters. */
                order: v.pipe(
                    OrderParams,
                    v.description("New order parameters."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Vault address (for vault trading). */
        vaultAddress: v.pipe(
            v.optional(v.pipe(Hex, v.length(42))),
            v.description("Vault address (for vault trading)."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Modify an order."),
);
export type ModifyRequest = v.InferOutput<typeof ModifyRequest>;

/**
 * This action does not do anything (no operation), but causes the nonce to be marked as used.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#invalidate-pending-nonce-noop
 */
export const NoopRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("noop"),
                    v.description("Type of action."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("This action does not do anything (no operation), but causes the nonce to be marked as used."),
);
export type NoopRequest = v.InferOutput<typeof NoopRequest>;

/**
 * Place an order(s).
 * @returns {OrderResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
 */
export const OrderRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("order"),
                    v.description("Type of action."),
                ),
                /** Order parameters. */
                orders: v.pipe(
                    v.array(OrderParams),
                    v.description("Order parameters."),
                ),
                /**
                 * Order grouping strategy:
                 * - `na`: Standard order without grouping.
                 * - `normalTpsl`: TP/SL order with fixed size that doesn't adjust with position changes.
                 * - `positionTpsl`: TP/SL order that adjusts proportionally with the position size.
                 */
                grouping: v.pipe(
                    v.union([
                        v.literal("na"),
                        v.literal("normalTpsl"),
                        v.literal("positionTpsl"),
                    ]),
                    v.description(
                        "Order grouping strategy:" +
                            "\n- `na`: Standard order without grouping." +
                            "\n- `normalTpsl`: TP/SL order with fixed size that doesn't adjust with position changes." +
                            "\n- `positionTpsl`: TP/SL order that adjusts proportionally with the position size.",
                    ),
                ),
                /** Builder fee. */
                builder: v.pipe(
                    v.optional(v.object({
                        /** Builder address. */
                        b: v.pipe(
                            v.pipe(Hex, v.length(42)),
                            v.description("Builder address."),
                        ),
                        /** Builder fee in 0.1bps (1 = 0.0001%). */
                        f: v.pipe(
                            UnsignedIntegerMayInputString,
                            v.description("Builder fee in 0.1bps (1 = 0.0001%)."),
                        ),
                    })),
                    v.description("Builder fee."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Vault address (for vault trading). */
        vaultAddress: v.pipe(
            v.optional(v.pipe(Hex, v.length(42))),
            v.description("Vault address (for vault trading)."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Place an order(s)."),
);
export type OrderRequest = v.InferOutput<typeof OrderRequest>;

/**
 * Deploying HIP-3 assets:
 * - Register Asset
 * - Set Oracle
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-3-assets
 */
export const PerpDeployRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.union([
                v.pipe(
                    v.object({
                        /** Type of action. */
                        type: v.pipe(
                            v.literal("perpDeploy"),
                            v.description("Type of action."),
                        ),
                        /** Parameters for registering a new perpetual asset. */
                        registerAsset: v.pipe(
                            v.object({
                                /** Max gas in native token wei. If not provided, then uses current deploy auction price. */
                                maxGas: v.pipe(
                                    v.nullable(UnsignedIntegerMayInputString),
                                    v.description(
                                        "Max gas in native token wei. If not provided, then uses current deploy auction price.",
                                    ),
                                ),
                                /** Contains new asset listing parameters. */
                                assetRequest: v.pipe(
                                    v.object({
                                        /** Coin symbol for the new asset. */
                                        coin: v.pipe(
                                            v.string(),
                                            v.description("Coin symbol for the new asset."),
                                        ),
                                        /** Number of decimal places for size. */
                                        szDecimals: v.pipe(
                                            UnsignedIntegerMayInputString,
                                            v.description("Number of decimal places for size."),
                                        ),
                                        /** Initial oracle price for the asset. */
                                        oraclePx: v.pipe(
                                            UnsignedDecimalMayInputNumber,
                                            v.description("Initial oracle price for the asset."),
                                        ),
                                        /** Margin table identifier for risk management. */
                                        marginTableId: v.pipe(
                                            UnsignedIntegerMayInputString,
                                            v.description("Margin table identifier for risk management."),
                                        ),
                                        /** Whether the asset can only be traded with isolated margin. */
                                        onlyIsolated: v.pipe(
                                            v.boolean(),
                                            v.description("Whether the asset can only be traded with isolated margin."),
                                        ),
                                    }),
                                    v.description("Contains new asset listing parameters."),
                                ),
                                /** Name of the dex. */
                                dex: v.pipe(
                                    v.string(),
                                    v.description("Name of the dex."),
                                ),
                                /** Contains new dex parameters. */
                                schema: v.pipe(
                                    v.nullable(v.object({
                                        /** Full name of the dex. */
                                        fullName: v.pipe(
                                            v.string(),
                                            v.description("Full name of the dex."),
                                        ),
                                        /** Collateral token index. */
                                        collateralToken: v.pipe(
                                            UnsignedIntegerMayInputString,
                                            v.description("Collateral token index."),
                                        ),
                                        /** User to update oracles. If not provided, then deployer is assumed to be oracle updater. */
                                        oracleUpdater: v.pipe(
                                            v.nullable(v.pipe(Hex, v.length(42))),
                                            v.description(
                                                "User to update oracles. If not provided, then deployer is assumed to be oracle updater.",
                                            ),
                                        ),
                                    })),
                                    v.description("Contains new dex parameters."),
                                ),
                            }),
                            v.description("Parameters for registering a new perpetual asset."),
                        ),
                    }),
                    v.description("Register asset variant"),
                ),
                v.pipe(
                    v.object({
                        /** Type of action. */
                        type: v.pipe(
                            v.literal("perpDeploy"),
                            v.description("Type of action."),
                        ),
                        /** Parameters for setting oracle and mark prices for assets. */
                        setOracle: v.pipe(
                            v.object({
                                /** Name of the dex. */
                                dex: v.pipe(
                                    v.string(),
                                    v.minLength(1),
                                    v.description("Name of the dex."),
                                ),
                                /** A list (sorted by key) of asset and oracle prices. */
                                oraclePxs: v.pipe(
                                    v.array(v.tuple([v.string(), UnsignedDecimalMayInputNumber])),
                                    v.description("A list (sorted by key) of asset and oracle prices."),
                                ),
                                /** An outer list of inner lists (inner list sorted by key) of asset and mark prices. */
                                markPxs: v.pipe(
                                    v.array(v.array(v.tuple([v.string(), UnsignedDecimalMayInputNumber]))),
                                    v.description(
                                        "An outer list of inner lists (inner list sorted by key) of asset and mark prices.",
                                    ),
                                ),
                            }),
                            v.description("Parameters for setting oracle and mark prices for assets."),
                        ),
                    }),
                    v.description("Set oracle variant"),
                ),
            ]),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description(
        "Deploying HIP-3 assets:" +
            "\n- Register Asset" +
            "\n- Set Oracle",
    ),
);
export type PerpDeployRequest = v.InferOutput<typeof PerpDeployRequest>;

/**
 * Create a referral code.
 * @returns {SuccessResponse}
 * @see null
 */
export const RegisterReferrerRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("registerReferrer"),
                    v.description("Type of action."),
                ),
                /** Referral code to create. */
                code: v.pipe(
                    v.string(),
                    v.minLength(1),
                    v.description("Referral code to create."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Create a referral code."),
);
export type RegisterReferrerRequest = v.InferOutput<typeof RegisterReferrerRequest>;

/**
 * Reserve additional rate-limited actions for a fee.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
 */
export const ReserveRequestWeightRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("reserveRequestWeight"),
                    v.description("Type of action."),
                ),
                /** Amount of request weight to reserve. */
                weight: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Amount of request weight to reserve."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Reserve additional rate-limited actions for a fee."),
);
export type ReserveRequestWeightRequest = v.InferOutput<typeof ReserveRequestWeightRequest>;

/**
 * Schedule a cancel-all operation at a future time.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
 */
export const ScheduleCancelRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("scheduleCancel"),
                    v.description("Type of action."),
                ),
                /**
                 * Scheduled time (in ms since epoch).
                 * Must be at least 5 seconds in the future.
                 *
                 * If not specified, will cause all scheduled cancel operations to be deleted.
                 */
                time: v.pipe(
                    v.optional(UnsignedIntegerMayInputString),
                    v.description(
                        "Scheduled time (in ms since epoch)." +
                            "\nMust be at least 5 seconds in the future." +
                            "\n\nIf not specified, will cause all scheduled cancel operations to be deleted.",
                    ),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Vault address (for vault trading). */
        vaultAddress: v.pipe(
            v.optional(v.pipe(Hex, v.length(42))),
            v.description("Vault address (for vault trading)."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Schedule a cancel-all operation at a future time."),
);
export type ScheduleCancelRequest = v.InferOutput<typeof ScheduleCancelRequest>;

/**
 * Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset-testnet-only
 */
export const SendAssetRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("sendAsset"),
                    v.description("Type of action."),
                ),
                /** Chain ID used for signing. */
                signatureChainId: v.pipe(
                    Hex,
                    v.description("Chain ID used for signing."),
                ),
                /** HyperLiquid network. */
                hyperliquidChain: v.pipe(
                    v.union([v.literal("Mainnet"), v.literal("Testnet")]),
                    v.description("HyperLiquid network."),
                ),
                /** Destination address. */
                destination: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Destination address."),
                ),
                /** Source DEX ("" for default USDC perp DEX, "spot" for spot). */
                sourceDex: v.pipe(
                    v.string(),
                    v.description('Source DEX ("" for default USDC perp DEX, "spot" for spot).'),
                ),
                /** Destination DEX ("" for default USDC perp DEX, "spot" for spot). */
                destinationDex: v.pipe(
                    v.string(),
                    v.description('Destination DEX ("" for default USDC perp DEX, "spot" for spot).'),
                ),
                /** Token identifier. */
                token: v.pipe(
                    TokenId,
                    v.description("Token identifier."),
                ),
                /** Amount to send (not in wei). */
                amount: v.pipe(
                    UnsignedDecimalMayInputNumber,
                    v.description("Amount to send (not in wei)."),
                ),
                /** Source sub-account address ("" for main account). */
                fromSubAccount: v.pipe(
                    v.union([
                        v.literal(""),
                        v.pipe(Hex, v.length(42)),
                    ]),
                    v.description('Source sub-account address ("" for main account).'),
                ),
                /** Unique request identifier (current timestamp in ms). */
                nonce: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Unique request identifier (current timestamp in ms)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts."),
);
export type SendAssetRequest = v.InferOutput<typeof SendAssetRequest>;

/**
 * Set the display name in the leaderboard.
 * @returns {SuccessResponse}
 * @see null
 */
export const SetDisplayNameRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("setDisplayName"),
                    v.description("Type of action."),
                ),
                /**
                 * Display name.
                 *
                 * Set to an empty string to remove the display name.
                 */
                displayName: v.pipe(
                    v.string(),
                    v.description(
                        "Display name." +
                            "\n\nSet to an empty string to remove the display name.",
                    ),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Set the display name in the leaderboard."),
);
export type SetDisplayNameRequest = v.InferOutput<typeof SetDisplayNameRequest>;

/**
 * Set a referral code.
 * @returns {SuccessResponse}
 * @see null
 */
export const SetReferrerRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("setReferrer"),
                    v.description("Type of action."),
                ),
                /** Referral code. */
                code: v.pipe(
                    v.string(),
                    v.minLength(1),
                    v.description("Referral code."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Set a referral code."),
);
export type SetReferrerRequest = v.InferOutput<typeof SetReferrerRequest>;

/**
 * Deploying HIP-1 and HIP-2 assets:
 * - Genesis
 * - Register Hyperliquidity
 * - Register Spot
 * - Register Token2
 * - Set Deployer Trading Fee Share
 * - User Genesis
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export const SpotDeployRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.union([
                v.pipe(
                    v.object({
                        /** Type of action. */
                        type: v.pipe(
                            v.literal("spotDeploy"),
                            v.description("Type of action."),
                        ),
                        /** Genesis parameters. */
                        genesis: v.pipe(
                            v.object({
                                /** Token identifier. */
                                token: v.pipe(
                                    UnsignedIntegerMayInputString,
                                    v.description("Token identifier."),
                                ),
                                /** Maximum token supply. */
                                maxSupply: v.pipe(
                                    UnsignedDecimalMayInputNumber,
                                    v.description("Maximum token supply."),
                                ),
                                /** Set hyperliquidity balance to 0. */
                                noHyperliquidity: v.pipe(
                                    v.optional(v.literal(true)),
                                    v.description("Set hyperliquidity balance to 0."),
                                ),
                            }),
                            v.description("Genesis parameters."),
                        ),
                    }),
                    v.description("Genesis variant"),
                ),
                v.pipe(
                    v.object({
                        /** Type of action. */
                        type: v.pipe(
                            v.literal("spotDeploy"),
                            v.description("Type of action."),
                        ),
                        /** Register hyperliquidity parameters. */
                        registerHyperliquidity: v.pipe(
                            v.object({
                                /** Spot index (distinct from base token index). */
                                spot: v.pipe(
                                    UnsignedIntegerMayInputString,
                                    v.description("Spot index (distinct from base token index)."),
                                ),
                                /** Starting price for liquidity seeding. */
                                startPx: v.pipe(
                                    UnsignedDecimalMayInputNumber,
                                    v.description("Starting price for liquidity seeding."),
                                ),
                                /** Order size as a float (not in wei). */
                                orderSz: v.pipe(
                                    UnsignedDecimalMayInputNumber,
                                    v.description("Order size as a float (not in wei)."),
                                ),
                                /** Total number of orders to place. */
                                nOrders: v.pipe(
                                    UnsignedIntegerMayInputString,
                                    v.description("Total number of orders to place."),
                                ),
                                /** Number of levels to seed with USDC. */
                                nSeededLevels: v.pipe(
                                    v.optional(UnsignedIntegerMayInputString),
                                    v.description("Number of levels to seed with USDC."),
                                ),
                            }),
                            v.description("Register hyperliquidity parameters."),
                        ),
                    }),
                    v.description("Register hyperliquidity variant"),
                ),
                v.pipe(
                    v.object({
                        /** Type of action. */
                        type: v.pipe(
                            v.literal("spotDeploy"),
                            v.description("Type of action."),
                        ),
                        /** Register spot parameters. */
                        registerSpot: v.pipe(
                            v.object({
                                /** Tuple containing base and quote token indices. */
                                tokens: v.pipe(
                                    v.tuple([
                                        UnsignedIntegerMayInputString,
                                        UnsignedIntegerMayInputString,
                                    ]),
                                    v.description("Tuple containing base and quote token indices."),
                                ),
                            }),
                            v.description("Register spot parameters."),
                        ),
                    }),
                    v.description("Register spot variant"),
                ),
                v.pipe(
                    v.object({
                        /** Type of action. */
                        type: v.pipe(
                            v.literal("spotDeploy"),
                            v.description("Type of action."),
                        ),
                        /** Register token parameters. */
                        registerToken2: v.pipe(
                            v.object({
                                /** Token specifications. */
                                spec: v.pipe(
                                    v.object({
                                        /** Token name. */
                                        name: v.pipe(
                                            v.string(),
                                            v.description("Token name."),
                                        ),
                                        /** Number of decimals for token size. */
                                        szDecimals: v.pipe(
                                            UnsignedIntegerMayInputString,
                                            v.description("Number of decimals for token size."),
                                        ),
                                        /** Number of decimals for token amounts in wei. */
                                        weiDecimals: v.pipe(
                                            UnsignedIntegerMayInputString,
                                            v.description("Number of decimals for token amounts in wei."),
                                        ),
                                    }),
                                    v.description("Token specifications."),
                                ),
                                /** Maximum gas allowed for registration. */
                                maxGas: v.pipe(
                                    UnsignedIntegerMayInputString,
                                    v.description("Maximum gas allowed for registration."),
                                ),
                                /** Optional full token name. */
                                fullName: v.pipe(
                                    v.optional(v.string()),
                                    v.description("Optional full token name."),
                                ),
                            }),
                            v.description("Register token parameters."),
                        ),
                    }),
                    v.description("Register token variant"),
                ),
                v.pipe(
                    v.object({
                        /** Type of action. */
                        type: v.pipe(
                            v.literal("spotDeploy"),
                            v.description("Type of action."),
                        ),
                        /** Set deployer trading fee share parameters. */
                        setDeployerTradingFeeShare: v.pipe(
                            v.object({
                                /** Token identifier. */
                                token: v.pipe(
                                    UnsignedIntegerMayInputString,
                                    v.description("Token identifier."),
                                ),
                                /** The deployer trading fee share. Range is 0% to 100%. */
                                share: v.pipe(
                                    Percent,
                                    v.description("The deployer trading fee share. Range is 0% to 100%."),
                                ),
                            }),
                            v.description("Set deployer trading fee share parameters."),
                        ),
                    }),
                    v.description("Set deployer trading fee share variant"),
                ),
                v.pipe(
                    v.object({
                        /** Type of action. */
                        type: v.pipe(
                            v.literal("spotDeploy"),
                            v.description("Type of action."),
                        ),
                        /** User genesis parameters. */
                        userGenesis: v.pipe(
                            v.object({
                                /** Token identifier. */
                                token: v.pipe(
                                    UnsignedIntegerMayInputString,
                                    v.description("Token identifier."),
                                ),
                                /** Array of tuples: [user address, genesis amount in wei]. */
                                userAndWei: v.pipe(
                                    v.array(v.tuple([v.pipe(Hex, v.length(42)), UnsignedDecimalMayInputNumber])),
                                    v.description("Array of tuples: [user address, genesis amount in wei]."),
                                ),
                                /** Array of tuples: [existing token identifier, genesis amount in wei]. */
                                existingTokenAndWei: v.pipe(
                                    v.array(
                                        v.tuple([
                                            UnsignedIntegerMayInputString,
                                            UnsignedDecimalMayInputNumber,
                                        ]),
                                    ),
                                    v.description(
                                        "Array of tuples: [existing token identifier, genesis amount in wei].",
                                    ),
                                ),
                                /** Array of tuples: [user address, blacklist status] (`true` for blacklist, `false` to remove existing blacklisted user). */
                                blacklistUsers: v.pipe(
                                    v.optional(v.array(v.tuple([v.pipe(Hex, v.length(42)), v.boolean()]))),
                                    v.description(
                                        "Array of tuples: [user address, blacklist status] (`true` for blacklist, `false` to remove existing blacklisted user).",
                                    ),
                                ),
                            }),
                            v.description("User genesis parameters."),
                        ),
                    }),
                    v.description("User genesis variant"),
                ),
            ]),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description(
        "Deploying HIP-1 and HIP-2 assets:" +
            "\n- Genesis" +
            "\n- Register Hyperliquidity" +
            "\n- Register Spot" +
            "\n- Register Token2" +
            "\n- Set Deployer Trading Fee Share" +
            "\n- User Genesis",
    ),
);
export type SpotDeployRequest = v.InferOutput<typeof SpotDeployRequest>;

/**
 * Send spot assets to another address.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
 */
export const SpotSendRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("spotSend"),
                    v.description("Type of action."),
                ),
                /** Chain ID used for signing. */
                signatureChainId: v.pipe(
                    Hex,
                    v.description("Chain ID used for signing."),
                ),
                /** HyperLiquid network. */
                hyperliquidChain: v.pipe(
                    v.union([v.literal("Mainnet"), v.literal("Testnet")]),
                    v.description("HyperLiquid network."),
                ),
                /** Destination address. */
                destination: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Destination address."),
                ),
                /** Token identifier. */
                token: v.pipe(
                    TokenId,
                    v.description("Token identifier."),
                ),
                /** Amount to send (not in wei). */
                amount: v.pipe(
                    UnsignedDecimalMayInputNumber,
                    v.description("Amount to send (not in wei)."),
                ),
                /** Unique request identifier (current timestamp in ms). */
                time: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Unique request identifier (current timestamp in ms)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Send spot assets to another address."),
);
export type SpotSendRequest = v.InferOutput<typeof SpotSendRequest>;

/**
 * Opt Out of Spot Dusting.
 * @returns {SuccessResponse}
 * @see null
 */
export const SpotUserRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("spotUser"),
                    v.description("Type of action."),
                ),
                /** Spot dusting options. */
                toggleSpotDusting: v.pipe(
                    v.object({
                        /** Opt out of spot dusting. */
                        optOut: v.pipe(
                            v.boolean(),
                            v.description("Opt out of spot dusting."),
                        ),
                    }),
                    v.description("Spot dusting options."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Opt Out of Spot Dusting."),
);
export type SpotUserRequest = v.InferOutput<typeof SpotUserRequest>;

/**
 * Modify a sub-account.
 * @returns {SuccessResponse}
 * @see null
 */
export const SubAccountModifyRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("subAccountModify"),
                    v.description("Type of action."),
                ),
                /** Sub-account address to modify. */
                subAccountUser: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Sub-account address to modify."),
                ),
                /** New sub-account name. */
                name: v.pipe(
                    v.string(),
                    v.minLength(1),
                    v.description("New sub-account name."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Modify a sub-account."),
);
export type SubAccountModifyRequest = v.InferOutput<typeof SubAccountModifyRequest>;

/**
 * Transfer between sub-accounts (spot).
 * @returns {SuccessResponse}
 * @see null
 */
export const SubAccountSpotTransferRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("subAccountSpotTransfer"),
                    v.description("Type of action."),
                ),
                /** Sub-account address. */
                subAccountUser: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Sub-account address."),
                ),
                /** `true` for deposit, `false` for withdrawal. */
                isDeposit: v.pipe(
                    v.boolean(),
                    v.description("`true` for deposit, `false` for withdrawal."),
                ),
                /** Token identifier. */
                token: v.pipe(
                    TokenId,
                    v.description("Token identifier."),
                ),
                /** Amount to send (not in wei). */
                amount: v.pipe(
                    UnsignedDecimalMayInputNumber,
                    v.description("Amount to send (not in wei)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Transfer between sub-accounts (spot)."),
);
export type SubAccountSpotTransferRequest = v.InferOutput<typeof SubAccountSpotTransferRequest>;

/**
 * Transfer between sub-accounts (perpetual).
 * @returns {SuccessResponse}
 * @see null
 */
export const SubAccountTransferRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("subAccountTransfer"),
                    v.description("Type of action."),
                ),
                /** Sub-account address. */
                subAccountUser: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Sub-account address."),
                ),
                /** `true` for deposit, `false` for withdrawal. */
                isDeposit: v.pipe(
                    v.boolean(),
                    v.description("`true` for deposit, `false` for withdrawal."),
                ),
                /** Amount to transfer (float * 1e6). */
                usd: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Amount to transfer (float * 1e6)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Transfer between sub-accounts (perpetual)."),
);
export type SubAccountTransferRequest = v.InferOutput<typeof SubAccountTransferRequest>;

/**
 * Delegate or undelegate native tokens to or from a validator.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
 */
export const TokenDelegateRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("tokenDelegate"),
                    v.description("Type of action."),
                ),
                /** Chain ID used for signing. */
                signatureChainId: v.pipe(
                    Hex,
                    v.description("Chain ID used for signing."),
                ),
                /** HyperLiquid network. */
                hyperliquidChain: v.pipe(
                    v.union([v.literal("Mainnet"), v.literal("Testnet")]),
                    v.description("HyperLiquid network."),
                ),
                /** Validator address. */
                validator: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Validator address."),
                ),
                /** Amount for delegate/undelegate (float * 1e8). */
                wei: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Amount for delegate/undelegate (float * 1e8)."),
                ),
                /** `true` for undelegate, `false` for delegate. */
                isUndelegate: v.pipe(
                    v.boolean(),
                    v.description("`true` for undelegate, `false` for delegate."),
                ),
                /** Unique request identifier (current timestamp in ms). */
                nonce: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Unique request identifier (current timestamp in ms)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Delegate or undelegate native tokens to or from a validator."),
);
export type TokenDelegateRequest = v.InferOutput<typeof TokenDelegateRequest>;

/**
 * Cancel a TWAP order.
 * @returns {TwapCancelResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
 */
export const TwapCancelRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("twapCancel"),
                    v.description("Type of action."),
                ),
                /** Asset ID. */
                a: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Asset ID."),
                ),
                /** Twap ID. */
                t: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Twap ID."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Vault address (for vault trading). */
        vaultAddress: v.pipe(
            v.optional(v.pipe(Hex, v.length(42))),
            v.description("Vault address (for vault trading)."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Cancel a TWAP order."),
);
export type TwapCancelRequest = v.InferOutput<typeof TwapCancelRequest>;

/**
 * Place a TWAP order.
 * @returns {TwapOrderResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
 */
export const TwapOrderRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("twapOrder"),
                    v.description("Type of action."),
                ),
                /** Twap parameters. */
                twap: v.pipe(
                    v.object({
                        /** Asset ID. */
                        a: v.pipe(
                            UnsignedIntegerMayInputString,
                            v.description("Asset ID."),
                        ),
                        /** Position side (`true` for long, `false` for short). */
                        b: v.pipe(
                            v.boolean(),
                            v.description("Position side (`true` for long, `false` for short)."),
                        ),
                        /** Size (in base currency units). */
                        s: v.pipe(
                            UnsignedDecimalMayInputNumber,
                            v.description("Size (in base currency units)."),
                        ),
                        /** Is reduce-only? */
                        r: v.pipe(
                            v.boolean(),
                            v.description("Is reduce-only?"),
                        ),
                        /** TWAP duration in minutes. */
                        m: v.pipe(
                            UnsignedIntegerMayInputString,
                            v.description("TWAP duration in minutes."),
                        ),
                        /** Enable random order timing. */
                        t: v.pipe(
                            v.boolean(),
                            v.description("Enable random order timing."),
                        ),
                    }),
                    v.description("Twap parameters."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Vault address (for vault trading). */
        vaultAddress: v.pipe(
            v.optional(v.pipe(Hex, v.length(42))),
            v.description("Vault address (for vault trading)."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Place a TWAP order."),
);
export type TwapOrderRequest = v.InferOutput<typeof TwapOrderRequest>;

/**
 * Add or remove margin from isolated position.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export const UpdateIsolatedMarginRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("updateIsolatedMargin"),
                    v.description("Type of action."),
                ),
                /** Asset ID. */
                asset: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Asset ID."),
                ),
                /** Position side (`true` for long, `false` for short). */
                isBuy: v.pipe(
                    v.boolean(),
                    v.description("Position side (`true` for long, `false` for short)."),
                ),
                /** Amount to adjust (float * 1e6). */
                ntli: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Amount to adjust (float * 1e6)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Vault address (for vault trading). */
        vaultAddress: v.pipe(
            v.optional(v.pipe(Hex, v.length(42))),
            v.description("Vault address (for vault trading)."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Add or remove margin from isolated position."),
);
export type UpdateIsolatedMarginRequest = v.InferOutput<typeof UpdateIsolatedMarginRequest>;

/**
 * Update cross or isolated leverage on a coin.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
 */
export const UpdateLeverageRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("updateLeverage"),
                    v.description("Type of action."),
                ),
                /** Asset ID. */
                asset: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Asset ID."),
                ),
                /** `true` for cross leverage, `false` for isolated leverage. */
                isCross: v.pipe(
                    v.boolean(),
                    v.description("`true` for cross leverage, `false` for isolated leverage."),
                ),
                /** New leverage value. */
                leverage: v.pipe(
                    v.pipe(UnsignedIntegerMayInputString, v.minValue(1)),
                    v.description("New leverage value."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Vault address (for vault trading). */
        vaultAddress: v.pipe(
            v.optional(v.pipe(Hex, v.length(42))),
            v.description("Vault address (for vault trading)."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Update cross or isolated leverage on a coin."),
);
export type UpdateLeverageRequest = v.InferOutput<typeof UpdateLeverageRequest>;

/**
 * Transfer funds between Spot account and Perp account.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
 */
export const UsdClassTransferRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("usdClassTransfer"),
                    v.description("Type of action."),
                ),
                /** Chain ID used for signing. */
                signatureChainId: v.pipe(
                    Hex,
                    v.description("Chain ID used for signing."),
                ),
                /** HyperLiquid network. */
                hyperliquidChain: v.pipe(
                    v.union([v.literal("Mainnet"), v.literal("Testnet")]),
                    v.description("HyperLiquid network."),
                ),
                /** Amount to transfer (1 = 1$). */
                amount: v.pipe(
                    UnsignedDecimalMayInputNumber,
                    v.description("Amount to transfer (1 = 1$)."),
                ),
                /** `true` for Spot to Perp, `false` for Perp to Spot. */
                toPerp: v.pipe(
                    v.boolean(),
                    v.description("`true` for Spot to Perp, `false` for Perp to Spot."),
                ),
                /** Unique request identifier (current timestamp in ms). */
                nonce: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Unique request identifier (current timestamp in ms)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Transfer funds between Spot account and Perp account."),
);
export type UsdClassTransferRequest = v.InferOutput<typeof UsdClassTransferRequest>;

/**
 * Send usd to another address.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer
 */
export const UsdSendRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("usdSend"),
                    v.description("Type of action."),
                ),
                /** Chain ID used for signing. */
                signatureChainId: v.pipe(
                    Hex,
                    v.description("Chain ID used for signing."),
                ),
                /** HyperLiquid network. */
                hyperliquidChain: v.pipe(
                    v.union([v.literal("Mainnet"), v.literal("Testnet")]),
                    v.description("HyperLiquid network."),
                ),
                /** Destination address. */
                destination: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Destination address."),
                ),
                /** Amount to send (1 = 1$). */
                amount: v.pipe(
                    UnsignedDecimalMayInputNumber,
                    v.description("Amount to send (1 = 1$)."),
                ),
                /** Unique request identifier (current timestamp in ms). */
                time: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Unique request identifier (current timestamp in ms)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Send usd to another address."),
);
export type UsdSendRequest = v.InferOutput<typeof UsdSendRequest>;

/**
 * Distribute funds from a vault between followers.
 * @returns {SuccessResponse}
 * @see null
 */
export const VaultDistributeRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("vaultDistribute"),
                    v.description("Type of action."),
                ),
                /** Vault address. */
                vaultAddress: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Vault address."),
                ),
                /**
                 * Amount to distribute (float * 1e6).
                 *
                 * Set to 0 to close the vault.
                 */
                usd: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description(
                        "Amount to distribute (float * 1e6)." +
                            "\n\nSet to 0 to close the vault.",
                    ),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Distribute funds from a vault between followers."),
);
export type VaultDistributeRequest = v.InferOutput<typeof VaultDistributeRequest>;

/**
 * Modify a vault configuration.
 * @returns {SuccessResponse}
 * @see null
 */
export const VaultModifyRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("vaultModify"),
                    v.description("Type of action."),
                ),
                /** Vault address. */
                vaultAddress: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Vault address."),
                ),
                /** Allow deposits from followers. */
                allowDeposits: v.pipe(
                    v.nullable(v.boolean()),
                    v.description("Allow deposits from followers."),
                ),
                /** Always close positions on withdrawal. */
                alwaysCloseOnWithdraw: v.pipe(
                    v.nullable(v.boolean()),
                    v.description("Always close positions on withdrawal."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Modify a vault configuration."),
);
export type VaultModifyRequest = v.InferOutput<typeof VaultModifyRequest>;

/**
 * Deposit or withdraw from a vault.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
 */
export const VaultTransferRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("vaultTransfer"),
                    v.description("Type of action."),
                ),
                /** Vault address. */
                vaultAddress: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Vault address."),
                ),
                /** `true` for deposit, `false` for withdrawal. */
                isDeposit: v.pipe(
                    v.boolean(),
                    v.description("`true` for deposit, `false` for withdrawal."),
                ),
                /** Amount for deposit/withdrawal (float * 1e6). */
                usd: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Amount for deposit/withdrawal (float * 1e6)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Deposit or withdraw from a vault."),
);
export type VaultTransferRequest = v.InferOutput<typeof VaultTransferRequest>;

/**
 * Initiate a withdrawal request.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
 */
export const Withdraw3Request = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("withdraw3"),
                    v.description("Type of action."),
                ),
                /** Chain ID used for signing. */
                signatureChainId: v.pipe(
                    Hex,
                    v.description("Chain ID used for signing."),
                ),
                /** HyperLiquid network. */
                hyperliquidChain: v.pipe(
                    v.union([v.literal("Mainnet"), v.literal("Testnet")]),
                    v.description("HyperLiquid network."),
                ),
                /** Destination address. */
                destination: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Destination address."),
                ),
                /** Amount to withdraw (1 = 1$). */
                amount: v.pipe(
                    UnsignedDecimalMayInputNumber,
                    v.description("Amount to withdraw (1 = 1$)."),
                ),
                /** Unique request identifier (current timestamp in ms). */
                time: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Unique request identifier (current timestamp in ms)."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("Initiate a withdrawal request."),
);
export type Withdraw3Request = v.InferOutput<typeof Withdraw3Request>;

/**
 * A multi-signature request.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
 */
export const MultiSigRequest = v.pipe(
    v.object({
        /** Action to perform. */
        action: v.pipe(
            v.object({
                /** Type of action. */
                type: v.pipe(
                    v.literal("multiSig"),
                    v.description("Type of action."),
                ),
                /** Chain ID used for signing. */
                signatureChainId: v.pipe(
                    Hex,
                    v.description("Chain ID used for signing."),
                ),
                /** List of signatures from authorized signers. */
                signatures: v.pipe(
                    v.array(Signature),
                    v.description("List of signatures from authorized signers."),
                ),
                /** Multi-signature payload information. */
                payload: v.pipe(
                    v.object({
                        /** Address of the multi-signature user account. */
                        multiSigUser: v.pipe(
                            v.pipe(Hex, v.length(42)),
                            v.description("Address of the multi-signature user account."),
                        ),
                        /** Address of the authorized user initiating the request (any authorized user). */
                        outerSigner: v.pipe(
                            v.pipe(Hex, v.length(42)),
                            v.description(
                                "Address of the authorized user initiating the request (any authorized user).",
                            ),
                        ),
                        /** The underlying action to be executed through multi-sig. */
                        action: v.pipe(
                            v.union([
                                ApproveAgentRequest.entries.action,
                                ApproveBuilderFeeRequest.entries.action,
                                BatchModifyRequest.entries.action,
                                CancelRequest.entries.action,
                                CancelByCloidRequest.entries.action,
                                CDepositRequest.entries.action,
                                ClaimRewardsRequest.entries.action,
                                ConvertToMultiSigUserRequest.entries.action,
                                CreateSubAccountRequest.entries.action,
                                CreateVaultRequest.entries.action,
                                CSignerActionRequest.entries.action,
                                CValidatorActionRequest.entries.action,
                                CWithdrawRequest.entries.action,
                                EvmUserModifyRequest.entries.action,
                                ModifyRequest.entries.action,
                                NoopRequest.entries.action,
                                OrderRequest.entries.action,
                                PerpDeployRequest.entries.action,
                                RegisterReferrerRequest.entries.action,
                                ReserveRequestWeightRequest.entries.action,
                                ScheduleCancelRequest.entries.action,
                                SendAssetRequest.entries.action,
                                SetDisplayNameRequest.entries.action,
                                SetReferrerRequest.entries.action,
                                SpotDeployRequest.entries.action,
                                SpotSendRequest.entries.action,
                                SpotUserRequest.entries.action,
                                SubAccountModifyRequest.entries.action,
                                SubAccountSpotTransferRequest.entries.action,
                                SubAccountTransferRequest.entries.action,
                                TokenDelegateRequest.entries.action,
                                TwapCancelRequest.entries.action,
                                TwapOrderRequest.entries.action,
                                UpdateIsolatedMarginRequest.entries.action,
                                UpdateLeverageRequest.entries.action,
                                UsdClassTransferRequest.entries.action,
                                UsdSendRequest.entries.action,
                                VaultDistributeRequest.entries.action,
                                VaultModifyRequest.entries.action,
                                VaultTransferRequest.entries.action,
                                Withdraw3Request.entries.action,
                            ]),
                            v.description("The underlying action to be executed through multi-sig."),
                        ),
                    }),
                    v.description("Multi-signature payload information."),
                ),
            }),
            v.description("Action to perform."),
        ),
        /** Unique request identifier (current timestamp in ms). */
        nonce: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Unique request identifier (current timestamp in ms)."),
        ),
        /** Cryptographic signature. */
        signature: v.pipe(
            Signature,
            v.description("Cryptographic signature."),
        ),
        /** Vault address (for vault trading). */
        vaultAddress: v.pipe(
            v.optional(v.pipe(Hex, v.length(42))),
            v.description("Vault address (for vault trading)."),
        ),
        /** Expiration time of the action. */
        expiresAfter: v.pipe(
            v.optional(UnsignedIntegerMayInputString),
            v.description("Expiration time of the action."),
        ),
    }),
    v.transform(removeUndefinedKeys),
    v.description("A multi-signature request."),
);
export type MultiSigRequest = v.InferOutput<typeof MultiSigRequest>;
