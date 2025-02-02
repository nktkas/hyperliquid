import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const USER_ADDRESS_WITH_MULTISIG_SIGNERS = "0x7A8b673a176a430b80cfCDfdFB6b10ED55010Ebb";
const USER_ADDRESS_WITHOUT_MULTISIG_SIGNERS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["userToMultiSigSigners"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("userToMultiSigSigners", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    await t.step("Matching data to type schema", async (t) => {
        await t.step("response should be an 'object'", async () => {
            const data = await client.userToMultiSigSigners({ user: USER_ADDRESS_WITH_MULTISIG_SIGNERS });
            assertJsonSchema(MethodReturnType, data);
            assert(typeof data === "object" && data !== null, `Expected data to be an 'object', got '${typeof data}'`);
        });
        await t.step("response should be 'null'", async () => {
            const data = await client.userToMultiSigSigners({ user: USER_ADDRESS_WITHOUT_MULTISIG_SIGNERS });
            // NOTE: tsj does not return a null schema
            // assertJsonSchema(MethodReturnType, data);
            assert(data === null, `Expected data to be 'null', got '${typeof data}'`);
        });
    });
});
