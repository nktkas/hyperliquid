import { ApiRequestError } from "@nktkas/hyperliquid";
import {
  type ActivateOutcomeDeployerParameters,
  ActivateOutcomeDeployerRequest,
} from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(ActivateOutcomeDeployerRequest.entries.action.entries), ["type"]),
);

runTest({
  name: "activateOutcomeDeployer",
  codeTestFn: async (_t, exchClient) => {
    const params: ActivateOutcomeDeployerParameters[] = [
      // activate
      { isDeactivate: false },
      // deactivate
      { isDeactivate: true },
    ];

    await assertRejects(
      async () => {
        await exchClient.activateOutcomeDeployer(params[0]);
      },
      ApiRequestError,
      "Insufficient stake",
    );
    await assertRejects(
      async () => {
        await exchClient.activateOutcomeDeployer(params[1]);
      },
      ApiRequestError,
      "Error deploying outcome: not an outcome deployer",
    );

    schemaCoverage(paramsSchema, params);
  },
});
