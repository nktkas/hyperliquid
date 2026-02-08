import * as v from "@valibot/valibot";
import { type UserRoleParameters, UserRoleRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userRole.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserRoleResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserRoleRequest, ["type"]));

runTest({
  name: "userRole",
  codeTestFn: async (_t, client) => {
    const params: UserRoleParameters[] = [
      { user: "0x941a505ACc11F5f3A12b5eF0d414A8Bff45c5e77" }, // role = missing
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, // role = user
      { user: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b" }, // role = vault
      { user: "0xb0b3460d7bd6c01a8d7dad8b152292bf1a47883b" }, // role = agent
      { user: "0x22a454d3322060475552e8f922ec0c778b8e5760" }, // role = subAccount
    ];

    const data = await Promise.all(params.map((p) => client.userRole(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userRole",
      "--user=0x941a505ACc11F5f3A12b5eF0d414A8Bff45c5e77",
    ]);
    v.parse(UserRoleRequest, data);
  },
});
