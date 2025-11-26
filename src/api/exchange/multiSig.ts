import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../_base.ts";
import { Signature } from "./_base/mod.ts";
import { ApproveAgentRequest, ApproveAgentResponse } from "./approveAgent.ts";
import { ApproveBuilderFeeRequest, ApproveBuilderFeeResponse } from "./approveBuilderFee.ts";
import { BatchModifyRequest, BatchModifyResponse } from "./batchModify.ts";
import { CancelRequest, CancelResponse } from "./cancel.ts";
import { CancelByCloidRequest, CancelByCloidResponse } from "./cancelByCloid.ts";
import { ClaimRewardsRequest, ClaimRewardsResponse } from "./claimRewards.ts";
import { CDepositRequest, CDepositResponse } from "./cDeposit.ts";
import { ConvertToMultiSigUserRequest, ConvertToMultiSigUserResponse } from "./convertToMultiSigUser.ts";
import { CreateSubAccountRequest, CreateSubAccountResponse } from "./createSubAccount.ts";
import { CreateVaultRequest, CreateVaultResponse } from "./createVault.ts";
import { CSignerActionRequest, CSignerActionResponse } from "./cSignerAction.ts";
import { CValidatorActionRequest, CValidatorActionResponse } from "./cValidatorAction.ts";
import { CWithdrawRequest, CWithdrawResponse } from "./cWithdraw.ts";
import { EvmUserModifyRequest, EvmUserModifyResponse } from "./evmUserModify.ts";
import { ModifyRequest, ModifyResponse } from "./modify.ts";
import { NoopRequest, NoopResponse } from "./noop.ts";
import { OrderRequest, OrderResponse } from "./order.ts";
import { RegisterReferrerRequest, RegisterReferrerResponse } from "./registerReferrer.ts";
import { ReserveRequestWeightRequest, ReserveRequestWeightResponse } from "./reserveRequestWeight.ts";
import { ScheduleCancelRequest, ScheduleCancelResponse } from "./scheduleCancel.ts";
import { SetDisplayNameRequest, SetDisplayNameResponse } from "./setDisplayName.ts";
import { SetReferrerRequest, SetReferrerResponse } from "./setReferrer.ts";
import { SpotDeployRequest, SpotDeployResponse } from "./spotDeploy.ts";
import { SubAccountModifyRequest, SubAccountModifyResponse } from "./subAccountModify.ts";
import { TokenDelegateRequest, TokenDelegateResponse } from "./tokenDelegate.ts";
import { TwapOrderRequest, TwapOrderResponse } from "./twapOrder.ts";
import { UsdClassTransferRequest, UsdClassTransferResponse } from "./usdClassTransfer.ts";
import { VaultDistributeRequest, VaultDistributeResponse } from "./vaultDistribute.ts";
import { Withdraw3Request, Withdraw3Response } from "./withdraw3.ts";
import { PerpDeployRequest, PerpDeployResponse } from "./perpDeploy.ts";
import { SendAssetRequest, SendAssetResponse } from "./sendAsset.ts";
import { SpotSendRequest, SpotSendResponse } from "./spotSend.ts";
import { SpotUserRequest, SpotUserResponse } from "./spotUser.ts";
import { SubAccountSpotTransferRequest, SubAccountSpotTransferResponse } from "./subAccountSpotTransfer.ts";
import { SubAccountTransferRequest, SubAccountTransferResponse } from "./subAccountTransfer.ts";
import { TwapCancelRequest, TwapCancelResponse } from "./twapCancel.ts";
import { UpdateIsolatedMarginRequest, UpdateIsolatedMarginResponse } from "./updateIsolatedMargin.ts";
import { UpdateLeverageRequest, UpdateLeverageResponse } from "./updateLeverage.ts";
import { UsdSendRequest, UsdSendResponse } from "./usdSend.ts";
import { VaultModifyRequest, VaultModifyResponse } from "./vaultModify.ts";
import { VaultTransferRequest, VaultTransferResponse } from "./vaultTransfer.ts";

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

/**
 * A response related to an action.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
 */
export const MultiSigResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([
      ApproveAgentResponse,
      ApproveBuilderFeeResponse,
      BatchModifyResponse,
      CancelResponse,
      CancelByCloidResponse,
      CDepositResponse,
      ClaimRewardsResponse,
      ConvertToMultiSigUserResponse,
      CreateSubAccountResponse,
      CreateVaultResponse,
      CSignerActionResponse,
      CValidatorActionResponse,
      CWithdrawResponse,
      EvmUserModifyResponse,
      ModifyResponse,
      NoopResponse,
      OrderResponse,
      PerpDeployResponse,
      RegisterReferrerResponse,
      ReserveRequestWeightResponse,
      ScheduleCancelResponse,
      SendAssetResponse,
      SetDisplayNameResponse,
      SetReferrerResponse,
      SpotDeployResponse,
      SpotSendResponse,
      SpotUserResponse,
      SubAccountModifyResponse,
      SubAccountSpotTransferResponse,
      SubAccountTransferResponse,
      TokenDelegateResponse,
      TwapCancelResponse,
      TwapOrderResponse,
      UpdateIsolatedMarginResponse,
      UpdateLeverageResponse,
      UsdClassTransferResponse,
      UsdSendResponse,
      VaultDistributeResponse,
      VaultModifyResponse,
      VaultTransferResponse,
      Withdraw3Response,
    ]),
    v.description("A response related to an action."),
  );
})();
export type MultiSigResponse = v.InferOutput<typeof MultiSigResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type DeepImmutable, parser } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  type ExcludeErrorResponse,
  executeMultiSigAction,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  getSignatureChainId,
} from "./_base/mod.ts";

/** Action parameters for the {@linkcode multiSig} function. */
export type MultiSigParameters =
  & ExtractRequestAction<v.InferInput<typeof MultiSigRequest>>
  & Pick<v.InferInput<typeof MultiSigRequest>, "nonce">;

/** Request options for the {@linkcode multiSig} function. */
export type MultiSigOptions = ExtractRequestOptions<v.InferInput<typeof MultiSigRequest>>;

/** Successful variant of {@linkcode MultiSigResponse} without errors. */
export type MultiSigSuccessResponse = ExcludeErrorResponse<MultiSigResponse>;

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
export async function multiSig(
  config: ExchangeRequestConfig,
  paramsAndNonce: DeepImmutable<MultiSigParameters>,
  opts?: MultiSigOptions,
): Promise<MultiSigSuccessResponse> {
  const { nonce, ...params } = paramsAndNonce;

  const request = parser(MultiSigRequest)({
    action: {
      type: "multiSig",
      signatureChainId: await getSignatureChainId(config),
      ...params,
    },
    nonce,
    signature: { // Placeholder; actual signature generated in `executeMultiSigAction`
      r: "0x0000000000000000000000000000000000000000000000000000000000000000",
      s: "0x0000000000000000000000000000000000000000000000000000000000000000",
      v: 27,
    },
    vaultAddress: opts?.vaultAddress ?? config.defaultVaultAddress,
    expiresAfter: typeof config.defaultExpiresAfter === "number"
      ? config.defaultExpiresAfter
      : await config.defaultExpiresAfter?.(),
  });
  return await executeMultiSigAction(config, request, opts?.signal);
}
