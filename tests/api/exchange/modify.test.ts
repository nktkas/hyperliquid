import { type ModifyParameters, ModifyRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { openOrder, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/modify.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ModifySuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(ModifyRequest.entries.action.entries), ["type"]));

runTest({
  name: "modify",
  codeTestFn: async (_t, exchClient) => {
    const [restingGtc, restingAlo] = await Promise.all([
      // resting | oid number | Gtc | no cloid
      (async () => {
        const order = await openOrder(exchClient, "limit");
        const params: ModifyParameters = {
          oid: order.oid,
          order: {
            a: order.a,
            b: order.b,
            p: order.p,
            s: order.s,
            r: false,
            t: { limit: { tif: "Gtc" } },
          },
        };
        return { params, result: await exchClient.modify(params) };
      })(),
      // resting | oid cloid | Alo | cloid
      (async () => {
        const order = await openOrder(exchClient, "limit");
        const params: ModifyParameters = {
          oid: order.cloid,
          order: {
            a: order.a,
            b: order.b,
            p: order.p,
            s: order.s,
            r: false,
            t: { limit: { tif: "Alo" } },
            c: order.cloid,
          },
        };
        return { params, result: await exchClient.modify(params) };
      })(),
    ]);
    // filled | Ioc
    const ioc = await (async () => {
      const order = await openOrder(exchClient, "limit");
      const params: ModifyParameters = {
        oid: order.oid,
        order: {
          a: order.a,
          b: order.b,
          p: order.b ? order.pxUp : order.pxDown,
          s: order.s,
          r: false,
          t: { limit: { tif: "Ioc" } },
        },
      };
      return { params, result: await exchClient.modify(params) };
    })();
    // filled | FrontendMarket
    const frontendMarket = await (async () => {
      const order = await openOrder(exchClient, "limit");
      const params: ModifyParameters = {
        oid: order.oid,
        order: {
          a: order.a,
          b: order.b,
          p: order.b ? order.pxUp : order.pxDown,
          s: order.s,
          r: false,
          t: { limit: { tif: "FrontendMarket" } },
        },
      };
      return { params, result: await exchClient.modify(params) };
    })();
    // resting | trigger | tp
    const triggerTp = await (async () => {
      const order = await openOrder(exchClient, "limit");
      const params: ModifyParameters = {
        oid: order.oid,
        order: {
          a: order.a,
          b: order.b,
          p: order.p,
          s: order.s,
          r: false,
          t: { trigger: { isMarket: true, triggerPx: order.pxUp, tpsl: "tp" } },
        },
      };
      return { params, result: await exchClient.modify(params) };
    })();
    // resting | trigger | sl
    const triggerSl = await (async () => {
      const order = await openOrder(exchClient, "limit");
      const params: ModifyParameters = {
        oid: order.oid,
        order: {
          a: order.a,
          b: order.b,
          p: order.p,
          s: order.s,
          r: false,
          t: { trigger: { isMarket: false, triggerPx: order.pxDown, tpsl: "sl" } },
        },
      };
      return { params, result: await exchClient.modify(params) };
    })();

    const data = [restingGtc, restingAlo, ioc, frontendMarket, triggerTp, triggerSl];

    schemaCoverage(paramsSchema, data.map((d) => d.params));
    schemaCoverage(responseSchema, data.map((d) => d.result));
  },
});
