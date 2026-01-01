import * as v from "@valibot/valibot";
import { BatchModifyRequest, BatchModifyResponse } from "@nktkas/hyperliquid/api/exchange";
import { excludeErrorResponse, openOrder, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "batchModify",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      // resting
      (async () => {
        // ========== Prepare ==========

        const order = await openOrder(exchClient, "limit");

        // ========== Test ==========

        return await exchClient.batchModify({
          modifies: [{
            oid: order.oid,
            order: {
              a: order.a,
              b: order.b,
              p: order.p,
              s: order.s,
              r: false,
              t: { limit: { tif: "Gtc" } },
            },
          }],
        });
      })(),
      // resting | cloid
      (async () => {
        // ========== Prepare ==========

        const order = await openOrder(exchClient, "limit");

        // ========== Test ==========

        return await exchClient.batchModify({
          modifies: [{
            oid: order.cloid,
            order: {
              a: order.a,
              b: order.b,
              p: order.p,
              s: order.s,
              r: false,
              t: { limit: { tif: "Gtc" } },
              c: order.cloid,
            },
          }],
        });
      })(),
      // filled
      (async () => {
        // ========== Prepare ==========

        const order = await openOrder(exchClient, "limit");

        // ========== Test ==========

        return await exchClient.batchModify({
          modifies: [{
            oid: order.oid,
            order: {
              a: order.a,
              b: order.b,
              p: order.b ? order.pxUp : order.pxDown,
              s: order.s,
              r: false,
              t: { limit: { tif: "Gtc" } },
            },
          }],
        });
      })(),
      // filled | cloid
      (async () => {
        // ========== Prepare ==========

        const order = await openOrder(exchClient, "limit");

        // ========== Test ==========

        return await exchClient.batchModify({
          modifies: [{
            oid: order.cloid,
            order: {
              a: order.a,
              b: order.b,
              p: order.b ? order.pxUp : order.pxDown,
              s: order.s,
              r: false,
              t: { limit: { tif: "Gtc" } },
              c: order.cloid,
            },
          }],
        });
      })(),
    ]);
    schemaCoverage(excludeErrorResponse(BatchModifyResponse), data, {
      ignoreBranches: {
        "#/properties/response/properties/data/properties/statuses/items": [2, 3],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "batchModify",
      `--modifies=${
        JSON.stringify([
          { oid: 12345, order: { a: 0, b: true, p: "1", s: "1", r: false, t: { limit: { tif: "Gtc" } } } },
          { oid: 12346, order: { a: 1, b: false, p: "2", s: "2", r: true, t: { limit: { tif: "Alo" } } } },
        ])
      }`,
    ]);
    v.parse(BatchModifyRequest, data);
  },
});
