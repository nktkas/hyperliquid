// deno-lint-ignore-file no-import-prefix
import { assert } from "jsr:@std/assert@1";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import { ethers } from "npm:ethers@6";
import { ethers as ethersV5 } from "npm:ethers@5";
import {
  type AbstractWallet,
  createL1ActionHash,
  signL1Action,
  signMultiSigAction,
  signUserSignedAction,
} from "../../src/signing/mod.ts";

// —————————— Arguments ——————————

const PRIVATE_KEY = "0x822e9959e022b78423eb653a62ea0020cd283e71a2a8133a6ff2aeffaf373cff";
const L1_ACTION_SIGNATURE = {
  data: {
    action: {
      type: "order",
      orders: [{
        a: 0,
        b: true,
        p: "30000",
        s: "0.1",
        r: false,
        t: {
          limit: {
            tif: "Gtc",
          },
        },
      }],
      grouping: "na",
    },
    nonce: 1234567890,
    vaultAddress: "0x1234567890123456789012345678901234567890",
    expiresAfter: 1234567890,
  },
  signature: {
    mainnet: {
      withoutVaultAddressAndExpiresAfter: {
        r: "0x61078d8ffa3cb591de045438a1ae2ed299b271891d1943a33901e7cfb3a31ed8",
        s: "0x0e91df4f9841641d3322dad8d932874b74d7e082cdb5b533f804964a6963aef9",
        v: 28,
      },
      withVaultAddress: {
        r: "0x77151b3ae29b83c8affb3791568c6452019ba8c30019236003abb1efcd809433",
        s: "0x55668c02f6ad4a1c335ce99987b7545984c4edc1765fe52cf115a423dc8279bb",
        v: 27,
      },
      withExpiresAfter: {
        r: "0x162a52128fb58bc6adb783e3d36913c53127851144fc45c5603a51e97b9202fd",
        s: "0x469571eb0a2101a32f81f9584e15fd35c723a6089e106f4f33798dbccf7cd416",
        v: 28,
      },
      withVaultAddressAndExpiresAfter: {
        r: "0x78fcca006d7fdfaf1f66978ef7a60280246fc3e7a5b39a68a1656c3e42c58bf1",
        s: "0x61a09957de7f0886c2bdffb7a94e3a257bf240796883ea6ceaf4d0be37055cdd",
        v: 27,
      },
    },
    testnet: {
      withoutVaultAddressAndExpiresAfter: {
        r: "0x6b0283a894d87b996ad0182b86251cc80d27d61ef307449a2ed249a508ded1f7",
        s: "0x6f884e79f4a0a10af62db831af6f8e03b3f11d899eb49b352f836746ee9226da",
        v: 27,
      },
      withVaultAddress: {
        r: "0x294a6cf713483c129be9af5c7450aca59c9082f391f02325715c0d04b7f48ac1",
        s: "0x119cfd947dcd2da1d1064a9d08bcf07e01fc9b72dd7cca69a988c74249e300f0",
        v: 27,
      },
      withExpiresAfter: {
        r: "0x5094989a7c0317db6553f21dd7f90d43415e8bd01af03829de249d4ea0aa5f66",
        s: "0x491d04966e81662bd4e70d607fac30e71803c01733f4f66ff7299b0470675b8b",
        v: 27,
      },
      withVaultAddressAndExpiresAfter: {
        r: "0x3a0bbbd9fadca54f58a2b7050899cecb97f68b2f693c63e91ca60510427326d7",
        s: "0x60f75f12cae7b9dc18b889406192afcaf13f40d2f8c68cc01f7f83f3fb5deb23",
        v: 27,
      },
    },
  },
  actionHash: {
    withoutVaultAddressAndExpiresAfter: "0x25367e0dba84351148288c2233cd6130ed6cec5967ded0c0b7334f36f957cc90",
    withVaultAddress: "0x214e2ea3270981b6fd18174216691e69f56872663139d396b10ded319cb4bb1e",
    withExpiresAfter: "0xc30b002ba3775e4c31c43c1dfd3291dfc85c6ae06c6b9f393991de86cad5fac7",
    withVaultAddressAndExpiresAfter: "0x2d62412aa0fc57441b5189841d81554a6a9680bf07204e1454983a9ca44f0744",
  },
} as const;
const USER_SIGNED_ACTION_SIGNATURE = {
  data: {
    action: {
      hyperliquidChain: "Mainnet",
      signatureChainId: "0x66eee",
      destination: "0x1234567890123456789012345678901234567890",
      amount: "1000",
      time: 1234567890,
    },
    payloadTypes: [
      { name: "hyperliquidChain", type: "string" },
      { name: "destination", type: "string" },
      { name: "amount", type: "string" },
      { name: "time", type: "uint64" },
    ],
    primaryType: "HyperliquidTransaction:UsdSend",
  },
  signature: {
    r: "0xf777c38efe7c24cc71209526ae608f4e384d0586edf578f0e97b4b9f7c7adcc6",
    s: "0x104a4a97c48ae77bf5bd777bdd45fe72d8f5ff29116b5ff64fd8cfe4ea610786",
    v: 28,
  },
} as const;
const MULTI_SIG_ACTION_SIGNATURE = {
  data: {
    action: {
      signatureChainId: "0x66eee",
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
        action: {
          type: "scheduleCancel",
          time: 1234567890,
        },
      },
    },
    nonce: 1234567890,
    vaultAddress: "0x1234567890123456789012345678901234567890",
    expiresAfter: 1234567890,
    hyperliquidChain: "Mainnet",
    signatures: {
      mainnet: [
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
      testnet: [
        {
          r: "0x6335259aaa20d922e8544187a10d796b6e79e514ec1aaedfa1e990bdafd5000b",
          s: "0x73f50780ed5f436d5853c4592bc2189fde08b776f62f953f7271ff5385894d94",
          v: 28,
        },
        {
          r: "0xd52f89708987ed30621d0ca378261b48f16f5b56d9c8e0f4124a4993d042789b",
          s: "0x0086e1f50a5da72fdcf98576f509bda4713d13c1176273db8320c17b062a3759",
          v: 27,
        },
      ],
    },
    walletAddresses: [
      "0xE5cA49Fb3bD9A581F0D1EF9CB5D7177Da08bf901",
      "0xE99f81C03A0AD3387CA544DeFFfF82fEc6ad1305",
    ],
  },
  signature: {
    mainnet: {
      withoutVaultAddressAndExpiresAfter: {
        r: "0x0e407746b2932cf73eedc314ccd7a24fde2a5744e276b784d4344c89c9e0c30a",
        s: "0x73fb175e95590e0fc8d452b300b88951b9226026d0b6d70016b2c49c2634a905",
        v: 27,
      },
      withVaultAddress: {
        r: "0x67dc2d43c70f3aef1e47ea9fbe235e359cc7baed46776a3e131f9a7a6c5da369",
        s: "0x283578ddca36e43fe832733c6a3347c491ea4b3dd9c68f25371a29b4ee862511",
        v: 28,
      },
      withExpiresAfter: {
        r: "0x22024103daaf05a02f34d60ffdcf8124a7d6ddeb34f7ff6e6648e050d53efb11",
        s: "0x5decc6f07bc457c77bc654f29836fea1d43c3b387cacc87537154a17c9dbacaa",
        v: 28,
      },
      withVaultAddressAndExpiresAfter: {
        r: "0x65fcf5fdae7e88b006b205d0163e4b08e1759b6ce5e83851afda57faecbe2936",
        s: "0x0c1507b6263279c676154f26f09882eb6d34fd3b37954d2719eecc50b2bec314",
        v: 28,
      },
    },
    testnet: {
      withoutVaultAddressAndExpiresAfter: {
        r: "0xd67004aeb75dafe40d549e7e09d7fe4a37bdaadb78125f0ab660bcdb5c35da26",
        s: "0x30edb07fff6396e2e4de6c6eeb80dbd3be8aa8949e9afc2b6714c03408a68c48",
        v: 28,
      },
      withVaultAddress: {
        r: "0x2aad19dbab1d2cb621a52f3b59ed402b9ee12bce4030c44619b5ee25a354df1e",
        s: "0x6df0773733caf7b1a320556027c6e1645ced80a143b50aa91abdf0d63261d9b3",
        v: 27,
      },
      withExpiresAfter: {
        r: "0x617cb0cb69e7463f37fc121562d3553dc050e8db48c165dfa7f16f3cc85eec78",
        s: "0x086b0bcd31996d3631a843cfb1af7aa73825ee04d8093f8c29a0b7b322e39657",
        v: 27,
      },
      withVaultAddressAndExpiresAfter: {
        r: "0x4c7ed6c2678688fb8b64ec2d734b1b89aaf276a0a2f3d72a9099d85ddf618818",
        s: "0x5a28fcc6d506d7c331a936848cd5c8bbe013019d48df8a1101902996cb893fb3",
        v: 27,
      },
    },
  },
} as const;

// —————————— Test ——————————

Deno.test("Signature Generation Tests", async (t) => {
  const viemWallet = privateKeyToAccount(PRIVATE_KEY);
  const ethersWallet = new ethers.Wallet(PRIVATE_KEY);
  const ethersV5Wallet = new ethersV5.Wallet(PRIVATE_KEY);

  await t.step("L1 Action Signatures", async (t) => {
    await t.step("Action Hash", async (t) => {
      await t.step("should generate matching action hashes", async (t) => {
        await t.step("without vaultAddress + expiresAfter", () => {
          const actionHash = createL1ActionHash({
            action: L1_ACTION_SIGNATURE.data.action,
            nonce: L1_ACTION_SIGNATURE.data.nonce,
          });
          assert(
            actionHash === L1_ACTION_SIGNATURE.actionHash.withoutVaultAddressAndExpiresAfter,
            `Hash does not match, expected: ${L1_ACTION_SIGNATURE.actionHash.withoutVaultAddressAndExpiresAfter}, got: ${actionHash}`,
          );
        });
        await t.step("with vaultAddress", () => {
          const actionHash = createL1ActionHash({
            action: L1_ACTION_SIGNATURE.data.action,
            nonce: L1_ACTION_SIGNATURE.data.nonce,
            vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
          });
          assert(
            actionHash === L1_ACTION_SIGNATURE.actionHash.withVaultAddress,
            `Hash does not match, expected: ${L1_ACTION_SIGNATURE.actionHash.withVaultAddress}, got: ${actionHash}`,
          );
        });
        await t.step("with expiresAfter", () => {
          const actionHash = createL1ActionHash({
            action: L1_ACTION_SIGNATURE.data.action,
            nonce: L1_ACTION_SIGNATURE.data.nonce,
            expiresAfter: L1_ACTION_SIGNATURE.data.expiresAfter,
          });
          assert(
            actionHash === L1_ACTION_SIGNATURE.actionHash.withExpiresAfter,
            `Hash does not match, expected: ${L1_ACTION_SIGNATURE.actionHash.withExpiresAfter}, got: ${actionHash}`,
          );
        });
        await t.step("with vaultAddress + expiresAfter", () => {
          const actionHash = createL1ActionHash({
            action: L1_ACTION_SIGNATURE.data.action,
            nonce: L1_ACTION_SIGNATURE.data.nonce,
            vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
            expiresAfter: L1_ACTION_SIGNATURE.data.expiresAfter,
          });
          assert(
            actionHash === L1_ACTION_SIGNATURE.actionHash.withVaultAddressAndExpiresAfter,
            `Hash does not match, expected: ${L1_ACTION_SIGNATURE.actionHash.withVaultAddressAndExpiresAfter}, got: ${actionHash}`,
          );
        });
      });
    });

    await t.step("Signatures", async (t) => {
      await t.step("should generate matching signatures", async (t) => {
        await t.step("in mainnet", async (t) => {
          await t.step("without vaultAddress + expiresAfter", async (t) => {
            const fn = async (wallet: AbstractWallet) => {
              const signature = await signL1Action({
                wallet,
                isTestnet: false,
                action: L1_ACTION_SIGNATURE.data.action,
                nonce: L1_ACTION_SIGNATURE.data.nonce,
              });
              assert(
                signature.r ===
                  L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.r,
                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.r}, got: ${signature.r}`,
              );
              assert(
                signature.s ===
                  L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.s,
                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.s}, got: ${signature.s}`,
              );
              assert(
                signature.v ===
                  L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.v,
                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.v}, got: ${signature.v}`,
              );
            };

            await t.step("Viem", async () => await fn(viemWallet));
            await t.step("Ethers", async () => await fn(ethersWallet));
            await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
          });
          await t.step("with vaultAddress", async (t) => {
            const fn = async (wallet: AbstractWallet) => {
              const signature = await signL1Action({
                wallet,
                isTestnet: false,
                action: L1_ACTION_SIGNATURE.data.action,
                nonce: L1_ACTION_SIGNATURE.data.nonce,
                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
              });
              assert(
                signature.r === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r,
                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r}, got: ${signature.r}`,
              );
              assert(
                signature.s === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s,
                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s}, got: ${signature.s}`,
              );
              assert(
                signature.v === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v,
                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v}, got: ${signature.v}`,
              );
            };

            await t.step("Viem", async () => await fn(viemWallet));
            await t.step("Ethers", async () => await fn(ethersWallet));
            await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
          });
          await t.step("with expiresAfter", async (t) => {
            const fn = async (wallet: AbstractWallet) => {
              const signature = await signL1Action({
                wallet,
                isTestnet: false,
                action: L1_ACTION_SIGNATURE.data.action,
                nonce: L1_ACTION_SIGNATURE.data.nonce,
                expiresAfter: L1_ACTION_SIGNATURE.data.expiresAfter,
              });
              assert(
                signature.r === L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.r,
                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.r}, got: ${signature.r}`,
              );
              assert(
                signature.s === L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.s,
                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.s}, got: ${signature.s}`,
              );
              assert(
                signature.v === L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.v,
                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.v}, got: ${signature.v}`,
              );
            };

            await t.step("Viem", async () => await fn(viemWallet));
            await t.step("Ethers", async () => await fn(ethersWallet));
            await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
          });
          await t.step("with vaultAddress + expiresAfter", async (t) => {
            const fn = async (wallet: AbstractWallet) => {
              const signature = await signL1Action({
                wallet,
                isTestnet: false,
                action: L1_ACTION_SIGNATURE.data.action,
                nonce: L1_ACTION_SIGNATURE.data.nonce,
                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                expiresAfter: L1_ACTION_SIGNATURE.data.expiresAfter,
              });
              assert(
                signature.r ===
                  L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.r,
                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.r}, got: ${signature.r}`,
              );
              assert(
                signature.s ===
                  L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.s,
                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.s}, got: ${signature.s}`,
              );
              assert(
                signature.v ===
                  L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.v,
                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.v}, got: ${signature.v}`,
              );
            };

            await t.step("Viem", async () => await fn(viemWallet));
            await t.step("Ethers", async () => await fn(ethersWallet));
            await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
          });
        });

        await t.step("in testnet", async (t) => {
          await t.step("without vaultAddress + expiresAfter", async (t) => {
            const fn = async (wallet: AbstractWallet) => {
              const signature = await signL1Action({
                wallet,
                isTestnet: true,
                action: L1_ACTION_SIGNATURE.data.action,
                nonce: L1_ACTION_SIGNATURE.data.nonce,
              });
              assert(
                signature.r ===
                  L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.r,
                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.r}, got: ${signature.r}`,
              );
              assert(
                signature.s ===
                  L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.s,
                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.s}, got: ${signature.s}`,
              );
              assert(
                signature.v ===
                  L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.v,
                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.v}, got: ${signature.v}`,
              );
            };

            await t.step("Viem", async () => await fn(viemWallet));
            await t.step("Ethers", async () => await fn(ethersWallet));
            await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
          });
          await t.step("with vaultAddress", async (t) => {
            const fn = async (wallet: AbstractWallet) => {
              const signature = await signL1Action({
                wallet,
                isTestnet: true,
                action: L1_ACTION_SIGNATURE.data.action,
                nonce: L1_ACTION_SIGNATURE.data.nonce,
                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
              });
              assert(
                signature.r === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r,
                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r}, got: ${signature.r}`,
              );
              assert(
                signature.s === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s,
                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s}, got: ${signature.s}`,
              );
              assert(
                signature.v === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v,
                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v}, got: ${signature.v}`,
              );
            };

            await t.step("Viem", async () => await fn(viemWallet));
            await t.step("Ethers", async () => await fn(ethersWallet));
            await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
          });
          await t.step("with expiresAfter", async (t) => {
            const fn = async (wallet: AbstractWallet) => {
              const signature = await signL1Action({
                wallet,
                isTestnet: true,
                action: L1_ACTION_SIGNATURE.data.action,
                nonce: L1_ACTION_SIGNATURE.data.nonce,
                expiresAfter: L1_ACTION_SIGNATURE.data.expiresAfter,
              });
              assert(
                signature.r === L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.r,
                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.r}, got: ${signature.r}`,
              );
              assert(
                signature.s === L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.s,
                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.s}, got: ${signature.s}`,
              );
              assert(
                signature.v === L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.v,
                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.v}, got: ${signature.v}`,
              );
            };

            await t.step("Viem", async () => await fn(viemWallet));
            await t.step("Ethers", async () => await fn(ethersWallet));
            await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
          });
          await t.step("with vaultAddress + expiresAfter", async (t) => {
            const fn = async (wallet: AbstractWallet) => {
              const signature = await signL1Action({
                wallet,
                isTestnet: true,
                action: L1_ACTION_SIGNATURE.data.action,
                nonce: L1_ACTION_SIGNATURE.data.nonce,
                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                expiresAfter: L1_ACTION_SIGNATURE.data.expiresAfter,
              });
              assert(
                signature.r ===
                  L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.r,
                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.r}, got: ${signature.r}`,
              );
              assert(
                signature.s ===
                  L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.s,
                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.s}, got: ${signature.s}`,
              );
              assert(
                signature.v ===
                  L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.v,
                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.v}, got: ${signature.v}`,
              );
            };

            await t.step("Viem", async () => await fn(viemWallet));
            await t.step("Ethers", async () => await fn(ethersWallet));
            await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
          });
        });
      });
    });
  });

  await t.step("User-Signed Action Signatures", async (t) => {
    await t.step("should generate matching signatures", async (t) => {
      const fn = async (wallet: AbstractWallet) => {
        const signature = await signUserSignedAction({
          wallet,
          action: USER_SIGNED_ACTION_SIGNATURE.data.action,
          types: {
            [USER_SIGNED_ACTION_SIGNATURE.data.primaryType]: [
              ...USER_SIGNED_ACTION_SIGNATURE.data.payloadTypes,
            ],
          },
        });
        assert(
          signature.r === USER_SIGNED_ACTION_SIGNATURE.signature.r,
          `Signature r does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.r}, got: ${signature.r}`,
        );
        assert(
          signature.s === USER_SIGNED_ACTION_SIGNATURE.signature.s,
          `Signature s does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.s}, got: ${signature.s}`,
        );
        assert(
          signature.v === USER_SIGNED_ACTION_SIGNATURE.signature.v,
          `Signature v does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.v}, got: ${signature.v}`,
        );
      };

      await t.step("Viem", async () => await fn(viemWallet));
      await t.step("Ethers", async () => await fn(ethersWallet));
      await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
    });
  });

  await t.step("Multi-Sig Action Signatures", async (t) => {
    await t.step("should generate matching signatures", async (t) => {
      await t.step("in mainnet", async (t) => {
        await t.step("without vaultAddress + expiresAfter", async (t) => {
          const fn = async (wallet: AbstractWallet) => {
            const signature = await signMultiSigAction({
              wallet,
              action: MULTI_SIG_ACTION_SIGNATURE.data.action,
              nonce: MULTI_SIG_ACTION_SIGNATURE.data.nonce,
              isTestnet: false,
            });
            assert(
              signature.r ===
                MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.r,
              `Signature r does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.r}, got: ${signature.r}`,
            );
            assert(
              signature.s ===
                MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.s,
              `Signature s does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.s}, got: ${signature.s}`,
            );
            assert(
              signature.v ===
                MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.v,
              `Signature v does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.v}, got: ${signature.v}`,
            );
          };

          await t.step("Viem", async () => await fn(viemWallet));
          await t.step("Ethers", async () => await fn(ethersWallet));
          await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
        });

        await t.step("with vaultAddress", async (t) => {
          const fn = async (wallet: AbstractWallet) => {
            const signature = await signMultiSigAction({
              wallet,
              action: MULTI_SIG_ACTION_SIGNATURE.data.action,
              nonce: MULTI_SIG_ACTION_SIGNATURE.data.nonce,
              isTestnet: false,
              vaultAddress: MULTI_SIG_ACTION_SIGNATURE.data.vaultAddress,
            });
            assert(
              signature.r ===
                MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r,
              `Signature r does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r}, got: ${signature.r}`,
            );
            assert(
              signature.s ===
                MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s,
              `Signature s does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s}, got: ${signature.s}`,
            );
            assert(
              signature.v ===
                MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v,
              `Signature v does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v}, got: ${signature.v}`,
            );
          };

          await t.step("Viem", async () => await fn(viemWallet));
          await t.step("Ethers", async () => await fn(ethersWallet));
          await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
        });

        await t.step("with expiresAfter", async (t) => {
          const fn = async (wallet: AbstractWallet) => {
            const signature = await signMultiSigAction({
              wallet,
              action: MULTI_SIG_ACTION_SIGNATURE.data.action,
              nonce: MULTI_SIG_ACTION_SIGNATURE.data.nonce,
              isTestnet: false,
              expiresAfter: MULTI_SIG_ACTION_SIGNATURE.data.expiresAfter,
            });
            assert(
              signature.r ===
                MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.r,
              `Signature r does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.r}, got: ${signature.r}`,
            );
            assert(
              signature.s ===
                MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.s,
              `Signature s does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.s}, got: ${signature.s}`,
            );
            assert(
              signature.v ===
                MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.v,
              `Signature v does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.v}, got: ${signature.v}`,
            );
          };

          await t.step("Viem", async () => await fn(viemWallet));
          await t.step("Ethers", async () => await fn(ethersWallet));
          await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
        });

        await t.step("with vaultAddress + expiresAfter", async (t) => {
          const fn = async (wallet: AbstractWallet) => {
            const signature = await signMultiSigAction({
              wallet,
              action: MULTI_SIG_ACTION_SIGNATURE.data.action,
              nonce: MULTI_SIG_ACTION_SIGNATURE.data.nonce,
              isTestnet: false,
              vaultAddress: MULTI_SIG_ACTION_SIGNATURE.data.vaultAddress,
              expiresAfter: MULTI_SIG_ACTION_SIGNATURE.data.expiresAfter,
            });
            assert(
              signature.r ===
                MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.r,
              `Signature r does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.r}, got: ${signature.r}`,
            );
            assert(
              signature.s ===
                MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.s,
              `Signature s does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.s}, got: ${signature.s}`,
            );
            assert(
              signature.v ===
                MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.v,
              `Signature v does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.v}, got: ${signature.v}`,
            );
          };

          await t.step("Viem", async () => await fn(viemWallet));
          await t.step("Ethers", async () => await fn(ethersWallet));
          await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
        });
      });

      await t.step("in testnet", async (t) => {
        await t.step("without vaultAddress + expiresAfter", async (t) => {
          const fn = async (wallet: AbstractWallet) => {
            const signature = await signMultiSigAction({
              wallet,
              action: MULTI_SIG_ACTION_SIGNATURE.data.action,
              nonce: MULTI_SIG_ACTION_SIGNATURE.data.nonce,
              isTestnet: true,
            });
            assert(
              signature.r ===
                MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.r,
              `Signature r does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.r}, got: ${signature.r}`,
            );
            assert(
              signature.s ===
                MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.s,
              `Signature s does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.s}, got: ${signature.s}`,
            );
            assert(
              signature.v ===
                MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.v,
              `Signature v does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.v}, got: ${signature.v}`,
            );
          };

          await t.step("Viem", async () => await fn(viemWallet));
          await t.step("Ethers", async () => await fn(ethersWallet));
          await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
        });

        await t.step("with vaultAddress", async (t) => {
          const fn = async (wallet: AbstractWallet) => {
            const signature = await signMultiSigAction({
              wallet,
              action: MULTI_SIG_ACTION_SIGNATURE.data.action,
              nonce: MULTI_SIG_ACTION_SIGNATURE.data.nonce,
              isTestnet: true,
              vaultAddress: MULTI_SIG_ACTION_SIGNATURE.data.vaultAddress,
            });
            assert(
              signature.r ===
                MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r,
              `Signature r does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r}, got: ${signature.r}`,
            );
            assert(
              signature.s ===
                MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s,
              `Signature s does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s}, got: ${signature.s}`,
            );
            assert(
              signature.v ===
                MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v,
              `Signature v does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v}, got: ${signature.v}`,
            );
          };

          await t.step("Viem", async () => await fn(viemWallet));
          await t.step("Ethers", async () => await fn(ethersWallet));
          await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
        });

        await t.step("with expiresAfter", async (t) => {
          const fn = async (wallet: AbstractWallet) => {
            const signature = await signMultiSigAction({
              wallet,
              action: MULTI_SIG_ACTION_SIGNATURE.data.action,
              nonce: MULTI_SIG_ACTION_SIGNATURE.data.nonce,
              isTestnet: true,
              expiresAfter: MULTI_SIG_ACTION_SIGNATURE.data.expiresAfter,
            });
            assert(
              signature.r ===
                MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.r,
              `Signature r does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.r}, got: ${signature.r}`,
            );
            assert(
              signature.s ===
                MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.s,
              `Signature s does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.s}, got: ${signature.s}`,
            );
            assert(
              signature.v ===
                MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.v,
              `Signature v does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.v}, got: ${signature.v}`,
            );
          };

          await t.step("Viem", async () => await fn(viemWallet));
          await t.step("Ethers", async () => await fn(ethersWallet));
          await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
        });

        await t.step("with vaultAddress + expiresAfter", async (t) => {
          const fn = async (wallet: AbstractWallet) => {
            const signature = await signMultiSigAction({
              wallet,
              action: MULTI_SIG_ACTION_SIGNATURE.data.action,
              nonce: MULTI_SIG_ACTION_SIGNATURE.data.nonce,
              isTestnet: true,
              vaultAddress: MULTI_SIG_ACTION_SIGNATURE.data.vaultAddress,
              expiresAfter: MULTI_SIG_ACTION_SIGNATURE.data.expiresAfter,
            });
            assert(
              signature.r ===
                MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.r,
              `Signature r does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.r}, got: ${signature.r}`,
            );
            assert(
              signature.s ===
                MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.s,
              `Signature s does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.s}, got: ${signature.s}`,
            );
            assert(
              signature.v ===
                MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.v,
              `Signature v does not match, expected: ${MULTI_SIG_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.v}, got: ${signature.v}`,
            );
          };

          await t.step("Viem", async () => await fn(viemWallet));
          await t.step("Ethers", async () => await fn(ethersWallet));
          await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
        });
      });
    });
  });
});
