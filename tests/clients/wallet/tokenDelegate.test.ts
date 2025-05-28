import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { HttpTransport, ExchangeClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const VALIDATOR_ADDRESS = "0xa012b9040d83c5cbad9e6ea73c525027b755f596";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["tokenDelegate"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("tokenDelegate", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    // Check argument 'isUndelegate'
    const data1 = await exchClient.tokenDelegate({ validator: VALIDATOR_ADDRESS, wei: 1, isUndelegate: true });
    const data2 = await exchClient.tokenDelegate({ validator: VALIDATOR_ADDRESS, wei: 1, isUndelegate: false });

    schemaCoverage(MethodReturnType, [data1, data2]);
});
