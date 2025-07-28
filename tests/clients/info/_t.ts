import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { HttpTransport, InfoClient } from "../../../mod.ts";

// —————————— Arguments ——————————

const cliArgs = parseArgs(Deno.args, { default: { wait: 0 }, string: ["_"] }) as Args<{
    /** Delay to avoid rate limits */
    wait: number;
}>;

// —————————— Clients ——————————

const infoClient = new InfoClient({ transport: new HttpTransport({ isTestnet: true }) });

// —————————— Functions ——————————

export function runTest(name: string, testFn: (t: Deno.TestContext, client: InfoClient) => Promise<void>): void {
    Deno.test(name, async (t) => {
        await new Promise((r) => setTimeout(r, cliArgs.wait)); // delay to avoid rate limits
        await testFn(t, infoClient);
    });
}
