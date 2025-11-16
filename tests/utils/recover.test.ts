import test from "node:test";
import assert from "node:assert";
import { signL1Action, signUserSignedAction } from "../../src/signing/mod.ts";
import { recoverUserFromL1Action, recoverUserFromUserSigned } from "../../src/utils/mod.ts";
import { PrivateKeyEIP712Signer } from "../../src/utils/_eip712.ts";

const TEST_PRIVATE_KEY = "0x720fdd809048d0104b0b82ae70642b5dcfd5fd6870eeefc9c882004ab35573ae";

test("recoverUserFromL1Action", async (t) => {
  await t.test("mainnet", async () => {
    const wallet = new PrivateKeyEIP712Signer(TEST_PRIVATE_KEY);
    const action = { type: "cancel", cancels: [{ a: 0, o: 1 }] };
    const nonce = 1234567890000;

    const signature = await signL1Action({ wallet, action, nonce });
    const recovered = await recoverUserFromL1Action({ action, nonce, signature });

    assert.strictEqual(recovered, wallet.address);
  });

  await t.test("testnet", async () => {
    const wallet = new PrivateKeyEIP712Signer(TEST_PRIVATE_KEY);
    const action = { type: "cancel", cancels: [{ a: 0, o: 1 }] };
    const nonce = 1234567890000;

    const signature = await signL1Action({ wallet, action, nonce, isTestnet: true });
    const recovered = await recoverUserFromL1Action({ action, nonce, signature, isTestnet: true });

    assert.strictEqual(recovered, wallet.address);
  });

  await t.test("with vaultAddress", async () => {
    const wallet = new PrivateKeyEIP712Signer(TEST_PRIVATE_KEY);
    const action = { type: "cancel", cancels: [{ a: 0, o: 1 }] };
    const nonce = 1234567890000;
    const vaultAddress = "0x1111111111111111111111111111111111111111";

    const signature = await signL1Action({ wallet, action, nonce, vaultAddress });
    const recovered = await recoverUserFromL1Action({ action, nonce, signature, vaultAddress });

    assert.strictEqual(recovered, wallet.address);
  });

  await t.test("with expiresAfter", async () => {
    const wallet = new PrivateKeyEIP712Signer(TEST_PRIVATE_KEY);
    const action = { type: "cancel", cancels: [{ a: 0, o: 1 }] };
    const nonce = 1234567890000;
    const expiresAfter = 1234567900000;

    const signature = await signL1Action({ wallet, action, nonce, expiresAfter });
    const recovered = await recoverUserFromL1Action({ action, nonce, signature, expiresAfter });

    assert.strictEqual(recovered, wallet.address);
  });
});

test("recoverUserFromUserSigned", async () => {
  const wallet = new PrivateKeyEIP712Signer(TEST_PRIVATE_KEY);
  const action = {
    type: "approveAgent",
    signatureChainId: "0x66eee" as const,
    hyperliquidChain: "Mainnet",
    agentAddress: "0x2222222222222222222222222222222222222222",
    agentName: "test",
    nonce: 1234567890000,
  };
  const types = {
    "HyperliquidTransaction:ApproveAgent": [
      { name: "hyperliquidChain", type: "string" },
      { name: "agentAddress", type: "address" },
      { name: "agentName", type: "string" },
      { name: "nonce", type: "uint64" },
    ],
  };

  const signature = await signUserSignedAction({ wallet, action, types });
  const recovered = await recoverUserFromUserSigned({ action, types, signature });

  assert.strictEqual(recovered, wallet.address);
});
