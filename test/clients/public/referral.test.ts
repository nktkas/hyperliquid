import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.9";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const NON_REFERRED = "0x0000000000000000000000000000000000000000";
const REFERRED = "0x091288cd1e81e065d1541ec73dd0dfdde2f529fa";
const STATE_READY = "0xe019d6167E7e324aEd003d94098496b6d986aB05";
const STATE_NEED_TO_CREATE_CODE = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";
const STATE_NEED_TO_TRADE = "0x0000000000000000000000000000000000000000";

Deno.test("referral", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("Referral");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    await t.step("referredBy", async (t) => {
        await t.step("should be null", async () => {
            const data = await client.referral({ user: NON_REFERRED });

            assertJsonSchema(schema, data);
            assert(data.referredBy === null);
        });

        await t.step("should not be null", async () => {
            const data = await client.referral({ user: REFERRED });

            assertJsonSchema(schema, data);
            assert(data.referredBy !== null);
        });
    });

    await t.step("referrerState", async (t) => {
        await t.step("should be ready", async () => {
            const data = await client.referral({ user: STATE_READY });

            assertJsonSchema(schema, data);
            assert(data.referrerState.stage === "ready");
        });

        await t.step("should be needToCreateCode", async () => {
            const data = await client.referral({ user: STATE_NEED_TO_CREATE_CODE });

            assertJsonSchema(schema, data);
            assert(
                data.referrerState.stage === "needToCreateCode",
                "Failed to verify type with 'referrerState.stage === needToCreateCode'",
            );
        });

        await t.step("should be needToTrade", async () => {
            const data = await client.referral({ user: STATE_NEED_TO_TRADE });

            assertJsonSchema(schema, data);
            assert(
                data.referrerState.stage === "needToTrade",
                "Failed to verify type with 'referrerState.stage === needToTrade'",
            );
        });
    });

    // TODO: Not found not empty rewardHistory
    await t.step({ name: "rewardHistory", fn: () => {}, ignore: true });
});
