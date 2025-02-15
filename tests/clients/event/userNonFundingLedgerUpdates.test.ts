import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { assert } from "jsr:@std/assert@^1.0.10";
import { EventClient, WebSocketTransport, type WsUserNonFundingLedgerUpdates } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("userNonFundingLedgerUpdates", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Type schema ——————————

    const WsUserNonFundingLedgerUpdates = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("WsUserNonFundingLedgerUpdates");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    const data = await deadline(
        new Promise<WsUserNonFundingLedgerUpdates>((resolve, reject) => {
            const subscrPromise = client.userNonFundingLedgerUpdates(
                { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
                async (data) => {
                    try {
                        await (await subscrPromise).unsubscribe();
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                },
            );
        }),
        15_000,
    );

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(WsUserNonFundingLedgerUpdates, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'type'", async (t) => {
                await t.step("some should be 'accountClassTransfer'", () => {
                    assert(data.nonFundingLedgerUpdates.some((item) => item.delta.type === "accountClassTransfer"));
                });

                await t.step("some should be 'deposit'", () => {
                    assert(data.nonFundingLedgerUpdates.some((item) => item.delta.type === "deposit"));
                });

                await t.step("some should be 'internalTransfer'", () => {
                    assert(data.nonFundingLedgerUpdates.some((item) => item.delta.type === "internalTransfer"));
                });

                await t.step("some should be 'liquidation'", () => {
                    assert(data.nonFundingLedgerUpdates.some((item) => item.delta.type === "liquidation"));
                });

                await t.step("some should be 'rewardsClaim'", () => {
                    assert(data.nonFundingLedgerUpdates.some((item) => item.delta.type === "rewardsClaim"));
                });

                await t.step("some should be 'spotTransfer'", () => {
                    assert(data.nonFundingLedgerUpdates.some((item) => item.delta.type === "spotTransfer"));
                });

                await t.step("some should be 'subAccountTransfer'", () => {
                    assert(data.nonFundingLedgerUpdates.some((item) => item.delta.type === "subAccountTransfer"));
                });

                await t.step("some should be 'vaultCreate'", () => {
                    assert(data.nonFundingLedgerUpdates.some((item) => item.delta.type === "vaultCreate"));
                });

                await t.step("some should be 'vaultDeposit'", () => {
                    assert(data.nonFundingLedgerUpdates.some((item) => item.delta.type === "vaultDeposit"));
                });

                await t.step("some should be 'vaultDistribution'", () => {
                    assert(data.nonFundingLedgerUpdates.some((item) => item.delta.type === "vaultDistribution"));
                });

                await t.step("some should be 'vaultWithdraw'", () => {
                    assert(data.nonFundingLedgerUpdates.some((item) => item.delta.type === "vaultWithdraw"));
                });

                await t.step("some should be 'withdraw'", () => {
                    assert(data.nonFundingLedgerUpdates.some((item) => item.delta.type === "withdraw"));
                });
            });
        },
        ignore: !isMatchToScheme,
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
