import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["userFills"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("userFills", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.userFills({ user: USER_ADDRESS }),
        // Check argument 'aggregateByTime'
        infoClient.userFills({ user: USER_ADDRESS, aggregateByTime: true }),
        infoClient.userFills({ user: USER_ADDRESS, aggregateByTime: false }),
        infoClient.userFills({ user: USER_ADDRESS, aggregateByTime: undefined }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
