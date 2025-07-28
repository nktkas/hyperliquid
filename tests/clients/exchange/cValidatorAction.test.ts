import { assertRejects } from "jsr:@std/assert@1";
import { ApiRequestError, type ExchangeClient, type InfoClient, type MultiSignClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["cValidatorAction"]>>;
const _MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    await t.step("changeProfile", async () => {
        await assertRejects(
            () =>
                client.exchange.cValidatorAction({
                    changeProfile: {
                        node_ip: { Ip: "1.2.3.4" },
                        name: "...",
                        description: "...",
                        unjailed: false,
                        disable_delegations: false,
                        commission_bps: null,
                        signer: null,
                    },
                }),
            ApiRequestError,
            "Unknown validator",
        );
    });

    await t.step("register", async () => {
        await assertRejects(
            () =>
                client.exchange.cValidatorAction({
                    register: {
                        profile: {
                            node_ip: { Ip: "1.2.3.4" },
                            name: "...",
                            description: "...",
                            delegations_disabled: true,
                            commission_bps: 1,
                            signer: "0x0000000000000000000000000000000000000001",
                        },
                        unjailed: false,
                        initial_wei: 1,
                    },
                }),
            ApiRequestError,
            "Validator has delegations disabled",
        );
    });

    await t.step("unregister", async () => {
        await assertRejects(
            () => client.exchange.cValidatorAction({ unregister: null }),
            ApiRequestError,
            "Action disabled on this chain",
        );
    });
}

runTest("cValidatorAction", testFn);
