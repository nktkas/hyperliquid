// deno-lint-ignore-file no-import-prefix
import { UserFundingsEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("userFundings", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<UserFundingsEvent>((resolve) => {
        client.userFundings({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(UserFundingsEvent, data, {
    ignoreUndefinedTypes: ["#/properties/isSnapshot"],
  });
});
