// deno-lint-ignore-file no-import-prefix
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertRejects } from "jsr:@std/assert@1";
import { runTest } from "./_t.ts";

runTest({
    name: "cValidatorAction",
    codeTestFn: async (t, clients) => {
        await t.step("changeProfile", async () => {
            await assertRejects(
                async () => {
                    await clients.exchange.cValidatorAction({
                        changeProfile: {
                            node_ip: { Ip: "1.2.3.4" },
                            name: "...",
                            description: "...",
                            unjailed: false,
                            disable_delegations: false,
                            commission_bps: null,
                            signer: null,
                        },
                    });
                },
                ApiRequestError,
                "Unknown validator",
            );
        });

        await t.step("register", async () => {
            await assertRejects(
                async () => {
                    await clients.exchange.cValidatorAction({
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
                    });
                },
                ApiRequestError,
                "Validator has delegations disabled",
            );
        });

        await t.step("unregister", async () => {
            await assertRejects(
                async () => {
                    await clients.exchange.cValidatorAction({ unregister: null });
                },
                ApiRequestError,
                "Action disabled on this chain",
            );
        });
    },
});
