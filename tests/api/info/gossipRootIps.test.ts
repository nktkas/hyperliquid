import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/gossipRootIps.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "GossipRootIpsResponse");

runTest({
  name: "gossipRootIps",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.gossipRootIps()]);

    schemaCoverage(responseSchema, data, [
      "#/array",
    ]);
  },
});
