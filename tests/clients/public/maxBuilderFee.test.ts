import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const BUILDER_ADDRESS = "0xe019d6167E7e324aEd003d94098496b6d986aB05";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["maxBuilderFee"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("maxBuilderFee", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    await t.step("Matching data to type schema", async () => {
        const data = await client.maxBuilderFee({ user: BUILDER_ADDRESS, builder: BUILDER_ADDRESS });
        assertJsonSchema(MethodReturnType, data);
    });
});
