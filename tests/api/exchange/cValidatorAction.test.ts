import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { type CValidatorActionParameters, CValidatorActionRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const paramsSchema = valibotToJsonSchema(
  v.union(
    CValidatorActionRequest.entries.action.options.map((option) => v.omit(option, ["type"])),
  ),
);

runTest({
  name: "cValidatorAction",
  codeTestFn: async (_t, exchClient) => {
    const params: CValidatorActionParameters[] = [
      {
        changeProfile: {
          node_ip: { Ip: "1.2.3.4" },
          name: "...",
          description: "...",
          unjailed: false,
          disable_delegations: false,
          commission_bps: null,
          signer: null,
        },
      },
      {
        changeProfile: {
          node_ip: null,
          name: null,
          description: null,
          unjailed: true,
          disable_delegations: null,
          commission_bps: 1,
          signer: "0x0000000000000000000000000000000000000001",
        },
      },
      {
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
      },
      { unregister: null },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.cValidatorAction(p);
        },
        ApiRequestError,
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
