// deno-lint-ignore-file no-import-prefix
import { assertEquals } from "jsr:@std/assert@1";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import { Wallet as WalletV5 } from "npm:ethers@5";
import { Wallet as WalletV6 } from "npm:ethers@6";
import {
  type AbstractWallet,
  createL1ActionHash,
  signL1Action,
  signMultiSigAction,
  signUserSignedAction,
} from "@nktkas/hyperliquid/signing";

// ============================================================
// Test Data
// ============================================================

const PRIVATE_KEY = "0x822e9959e022b78423eb653a62ea0020cd283e71a2a8133a6ff2aeffaf373cff";

const L1_ACTION = {
  action: {
    type: "order",
    orders: [{
      a: 0,
      b: true,
      p: "30000",
      s: "0.1",
      r: false,
      t: { limit: { tif: "Gtc" } },
    }],
    grouping: "na",
  },
  nonce: 1234567890,
  vaultAddress: "0x1234567890123456789012345678901234567890" as const,
  expiresAfter: 1234567890,
  hash: {
    base: "0x25367e0dba84351148288c2233cd6130ed6cec5967ded0c0b7334f36f957cc90",
    withVault: "0x214e2ea3270981b6fd18174216691e69f56872663139d396b10ded319cb4bb1e",
    withExpires: "0xc30b002ba3775e4c31c43c1dfd3291dfc85c6ae06c6b9f393991de86cad5fac7",
    withBoth: "0x2d62412aa0fc57441b5189841d81554a6a9680bf07204e1454983a9ca44f0744",
  },
  signature: {
    mainnet: {
      r: "0x61078d8ffa3cb591de045438a1ae2ed299b271891d1943a33901e7cfb3a31ed8",
      s: "0x0e91df4f9841641d3322dad8d932874b74d7e082cdb5b533f804964a6963aef9",
      v: 28,
    },
    testnet: {
      r: "0x6b0283a894d87b996ad0182b86251cc80d27d61ef307449a2ed249a508ded1f7",
      s: "0x6f884e79f4a0a10af62db831af6f8e03b3f11d899eb49b352f836746ee9226da",
      v: 27,
    },
  },
} as const;

const USER_SIGNED_ACTION = {
  action: {
    hyperliquidChain: "Mainnet" as const,
    signatureChainId: "0x66eee" as const,
    destination: "0x1234567890123456789012345678901234567890" as const,
    amount: "1000",
    time: 1234567890,
  },
  types: {
    "HyperliquidTransaction:UsdSend": [
      { name: "hyperliquidChain", type: "string" },
      { name: "destination", type: "string" },
      { name: "amount", type: "string" },
      { name: "time", type: "uint64" },
    ],
  },
  signature: {
    r: "0xf777c38efe7c24cc71209526ae608f4e384d0586edf578f0e97b4b9f7c7adcc6",
    s: "0x104a4a97c48ae77bf5bd777bdd45fe72d8f5ff29116b5ff64fd8cfe4ea610786",
    v: 28,
  },
};

const MULTI_SIG_ACTION = {
  action: {
    signatureChainId: "0x66eee" as const,
    signatures: [
      {
        r: "0x29f311b52c9e240f515c65eded550375aa64c847a03362c6f79429b21f349b54",
        s: "0x4838140a3d4c0887a49eac5e618aca790878572da9840ee05a70ee39effc8542",
        v: 27,
      },
      {
        r: "0x42519dee3001e1a1306c77056e1d3c4516d7fad4d1a365a229dd5b5fb09d3491",
        s: "0x4486a74320fbd9ef3742e5fbd8112e99eaf5e5674511ee8600911fdbf2ea0fd8",
        v: 27,
      },
    ],
    payload: {
      multiSigUser: "0x1234567890123456789012345678901234567890",
      outerSigner: "0xE5cA49Fb3bD9A581F0D1EF9CB5D7177Da08bf901",
      action: { type: "scheduleCancel", time: 1234567890 },
    },
  },
  nonce: 1234567890,
  signature: {
    mainnet: {
      r: "0x0e407746b2932cf73eedc314ccd7a24fde2a5744e276b784d4344c89c9e0c30a",
      s: "0x73fb175e95590e0fc8d452b300b88951b9226026d0b6d70016b2c49c2634a905",
      v: 27,
    },
    testnet: {
      r: "0xd67004aeb75dafe40d549e7e09d7fe4a37bdaadb78125f0ab660bcdb5c35da26",
      s: "0x30edb07fff6396e2e4de6c6eeb80dbd3be8aa8949e9afc2b6714c03408a68c48",
      v: 28,
    },
  },
} as const;

// ============================================================
// Tests
// ============================================================

Deno.test("signing", async (t) => {
  const wallets: [string, AbstractWallet][] = [
    ["Viem", privateKeyToAccount(PRIVATE_KEY)],
    ["Ethers v6", new WalletV6(PRIVATE_KEY)],
    ["Ethers v5", new WalletV5(PRIVATE_KEY)],
  ];

  await t.step("createL1ActionHash()", async (t) => {
    await t.step("base", () => {
      assertEquals(
        createL1ActionHash({
          action: L1_ACTION.action,
          nonce: L1_ACTION.nonce,
        }),
        L1_ACTION.hash.base,
      );
    });

    await t.step("with vaultAddress", () => {
      assertEquals(
        createL1ActionHash({
          action: L1_ACTION.action,
          nonce: L1_ACTION.nonce,
          vaultAddress: L1_ACTION.vaultAddress,
        }),
        L1_ACTION.hash.withVault,
      );
    });

    await t.step("with expiresAfter", () => {
      assertEquals(
        createL1ActionHash({
          action: L1_ACTION.action,
          nonce: L1_ACTION.nonce,
          expiresAfter: L1_ACTION.expiresAfter,
        }),
        L1_ACTION.hash.withExpires,
      );
    });

    await t.step("with vaultAddress + expiresAfter", () => {
      assertEquals(
        createL1ActionHash({
          action: L1_ACTION.action,
          nonce: L1_ACTION.nonce,
          vaultAddress: L1_ACTION.vaultAddress,
          expiresAfter: L1_ACTION.expiresAfter,
        }),
        L1_ACTION.hash.withBoth,
      );
    });
  });

  await t.step("signL1Action()", async (t) => {
    await t.step("mainnet", async (t) => {
      for (const [name, wallet] of wallets) {
        await t.step(name, async () => {
          const signature = await signL1Action({
            wallet,
            isTestnet: false,
            action: L1_ACTION.action,
            nonce: L1_ACTION.nonce,
          });
          assertEquals(signature, L1_ACTION.signature.mainnet);
        });
      }
    });

    await t.step("testnet", async (t) => {
      for (const [name, wallet] of wallets) {
        await t.step(name, async () => {
          const signature = await signL1Action({
            wallet,
            isTestnet: true,
            action: L1_ACTION.action,
            nonce: L1_ACTION.nonce,
          });
          assertEquals(signature, L1_ACTION.signature.testnet);
        });
      }
    });
  });

  await t.step("signUserSignedAction()", async (t) => {
    for (const [name, wallet] of wallets) {
      await t.step(name, async () => {
        const signature = await signUserSignedAction({
          wallet,
          action: USER_SIGNED_ACTION.action,
          types: USER_SIGNED_ACTION.types,
        });
        assertEquals(signature, USER_SIGNED_ACTION.signature);
      });
    }
  });

  await t.step("signMultiSigAction()", async (t) => {
    await t.step("mainnet", async (t) => {
      for (const [name, wallet] of wallets) {
        await t.step(name, async () => {
          const signature = await signMultiSigAction({
            wallet,
            isTestnet: false,
            action: MULTI_SIG_ACTION.action,
            nonce: MULTI_SIG_ACTION.nonce,
          });
          assertEquals(signature, MULTI_SIG_ACTION.signature.mainnet);
        });
      }
    });

    await t.step("testnet", async (t) => {
      for (const [name, wallet] of wallets) {
        await t.step(name, async () => {
          const signature = await signMultiSigAction({
            wallet,
            isTestnet: true,
            action: MULTI_SIG_ACTION.action,
            nonce: MULTI_SIG_ACTION.nonce,
          });
          assertEquals(signature, MULTI_SIG_ACTION.signature.testnet);
        });
      }
    });
  });
});
