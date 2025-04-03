import { EventClient, WebSocketTransport } from "../../../mod.ts";

// —————————— Test ——————————

// NOTE: It is not known how to trigger this event.
// So we will just test the subscription.
Deno.test("notification", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    await client.notification({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, () => {});

    // —————————— Cleanup ——————————

    await transport.close();
});
