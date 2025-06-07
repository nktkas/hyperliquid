import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import BigNumber from "npm:bignumber.js@9";
import { ExchangeClient, type Hex, HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatSize, getAssetData } from "../../_utils/utils.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["twapOrder"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("twapOrder", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });
    const infoClient = new InfoClient({ transport });

    const { id, universe, ctx } = await getAssetData(infoClient, PERPS_ASSET);
    const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check response 'success'
        exchClient.twapOrder({
            a: id,
            b: true,
            s: sz,
            r: false,
            m: 5,
            t: false,
        }),
        // Check argument 'expiresAfter'
        exchClient.twapOrder({
            a: id,
            b: true,
            s: sz,
            r: false,
            m: 5,
            t: false,
            expiresAfter: Date.now() + 1000 * 60 * 60,
        }),
    ]);

    try {
        schemaCoverage(MethodReturnType, data, {
            ignoreBranchesByPath: {
                "#/properties/response/properties/data/properties/status/anyOf": [1], // error
            },
        });
    } finally {
        // —————————— Cleanup ——————————

        await Promise.all(data.map((d) => {
            return exchClient.twapCancel({ a: id, t: d.response.data.status.running.twapId });
        }));
    }
});
