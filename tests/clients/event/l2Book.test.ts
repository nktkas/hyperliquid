import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { type Book, EventClient, WebSocketTransport } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("l2Book", async (t) => {
    // —————————— Type schema ——————————

    const Book = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("Book");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await deadline(
            new Promise<Book>((resolve, reject) => {
                const subscrPromise = client.l2Book({ coin: "BTC" }, async (data) => {
                    try {
                        await (await subscrPromise).unsubscribe();
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                });
            }),
            15_000,
        );
        assertJsonSchema(Book, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check argument 'nSigFigs'", async (t) => {
                await t.step("nSigFigs: 2", async () => {
                    const data = await deadline(
                        new Promise<Book>((resolve, reject) => {
                            const subscrPromise = client.l2Book({ coin: "BTC", nSigFigs: 2 }, async (data) => {
                                try {
                                    await (await subscrPromise).unsubscribe();
                                    resolve(data);
                                } catch (error) {
                                    reject(error);
                                }
                            });
                        }),
                        15_000,
                    );
                    assertJsonSchema(Book, data);
                });

                await t.step("nSigFigs: 3", async () => {
                    const data = await deadline(
                        new Promise<Book>((resolve, reject) => {
                            const subscrPromise = client.l2Book({ coin: "BTC", nSigFigs: 3 }, async (data) => {
                                try {
                                    await (await subscrPromise).unsubscribe();
                                    resolve(data);
                                } catch (error) {
                                    reject(error);
                                }
                            });
                        }),
                        15_000,
                    );
                    assertJsonSchema(Book, data);
                });

                await t.step("nSigFigs: 4", async () => {
                    const data = await deadline(
                        new Promise<Book>((resolve, reject) => {
                            const subscrPromise = client.l2Book({ coin: "BTC", nSigFigs: 4 }, async (data) => {
                                try {
                                    await (await subscrPromise).unsubscribe();
                                    resolve(data);
                                } catch (error) {
                                    reject(error);
                                }
                            });
                        }),
                        15_000,
                    );
                    assertJsonSchema(Book, data);
                });

                await t.step("nSigFigs: 5", async () => {
                    const data = await deadline(
                        new Promise<Book>((resolve, reject) => {
                            const subscrPromise = client.l2Book({ coin: "BTC", nSigFigs: 5 }, async (data) => {
                                try {
                                    await (await subscrPromise).unsubscribe();
                                    resolve(data);
                                } catch (error) {
                                    reject(error);
                                }
                            });
                        }),
                        15_000,
                    );
                    assertJsonSchema(Book, data);
                });

                await t.step("nSigFigs: null", async () => {
                    const data = await deadline(
                        new Promise<Book>((resolve, reject) => {
                            const subscrPromise = client.l2Book({ coin: "BTC", nSigFigs: null }, async (data) => {
                                try {
                                    await (await subscrPromise).unsubscribe();
                                    resolve(data);
                                } catch (error) {
                                    reject(error);
                                }
                            });
                        }),
                        15_000,
                    );
                    assertJsonSchema(Book, data);
                });

                await t.step("nSigFigs: undefined", async () => {
                    const data = await deadline(
                        new Promise<Book>((resolve, reject) => {
                            const subscrPromise = client.l2Book({ coin: "BTC", nSigFigs: undefined }, async (data) => {
                                try {
                                    await (await subscrPromise).unsubscribe();
                                    resolve(data);
                                } catch (error) {
                                    reject(error);
                                }
                            });
                        }),
                        15_000,
                    );
                    assertJsonSchema(Book, data);
                });
            });

            await t.step("Check argument 'mantissa'", async (t) => {
                await t.step("mantissa: 2", async () => {
                    const data = await deadline(
                        new Promise<Book>((resolve, reject) => {
                            const subscrPromise = client.l2Book(
                                { coin: "BTC", nSigFigs: 5, mantissa: 2 },
                                async (data) => {
                                    try {
                                        await (await subscrPromise).unsubscribe();
                                        resolve(data);
                                    } catch (error) {
                                        reject(error);
                                    }
                                },
                            );
                        }),
                        15_000,
                    );
                    assertJsonSchema(Book, data);
                });

                await t.step("mantissa: 5", async () => {
                    const data = await deadline(
                        new Promise<Book>((resolve, reject) => {
                            const subscrPromise = client.l2Book(
                                { coin: "BTC", nSigFigs: 5, mantissa: 5 },
                                async (data) => {
                                    try {
                                        await (await subscrPromise).unsubscribe();
                                        resolve(data);
                                    } catch (error) {
                                        reject(error);
                                    }
                                },
                            );
                        }),
                        15_000,
                    );
                    assertJsonSchema(Book, data);
                });

                await t.step("mantissa: null", async () => {
                    const data = await deadline(
                        new Promise<Book>((resolve, reject) => {
                            const subscrPromise = client.l2Book(
                                { coin: "BTC", nSigFigs: 5, mantissa: null },
                                async (data) => {
                                    try {
                                        await (await subscrPromise).unsubscribe();
                                        resolve(data);
                                    } catch (error) {
                                        reject(error);
                                    }
                                },
                            );
                        }),
                        15_000,
                    );
                    assertJsonSchema(Book, data);
                });

                await t.step("mantissa: undefined", async () => {
                    const data = await deadline(
                        new Promise<Book>((resolve, reject) => {
                            const subscrPromise = client.l2Book(
                                { coin: "BTC", nSigFigs: 5, mantissa: undefined },
                                async (data) => {
                                    try {
                                        await (await subscrPromise).unsubscribe();
                                        resolve(data);
                                    } catch (error) {
                                        reject(error);
                                    }
                                },
                            );
                        }),
                        15_000,
                    );
                    assertJsonSchema(Book, data);
                });
            });
        },
        ignore: !isMatchToScheme,
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
