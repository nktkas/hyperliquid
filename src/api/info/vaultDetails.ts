import * as v from "valibot";
import { Address, Decimal, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

import { PortfolioResponse } from "./portfolio.ts";

// -------------------- Schemas --------------------

/**
 * Request details of a vault.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
 */
export const VaultDetailsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("vaultDetails"),
        v.description("Type of request."),
      ),
      /** Vault address. */
      vaultAddress: v.pipe(
        Address,
        v.description("Vault address."),
      ),
      /** User address. */
      user: v.pipe(
        v.nullish(Address),
        v.description("User address."),
      ),
    }),
    v.description("Request details of a vault."),
  );
})();
export type VaultDetailsRequest = v.InferOutput<typeof VaultDetailsRequest>;

/**
 * Details of a vault or null if the vault does not exist.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
 */
export const VaultDetailsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.nullable(
      v.object({
        /** Vault name. */
        name: v.pipe(
          v.string(),
          v.description("Vault name."),
        ),
        /** Vault address. */
        vaultAddress: v.pipe(
          Address,
          v.description("Vault address."),
        ),
        /** Leader address. */
        leader: v.pipe(
          Address,
          v.description("Leader address."),
        ),
        /** Vault description. */
        description: v.pipe(
          v.string(),
          v.description("Vault description."),
        ),
        /** Vault portfolio metrics grouped by time periods. */
        portfolio: v.pipe(
          PortfolioResponse,
          v.description("Vault portfolio metrics grouped by time periods."),
        ),
        /** Annual percentage rate. */
        apr: v.pipe(
          v.number(),
          v.description("Annual percentage rate."),
        ),
        /** Current user follower state */
        followerState: v.pipe(
          v.nullable(
            v.object({
              /** Follower address. */
              user: v.pipe(
                Address,
                v.description("Follower address."),
              ),
              /** Follower vault equity. */
              vaultEquity: v.pipe(
                UnsignedDecimal,
                v.description("Follower vault equity."),
              ),
              /** Current profit and loss. */
              pnl: v.pipe(
                Decimal,
                v.description("Current profit and loss."),
              ),
              /** All-time profit and loss. */
              allTimePnl: v.pipe(
                Decimal,
                v.description("All-time profit and loss."),
              ),
              /** Subscription duration in days. */
              daysFollowing: v.pipe(
                UnsignedInteger,
                v.description("Subscription duration in days."),
              ),
              /** Vault entry timestamp. */
              vaultEntryTime: v.pipe(
                UnsignedInteger,
                v.description("Vault entry timestamp."),
              ),
              /** Timestamp when funds become unlocked. */
              lockupUntil: v.pipe(
                UnsignedInteger,
                v.description("Timestamp when funds become unlocked."),
              ),
            }),
          ),
          v.description("Current user follower state"),
        ),
        /** Ownership percentage held by leader. */
        leaderFraction: v.pipe(
          v.number(),
          v.description("Ownership percentage held by leader."),
        ),
        /** Leader commission percentage. */
        leaderCommission: v.pipe(
          v.number(),
          v.description("Leader commission percentage."),
        ),
        /** Array of vault followers. */
        followers: v.pipe(
          v.array(
            /** Vault follower state. */
            v.pipe(
              v.object({
                /** Follower address or Leader. */
                user: v.pipe(
                  v.union([Address, v.literal("Leader")]),
                  v.description("Follower address or Leader."),
                ),
                /** Follower vault equity. */
                vaultEquity: v.pipe(
                  UnsignedDecimal,
                  v.description("Follower vault equity."),
                ),
                /** Current profit and loss. */
                pnl: v.pipe(
                  Decimal,
                  v.description("Current profit and loss."),
                ),
                /** All-time profit and loss. */
                allTimePnl: v.pipe(
                  Decimal,
                  v.description("All-time profit and loss."),
                ),
                /** Subscription duration in days. */
                daysFollowing: v.pipe(
                  UnsignedInteger,
                  v.description("Subscription duration in days."),
                ),
                /** Vault entry timestamp. */
                vaultEntryTime: v.pipe(
                  UnsignedInteger,
                  v.description("Vault entry timestamp."),
                ),
                /** Timestamp when funds become unlocked. */
                lockupUntil: v.pipe(
                  UnsignedInteger,
                  v.description("Timestamp when funds become unlocked."),
                ),
              }),
              v.description("Vault follower state."),
            ),
          ),
          v.description("Array of vault followers."),
        ),
        /** Maximum distributable amount. */
        maxDistributable: v.pipe(
          v.number(),
          v.description("Maximum distributable amount."),
        ),
        /** Maximum withdrawable amount. */
        maxWithdrawable: v.pipe(
          v.number(),
          v.description("Maximum withdrawable amount."),
        ),
        /** Vault closure status. */
        isClosed: v.pipe(
          v.boolean(),
          v.description("Vault closure status."),
        ),
        /** Vault relationship type. */
        relationship: v.pipe(
          v.variant("type", [
            v.object({
              /** Relationship type. */
              type: v.pipe(
                v.union([v.literal("normal"), v.literal("child")]),
                v.description("Relationship type."),
              ),
            }),
            v.object({
              /** Relationship type. */
              type: v.pipe(
                v.literal("parent"),
                v.description("Relationship type."),
              ),
              /** Child vault information. */
              data: v.pipe(
                v.object({
                  /** Child vault addresses. */
                  childAddresses: v.pipe(
                    v.array(Address),
                    v.description("Child vault addresses."),
                  ),
                }),
                v.description("Child vault information."),
              ),
            }),
          ]),
          v.description("Vault relationship type."),
        ),
        /** Deposit permission status. */
        allowDeposits: v.pipe(
          v.boolean(),
          v.description("Deposit permission status."),
        ),
        /** Position closure policy on withdrawal. */
        alwaysCloseOnWithdraw: v.pipe(
          v.boolean(),
          v.description("Position closure policy on withdrawal."),
        ),
      }),
    ),
    v.description("Details of a vault or null if the vault does not exist."),
  );
})();
export type VaultDetailsResponse = v.InferOutput<typeof VaultDetailsResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode vaultDetails} function. */
export type VaultDetailsParameters = Omit<v.InferInput<typeof VaultDetailsRequest>, "type">;

/**
 * Request details of a vault.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Details of a vault or null if the vault does not exist.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { vaultDetails } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await vaultDetails(
 *   { transport },
 *   { vaultAddress: "0x..." },
 * );
 * ```
 */
export function vaultDetails(
  config: InfoRequestConfig,
  params: DeepImmutable<VaultDetailsParameters>,
  signal?: AbortSignal,
): Promise<VaultDetailsResponse> {
  const request = parser(VaultDetailsRequest)({
    type: "vaultDetails",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
