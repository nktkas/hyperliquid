import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assertGreater } from "jsr:@std/assert@^1.0.4";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("predictedFundings", async () => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("PredictedFunding");

    // Create client
    const client = new PublicClient(new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" }));

    //Test
    const data = await client.predictedFundings();
    assertGreater(data.length, 0, "Unable to fully validate the type due to an empty array");
    data.forEach((item) => assertJsonSchema(schema, item));
});
