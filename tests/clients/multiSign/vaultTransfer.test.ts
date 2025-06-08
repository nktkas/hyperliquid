import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import { assertIsError } from "jsr:@std/assert@1";
import { ApiRequestError, type Hex, HttpTransport } from "../../../mod.ts";
import { MultiSignClient } from "../../../src/clients/multiSign.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const MULTI_SIGN_ADDRESS = "0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83";
const VAULT_ADDRESS = "0xd0d0eb5de91f14e53312adf92cabcbbfd2b4f24f";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<MultiSignClient["vaultTransfer"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("vaultTransfer", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const multiSignClient = new MultiSignClient({
        transport,
        multiSignAddress: MULTI_SIGN_ADDRESS,
        signers: [account],
        isTestnet: true,
    });

    // —————————— Test ——————————

    // Check argument 'isDeposit' + argument 'expiresAfter'
    await multiSignClient.vaultTransfer({
        vaultAddress: VAULT_ADDRESS,
        isDeposit: false,
        usd: 5 * 1e6,
    })
        .then((data) => {
            schemaCoverage(MethodReturnType, [data]);
        })
        .catch((e) => {
            try {
                assertIsError(e, ApiRequestError, "Insufficient vault equity for withdrawal");
            } catch {
                assertIsError(e, ApiRequestError, "This vault does not accept deposits");
            }
        });
    await multiSignClient.vaultTransfer({
        vaultAddress: VAULT_ADDRESS,
        isDeposit: true,
        usd: 5 * 1e6,
        expiresAfter: Date.now() + 1000 * 60 * 60,
    })
        .then((data) => {
            schemaCoverage(MethodReturnType, [data]);
        })
        .catch((e) => {
            try {
                assertIsError(e, ApiRequestError, "Insufficient vault equity for withdrawal");
            } catch {
                assertIsError(e, ApiRequestError, "This vault does not accept deposits");
            }
        });
});
