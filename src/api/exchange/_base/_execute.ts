import { getSemaphore } from "@henrygd/semaphore";
import { getWalletAddress, signL1Action, signMultiSigAction, signUserSignedAction } from "../../../signing/mod.ts";
import { assertSuccessResponse } from "./_errors.ts";
import type { AnyResponse, AnySuccessResponse, ExchangeRequestConfig, MultiSignRequestConfig } from "./_types.ts";
import { globalNonceManager } from "./_nonce.ts";
import { getSignatureChainId } from "./_helpers.ts";

export async function executeL1Action<T extends AnySuccessResponse>(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  request: {
    action: Record<string, unknown>;
    vaultAddress?: `0x${string}`;
    expiresAfter?: number;
  },
  signal?: AbortSignal,
): Promise<T> {
  const { transport } = config;
  const { action, vaultAddress, expiresAfter } = request;

  // Sequential request execution to prevent nonce race conditions at the network layer
  const walletAddress = "signers" in config
    ? await getWalletAddress(config.signers[0])
    : await getWalletAddress(config.wallet);
  const walletKey = `@nktkas/hyperliquid:${walletAddress}:${config.transport.isTestnet}`;

  const sem = getSemaphore(walletKey);
  await sem.acquire();

  // Main logic
  try {
    const nonce = globalNonceManager.getNonce();

    // Multi-signature request
    if ("signers" in config) {
      const { signers, multiSigUser } = config;
      const outerSigner = walletAddress;

      // Sign an L1 action for each signer
      const signatures = await Promise.all(signers.map(async (signer) => {
        const signature = await signL1Action({
          wallet: signer,
          action: [multiSigUser, outerSigner, action],
          nonce,
          isTestnet: transport.isTestnet,
          vaultAddress,
          expiresAfter,
        });
        signature.r = signature.r.replace(/^0x0+/, "0x") as `0x${string}`;
        signature.s = signature.s.replace(/^0x0+/, "0x") as `0x${string}`;
        return signature;
      }));

      // Send a request via multi-sign action
      return await executeMultiSigAction(
        { ...config, wallet: signers[0] },
        {
          action: {
            type: "multiSig",
            signatureChainId: await getSignatureChainId(config),
            signatures,
            payload: { multiSigUser, outerSigner, action },
          },
          vaultAddress,
          expiresAfter,
          nonce,
        },
        signal,
        false,
      );
    } else { // Single-signature request
      const { wallet } = config;

      // Sign an L1 action
      const signature = await signL1Action({
        wallet,
        action,
        nonce,
        isTestnet: transport.isTestnet,
        vaultAddress,
        expiresAfter,
      });

      // Send a request
      const response = await transport.request(
        "exchange",
        { action, signature, nonce, vaultAddress, expiresAfter },
        signal,
      ) as AnyResponse;
      assertSuccessResponse(response);
      return response as T;
    }
  } finally {
    // Release semaphore
    sem.release();
  }
}

export async function executeUserSignedAction<T extends AnySuccessResponse>(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  request: {
    action:
      & {
        signatureChainId: `0x${string}`;
        [key: string]: unknown;
      }
      & (
        | { nonce: number; time?: undefined }
        | { time: number; nonce?: undefined }
      );
  },
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  },
  signal?: AbortSignal,
): Promise<T> {
  const { transport } = config;
  const { action } = request;

  // Sequential request execution to prevent nonce race conditions at the network layer
  const walletAddress = "signers" in config
    ? await getWalletAddress(config.signers[0])
    : await getWalletAddress(config.wallet);
  const walletKey = `@nktkas/hyperliquid:${walletAddress}:${config.transport.isTestnet}`;

  const sem = getSemaphore(walletKey);
  await sem.acquire();

  // Main logic
  try {
    const nonce = globalNonceManager.getNonce();
    if ("time" in action) request.action.time = nonce;
    if ("nonce" in action) request.action.nonce = nonce;

    // Multi-signature request
    if ("signers" in config) {
      const { signers, multiSigUser } = config;
      const outerSigner = walletAddress;

      // Sign a user-signed action for each signer
      const signatures = await Promise.all(signers.map(async (signer) => {
        const signature = await signUserSignedAction({
          wallet: signer,
          action: {
            payloadMultiSigUser: multiSigUser as `0x${string}`,
            outerSigner,
            ...action,
          },
          types,
        });
        signature.r = signature.r.replace(/^0x0+/, "0x") as `0x${string}`;
        signature.s = signature.s.replace(/^0x0+/, "0x") as `0x${string}`;
        return signature;
      }));

      // Send a request via multi-sign action
      return await executeMultiSigAction(
        { ...config, wallet: signers[0] },
        {
          action: {
            type: "multiSig",
            signatureChainId: action.signatureChainId,
            signatures,
            payload: { multiSigUser, outerSigner, action },
          },
          nonce,
        },
        signal,
        false,
      );
    } else { // Single-signature request
      const { wallet } = config;

      // Sign a user-signed action
      const signature = await signUserSignedAction({ wallet, action, types });

      // Send a request
      const response = await transport.request(
        "exchange",
        { action, signature, nonce },
        signal,
      ) as AnyResponse;
      assertSuccessResponse(response);
      return response as T;
    }
  } finally {
    // Release semaphore and nonce manager
    sem.release();
  }
}

export async function executeMultiSigAction<T extends AnySuccessResponse>(
  config: ExchangeRequestConfig,
  request: {
    action: {
      signatureChainId: `0x${string}`;
      [key: string]: unknown;
    };
    nonce: number;
    vaultAddress?: `0x${string}`;
    expiresAfter?: number;
  },
  signal?: AbortSignal,
  semaphore = true,
): Promise<T> {
  const { transport, wallet } = config;
  const { action, nonce, vaultAddress, expiresAfter } = request;

  // Sequential request execution to prevent nonce race conditions at the network layer
  let sem: ReturnType<typeof getSemaphore> | undefined;
  if (semaphore) {
    const walletAddress = await getWalletAddress(config.wallet);
    const walletKey = `@nktkas/hyperliquid:${walletAddress}:${config.transport.isTestnet}`;
    sem = getSemaphore(walletKey);
    await sem.acquire();
  }

  // Main logic
  try {
    // Sign a multi-signature action
    const signature = await signMultiSigAction({
      wallet,
      action,
      nonce,
      isTestnet: transport.isTestnet,
      vaultAddress,
      expiresAfter,
    });

    // Send a request
    const response = await transport.request(
      "exchange",
      { action, signature, nonce, vaultAddress, expiresAfter },
      signal,
    ) as AnyResponse;
    assertSuccessResponse(response);
    return response as T;
  } finally {
    // Release semaphore if used
    sem?.release();
  }
}
