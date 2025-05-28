import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["userTwapSliceFillsByTime"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("userTwapSliceFillsByTime", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.userTwapSliceFillsByTime({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
        }),
        // Check argument 'endTime'
        infoClient.userTwapSliceFillsByTime({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            endTime: Date.now(),
        }),
        infoClient.userTwapSliceFillsByTime({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            endTime: null,
        }),
        infoClient.userTwapSliceFillsByTime({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            endTime: undefined,
        }),
        // Check argument 'aggregateByTime'
        infoClient.userTwapSliceFillsByTime({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            aggregateByTime: true,
        }),
        infoClient.userTwapSliceFillsByTime({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            aggregateByTime: false,
        }),
        infoClient.userTwapSliceFillsByTime({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            aggregateByTime: undefined,
        }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
