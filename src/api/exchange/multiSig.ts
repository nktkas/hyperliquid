import { Address, type DeepImmutable, Hex, parser, UnsignedInteger } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  executeMultiSigAction,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  getSignatureChainId,
  Signature,
} from "./_base.ts";
import * as v from "valibot";

import { ApproveAgentRequest } from "./approveAgent.ts";
import { ApproveBuilderFeeRequest } from "./approveBuilderFee.ts";
import { BatchModifyRequest } from "./batchModify.ts";
import { CancelRequest, CancelSuccessResponse } from "./cancel.ts";
import { CancelByCloidRequest } from "./cancelByCloid.ts";
import { ClaimRewardsRequest } from "./claimRewards.ts";
import { CDepositRequest } from "./cDeposit.ts";
import { ConvertToMultiSigUserRequest } from "./convertToMultiSigUser.ts";
import { CreateSubAccountRequest, CreateSubAccountResponse } from "./createSubAccount.ts";
import { CreateVaultRequest, CreateVaultResponse } from "./createVault.ts";
import { CSignerActionRequest } from "./cSignerAction.ts";
import { CValidatorActionRequest } from "./cValidatorAction.ts";
import { CWithdrawRequest } from "./cWithdraw.ts";
import { EvmUserModifyRequest } from "./evmUserModify.ts";
import { ModifyRequest } from "./modify.ts";
import { NoopRequest } from "./noop.ts";
import { OrderRequest, OrderSuccessResponse } from "./order.ts";
import { RegisterReferrerRequest } from "./registerReferrer.ts";
import { ReserveRequestWeightRequest } from "./reserveRequestWeight.ts";
import { ScheduleCancelRequest } from "./scheduleCancel.ts";
import { SetDisplayNameRequest } from "./setDisplayName.ts";
import { SetReferrerRequest } from "./setReferrer.ts";
import { SpotDeployRequest } from "./spotDeploy.ts";
import { SubAccountModifyRequest } from "./subAccountModify.ts";
import { TokenDelegateRequest } from "./tokenDelegate.ts";
import { TwapOrderRequest, TwapOrderSuccessResponse } from "./twapOrder.ts";
import { UsdClassTransferRequest } from "./usdClassTransfer.ts";
import { VaultDistributeRequest } from "./vaultDistribute.ts";
import { Withdraw3Request } from "./withdraw3.ts";
import { PerpDeployRequest } from "./perpDeploy.ts";
import { SendAssetRequest } from "./sendAsset.ts";
import { SpotSendRequest } from "./spotSend.ts";
import { SpotUserRequest } from "./spotUser.ts";
import { SubAccountSpotTransferRequest } from "./subAccountSpotTransfer.ts";
import { SubAccountTransferRequest } from "./subAccountTransfer.ts";
import { TwapCancelRequest, TwapCancelSuccessResponse } from "./twapCancel.ts";
import { UpdateIsolatedMarginRequest } from "./updateIsolatedMargin.ts";
import { UpdateLeverageRequest } from "./updateLeverage.ts";
import { UsdSendRequest } from "./usdSend.ts";
import { VaultModifyRequest } from "./vaultModify.ts";
import { VaultTransferRequest } from "./vaultTransfer.ts";

// -------------------- Schemas --------------------

/**
 * A multi-signature request.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
 */
export const MultiSigRequest = /* @__PURE__ */ (() => {
  return v.pipe(
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
                Address,
                v.description("Address of the multi-signature user account."),
              ),
              /** Address of the authorized user initiating the request (any authorized user). */
              outerSigner: v.pipe(
                Address,
                v.description(
                  "Address of the authorized user initiating the request (any authorized user).",
                ),
              ),
              /** The underlying action to be executed through multi-sig. */
              action: v.pipe(
                v.variant("type", [
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
        UnsignedInteger,
        v.description("Unique request identifier (current timestamp in ms)."),
      ),
      /** Cryptographic signature. */
      signature: v.pipe(
        Signature,
        v.description("Cryptographic signature."),
      ),
      /** Vault address (for vault trading). */
      vaultAddress: v.pipe(
        v.optional(Address),
        v.description("Vault address (for vault trading)."),
      ),
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("A multi-signature request."),
  );
})();
export type MultiSigRequest = v.InferOutput<typeof MultiSigRequest>;

import { SuccessResponse } from "./_base.ts";
export {
  CancelSuccessResponse,
  CreateSubAccountResponse,
  CreateVaultResponse,
  OrderSuccessResponse,
  SuccessResponse,
  TwapCancelSuccessResponse,
  TwapOrderSuccessResponse,
};

// -------------------- Function --------------------

/** Action parameters for the {@linkcode multiSig} function. */
export type MultiSigParameters =
  & ExtractRequestAction<v.InferInput<typeof MultiSigRequest>>
  & Pick<v.InferInput<typeof MultiSigRequest>, "nonce">;
/** Request options for the {@linkcode multiSig} function. */
export type MultiSigOptions = ExtractRequestOptions<v.InferInput<typeof MultiSigRequest>>;

/** EIP-712 types for the {@linkcode multiSig} function. */
export const MultiSigTypes = {
  "HyperliquidTransaction:SendMultiSig": [
    { name: "hyperliquidChain", type: "string" },
    { name: "multiSigActionHash", type: "bytes32" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * A multi-signature request.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Any successful response.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { multiSig, parser, ScheduleCancelRequest } from "@nktkas/hyperliquid/api/exchange";
 * import { signL1Action } from "@nktkas/hyperliquid/signing";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const multiSigUser = "0x...";
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const nonce = Date.now();
 * const action = parser(ScheduleCancelRequest.entries.action)({
 *   type: "scheduleCancel",
 *   time: Date.now() + 10000,
 * });
 *
 * // Create the required number of signatures
 * const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
 *   return await signL1Action({
 *     wallet: privateKeyToAccount(signerPrivKey as `0x${string}`), // viem or ethers
 *     action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), action],
 *     nonce,
 *   });
 * }));
 *
 * // // or user-signed action
 * // const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
 * //   return await signUserSignedAction({
 * //     wallet: privateKeyToAccount(signerPrivKey as `0x${string}`), // viem or ethers
 * //     action: {
 * //       ...action,
 * //       payloadMultiSigUser: multiSigUser,
 * //       outerSigner: wallet.address,
 * //     },
 * //     types: SomeTypes,
 * //   });
 * // }));
 *
 * // Then use signatures in the `multiSig` action
 * const data = await multiSig(
 *   { transport, wallet },
 *   {
 *     signatures,
 *     payload: {
 *       multiSigUser,
 *       outerSigner: wallet.address,
 *       action,
 *     },
 *     nonce,
 *   },
 * );
 * ```
 */
export async function multiSig<
  T extends
    | SuccessResponse
    | CancelSuccessResponse
    | CreateSubAccountResponse
    | CreateVaultResponse
    | OrderSuccessResponse
    | TwapOrderSuccessResponse
    | TwapCancelSuccessResponse,
>(
  config: ExchangeRequestConfig,
  paramsAndNonce: DeepImmutable<MultiSigParameters>,
  opts?: MultiSigOptions,
): Promise<T> {
  const { nonce, ...params } = paramsAndNonce;

  const action = parser(MultiSigRequest.entries.action)({
    type: "multiSig",
    signatureChainId: await getSignatureChainId(config),
    ...params,
  });
  const vaultAddress = opts?.vaultAddress ?? config.defaultVaultAddress;
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeMultiSigAction(
    config,
    {
      action,
      vaultAddress,
      expiresAfter,
      nonce: Number(nonce),
    },
    opts?.signal,
  );
}
