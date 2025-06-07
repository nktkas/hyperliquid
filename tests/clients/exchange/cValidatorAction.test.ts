import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import { assertRejects } from "jsr:@std/assert@1";
import { ApiRequestError, ExchangeClient, type Hex, HttpTransport } from "../../../mod.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;

// —————————— Test ——————————

// NOTE: This API is difficult to test with a successful response.
// So to prove that the method works, we will expect a specific error
Deno.test("cValidatorAction", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await Promise.all([
        assertRejects(
            () => exchClient.cValidatorAction({ changeProfile: { unjailed: false } }),
            ApiRequestError,
            "Unknown validator",
        ),
        assertRejects(
            () =>
                exchClient.cValidatorAction({
                    register: {
                        profile: {
                            node_ip: { Ip: "1.2.3.4" },
                            name: "...",
                            description: "...",
                            delegations_disabled: true,
                            commission_bps: 1,
                            signer: exchClient.wallet.address,
                        },
                        unjailed: false,
                        initial_wei: 1,
                    },
                }),
            ApiRequestError,
            "Validator has delegations disabled",
        ),
        assertRejects(
            () => exchClient.cValidatorAction({ unregister: null }),
            ApiRequestError,
            "Action disabled on this chain",
        ),
    ]);
});
