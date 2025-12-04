// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { CValidatorActionRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

runTest({
  name: "cValidatorAction",
  codeTestFn: async (t, exchClient) => {
    await t.step("changeProfile", async () => {
      await assertRejects(
        async () => {
          await exchClient.cValidatorAction({
            changeProfile: {
              node_ip: { Ip: "1.2.3.4" },
              name: "...",
              description: "...",
              unjailed: false,
              disable_delegations: false,
              commission_bps: null,
              signer: null,
            },
          });
        },
        ApiRequestError,
        "Unknown validator",
      );
    });

    await t.step("register", async () => {
      await assertRejects(
        async () => {
          await exchClient.cValidatorAction({
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
          });
        },
        ApiRequestError,
        "Validator has delegations disabled",
      );
    });

    await t.step("unregister", async () => {
      await assertRejects(
        async () => {
          await exchClient.cValidatorAction({ unregister: null });
        },
        ApiRequestError,
        "Action disabled on this chain",
      );
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "cValidatorAction",
      `--register=${
        JSON.stringify({
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
        })
      }`,
    ]);
    v.parse(CValidatorActionRequest, data);
  },
});
