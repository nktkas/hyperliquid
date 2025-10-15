// deno-lint-ignore-file no-import-prefix
import { UserFillsEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("userFills", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<UserFillsEvent>((resolve) => {
        client.userFills({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(UserFillsEvent, data, {
    ignoreDefinedTypes: [
      "#/properties/fills/items/properties/liquidation",
      "#/properties/fills/items/properties/twapId",
    ],
    ignoreUndefinedTypes: [
      "#/properties/isSnapshot",
    ],
  });
});
