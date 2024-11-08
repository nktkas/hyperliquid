import { type Hex, HttpTransport, InfoClient } from "../index.ts";
import { assertJsonSchema, recursiveTraversal } from "./utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";

const USER_ADDRESS: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";
const BUILDER_ADDRESS: Hex = "0xe019d6167E7e324aEd003d94098496b6d986aB05";

const LONG = { oid: 15029784876, cloid: "0xdd4797ac01135e0dc6b7d163deaff897" } as const;
const SHORT = { oid: 15029758931, cloid: "0x91a7f7c40b23d59dd399b38e219805cb" } as const;
const LIMIT = { oid: 15030023260, cloid: "0xcf4168b64a499def2901f4e12d50f877" } as const;
const STOP_MARKET = { oid: 15030149356, cloid: "0xd4bb069b673a48161bca56cfc88deb6b" } as const;
const STOP_LIMIT = { oid: 15030701730, cloid: "0xa81c445e1ece30c6bbf20c237409700b" } as const;
const GTC = { oid: 15030023260, cloid: "0xcf4168b64a499def2901f4e12d50f877" } as const;
const ALO = { oid: 15030054922, cloid: "0xb7766a15f924a1c1f8fd635f255f36a3" } as const;
const WITHOUT_CLOID = { oid: 15548036277 } as const;

const NON_REFERRED: Hex = "0x0000000000000000000000000000000000000000";
const REFERRED: Hex = "0x091288cd1e81e065d1541ec73dd0dfdde2f529fa";
const STATE_READY: Hex = "0xe019d6167E7e324aEd003d94098496b6d986aB05";
const STATE_NEED_TO_CREATE_CODE: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";
const STATE_NEED_TO_TRADE: Hex = "0x0000000000000000000000000000000000000000";

Deno.test("Info Endpoints Tests + HttpTransport", async (t) => {
    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz/" });
    const client = new InfoClient(transport);

    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/endpoints/types/info.d.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema();

    // Tests
    await t.step("allMids", async () => {
        const data = await client.allMids();
        assertJsonSchema(schema, data);
    });

    await t.step("candleSnapshot", async (t) => {
        await t.step("coin + interval + startTime", async () => {
            const data = await client.candleSnapshot({
                coin: "ETH",
                interval: "15m",
                startTime: Date.now() - 1000 * 60 * 60 * 24,
            });

            assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
            data.forEach((item) => assertJsonSchema(schema, item));
        });

        await t.step("coin + interval + startTime + endTime", async () => {
            const data = await client.candleSnapshot({
                coin: "ETH",
                interval: "15m",
                startTime: Date.now() - 1000 * 60 * 60 * 24,
                endTime: Date.now(),
            });

            assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
            data.forEach((item) => assertJsonSchema(schema, item));
        });
    });

    await t.step("clearinghouseState", async (t) => {
        const data = await client.clearinghouseState({ user: USER_ADDRESS });

        assertJsonSchema(schema, data);

        await t.step("assetPositions", async (t) => {
            await t.step("position.leverage", async (t) => {
                await t.step("type === isolated", () => {
                    assert(data.assetPositions.find((item) => item.position.leverage.type === "isolated"));
                });

                await t.step("type === cross", () => {
                    assert(data.assetPositions.find((item) => item.position.leverage.type === "cross"));
                });
            });

            await t.step("position.liquidationPx", async (t) => {
                await t.step("typeof liquidationPx === string", () => {
                    assert(data.assetPositions.find((item) => typeof item.position.liquidationPx === "string"));
                });

                await t.step("liquidationPx === null", () => {
                    assert(data.assetPositions.find((item) => item.position.liquidationPx === null));
                });
            });
        });
    });

    await t.step("frontendOpenOrders", async (t) => {
        const data = await client.frontendOpenOrders({ user: USER_ADDRESS });

        assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step("side", async (t) => {
            await t.step("side === B", () => {
                assert(data.find((item) => item.side === "B"));
            });

            await t.step("side === A", () => {
                assert(data.find((item) => item.side === "A"));
            });
        });

        // TODO: Couldn't find a 'children' field
        await t.step({ name: "children", fn: () => {}, ignore: true });

        await t.step("orderType", async (t) => {
            // TODO: Couldn't find a `Market` order
            await t.step({ name: "orderType === Market", fn: () => {}, ignore: true });

            await t.step("orderType === Limit", () => {
                assert(data.find((item) => item.orderType === "Limit"));
            });

            await t.step("orderType === Stop Market", () => {
                assert(data.find((item) => item.orderType === "Stop Market"));
            });

            await t.step("orderType === Stop Limit", () => {
                assert(data.find((item) => item.orderType === "Stop Limit"));
            });

            // TODO: Couldn't find a `Scale` order
            await t.step({ name: "orderType === Scale", fn: () => {}, ignore: true });

            // TODO: Couldn't find a `TWAP` order
            await t.step({ name: "orderType === TWAP", fn: () => {}, ignore: true });
        });

        await t.step("tif", async (t) => {
            await t.step("tif === Gtc", () => {
                assert(data.find((item) => item.tif === "Gtc"));
            });

            // TODO: Couldn't find a `Ioc` order
            await t.step({ name: "tif === Ioc", fn: () => {}, ignore: true });

            await t.step("tif === Alo", () => {
                assert(data.find((item) => item.tif === "Alo"));
            });
        });

        await t.step("cloid", async (t) => {
            await t.step("typeof cloid === string", () => {
                assert(data.find((item) => typeof item.cloid === "string"));
            });

            await t.step("cloid === null", () => {
                assert(data.find((item) => item.cloid === null));
            });
        });
    });

    await t.step("fundingHistory", async (t) => {
        await t.step("coin + startTime", async () => {
            const data = await client.fundingHistory({
                coin: "ETH",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            });

            assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
            data.forEach((item) => assertJsonSchema(schema, item));
        });

        await t.step("coin + startTime + endTime", async () => {
            const data = await client.fundingHistory({
                coin: "ETH",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: Date.now(),
            });

            assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
            data.forEach((item) => assertJsonSchema(schema, item));
        });
    });

    await t.step("l2Book", async (t) => {
        await t.step("coin", async () => {
            const data = await client.l2Book({ coin: "ETH" });

            assertJsonSchema(schema, data);
            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
        });

        await t.step("coin + nSigFigs", async (t) => {
            await t.step("nSigFigs === 2", async () => {
                const data = await client.l2Book({ coin: "ETH", nSigFigs: 2 });

                assertJsonSchema(schema, data);
                recursiveTraversal(data, (key, value) => {
                    if (Array.isArray(value)) {
                        assertGreater(
                            value.length,
                            0,
                            `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                        );
                    }
                });
            });

            await t.step("nSigFigs === 3", async () => {
                const data = await client.l2Book({ coin: "ETH", nSigFigs: 3 });

                assertJsonSchema(schema, data);
                recursiveTraversal(data, (key, value) => {
                    if (Array.isArray(value)) {
                        assertGreater(
                            value.length,
                            0,
                            `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                        );
                    }
                });
            });

            await t.step("nSigFigs === 4", async () => {
                const data = await client.l2Book({ coin: "ETH", nSigFigs: 4 });

                assertJsonSchema(schema, data);
                recursiveTraversal(data, (key, value) => {
                    if (Array.isArray(value)) {
                        assertGreater(
                            value.length,
                            0,
                            `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                        );
                    }
                });
            });

            await t.step("nSigFigs === 5", async () => {
                const data = await client.l2Book({ coin: "ETH", nSigFigs: 5 });

                assertJsonSchema(schema, data);
                recursiveTraversal(data, (key, value) => {
                    if (Array.isArray(value)) {
                        assertGreater(
                            value.length,
                            0,
                            `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                        );
                    }
                });
            });
        });

        await t.step("coin + nSigFigs + mantissa", async (t) => {
            // TODO: "mantissa === 1" causes an error: Status 500 | Body: null
            await t.step({ name: "mantissa === 1", fn: () => {}, ignore: true });

            await t.step("mantissa === 2", async () => {
                const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 2 });

                assertJsonSchema(schema, data);
                recursiveTraversal(data, (key, value) => {
                    if (Array.isArray(value)) {
                        assertGreater(
                            value.length,
                            0,
                            `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                        );
                    }
                });
            });

            await t.step("mantissa === 5", async () => {
                const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 5 });

                assertJsonSchema(schema, data);
                recursiveTraversal(data, (key, value) => {
                    if (Array.isArray(value)) {
                        assertGreater(
                            value.length,
                            0,
                            `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                        );
                    }
                });
            });
        });
    });

    await t.step("maxBuilderFee", async () => {
        const data = await client.maxBuilderFee({ user: BUILDER_ADDRESS, builder: BUILDER_ADDRESS });
        assert(typeof data === "number", `Returned data is not a number, but ${typeof data}`);
    });

    await t.step("meta", async () => {
        const data = await client.meta();

        assertJsonSchema(schema, data);
        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });

    await t.step("metaAndAssetCtxs", async (t) => {
        const data = await client.metaAndAssetCtxs();

        assertJsonSchema(schema, data);
        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });

        await t.step("typeof AssetCtx.premium === string", () => {
            assert(data[1].find((item) => typeof item.premium === "string"));
        });

        await t.step("AssetCtx.premium === null", () => {
            assert(data[1].find((item) => item.premium === null));
        });

        await t.step("typeof AssetCtx.midPx === string", () => {
            assert(data[1].find((item) => typeof item.midPx === "string"));
        });

        await t.step("AssetCtx.midPx === null", () => {
            assert(data[1].find((item) => item.midPx === null));
        });

        await t.step("AssetCtx.impactPxs.length > 0", () => {
            assert(data[1].find((item) => Array.isArray(item.impactPxs) && item.impactPxs.length > 0));
        });

        await t.step("AssetCtx.impactPxs === null", () => {
            assert(data[1].find((item) => item.impactPxs === null));
        });
    });

    await t.step("openOrders", async (t) => {
        const data = await client.openOrders({ user: USER_ADDRESS });

        assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step("side", async (t) => {
            await t.step("find side === B", () => {
                assert(data.find((item) => item.side === "B"));
            });

            await t.step("find side === A", () => {
                assert(data.find((item) => item.side === "A"));
            });
        });

        await t.step("cloid", async (t) => {
            await t.step("find typeof cloid === string", () => {
                assert(data.find((item) => typeof item.cloid === "string"));
            });

            await t.step("find cloid === undefined", () => {
                assert(data.find((item) => item.cloid === undefined));
            });
        });
    });

    await t.step("orderStatus", async (t) => {
        await t.step(`OrderStatusResponse.status === "order"`, async (t) => {
            await t.step("oid", async (t) => {
                await t.step("side", async (t) => {
                    await t.step("side === B", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: LONG.oid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.side === "B");
                    });

                    await t.step("side === A", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: SHORT.oid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.side === "A");
                    });
                });

                // TODO: Couldn't find a 'children' field
                await t.step({ name: "children", fn: () => {}, ignore: true });

                await t.step("orderType", async (t) => {
                    // TODO: Couldn't find a `Market` order
                    await t.step({ name: "orderType === Market", fn: () => {}, ignore: true });

                    await t.step("orderType === Limit", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: LIMIT.oid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.orderType === "Limit", data.order.order.orderType);
                    });

                    await t.step("orderType === Stop Market", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: STOP_MARKET.oid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.orderType === "Stop Market", data.order.order.orderType);
                    });

                    await t.step("orderType === Stop Limit", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: STOP_LIMIT.oid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.orderType === "Stop Limit", data.order.order.orderType);
                    });

                    // TODO: Couldn't find a `Scale` order
                    await t.step({ name: "orderType === Scale", fn: () => {}, ignore: true });

                    // TODO: Couldn't find a `TWAP` order
                    await t.step({ name: "orderType === TWAP", fn: () => {}, ignore: true });
                });

                await t.step("tif", async (t) => {
                    await t.step("tif === Gtc", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: GTC.oid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.tif === "Gtc");
                    });

                    // TODO: Couldn't find a `Ioc` order
                    await t.step({ name: "tif === Ioc", fn: async () => {}, ignore: true });

                    await t.step("tif === Alo", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: ALO.oid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.tif === "Alo");
                    });
                });

                await t.step("cloid", async (t) => {
                    await t.step("typeof cloid === string", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: LONG.oid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.cloid);
                    });

                    await t.step("cloid === null", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: WITHOUT_CLOID.oid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(!data.order.order.cloid);
                    });
                });
            });

            await t.step("cloid", async (t) => {
                await t.step("side", async (t) => {
                    await t.step("side === B", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: LONG.cloid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.side === "B");
                    });

                    await t.step("side === A", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: SHORT.cloid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.side === "A");
                    });
                });

                // TODO: Couldn't find a 'children' field
                await t.step({ name: "children", fn: () => {}, ignore: true });

                await t.step("orderType", async (t) => {
                    // TODO: Couldn't find a `Market` order
                    await t.step({ name: "orderType === Market", fn: () => {}, ignore: true });

                    await t.step("orderType === Limit", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: LIMIT.cloid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.orderType === "Limit");
                    });

                    await t.step("orderType === Stop Market", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: STOP_MARKET.cloid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.orderType === "Stop Market", data.order.order.orderType);
                    });

                    await t.step("orderType === Stop Limit", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: STOP_LIMIT.cloid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.orderType === "Stop Limit", data.order.order.orderType);
                    });

                    // TODO: Couldn't find a `Scale` order
                    await t.step({ name: "orderType === Scale", fn: () => {}, ignore: true });

                    // TODO: Couldn't find a `TWAP` order
                    await t.step({ name: "orderType === TWAP", fn: () => {}, ignore: true });
                });

                await t.step("tif", async (t) => {
                    await t.step("tif === Gtc", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: GTC.cloid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.tif === "Gtc");
                    });

                    // TODO: Couldn't find a `Ioc` order
                    await t.step({ name: "tif === Ioc", fn: async () => {}, ignore: true });

                    await t.step("tif === Alo", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: ALO.cloid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.tif === "Alo");
                    });
                });

                await t.step("cloid", async (t) => {
                    await t.step("typeof cloid === string", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: LONG.cloid });

                        assertJsonSchema(schema, data);
                        assert(data.status === "order", "Expected status to be 'order'");
                        assert(data.order.order.cloid);
                    });
                });
            });
        });

        await t.step(`OrderStatusResponse.status == "unknownOid"`, async () => {
            const data = await client.orderStatus({ user: USER_ADDRESS, oid: 0 });

            assertJsonSchema(schema, data);
            assert(data.status === "unknownOid", "Expected status to be 'unknownOid'");
        });
    });

    await t.step("referral", async (t) => {
        await t.step("referredBy", async (t) => {
            await t.step("referredBy === null", async () => {
                const data = await client.referral({ user: NON_REFERRED });

                assertJsonSchema(schema, data);
                assert(data.referredBy === null);
            });

            await t.step("referredBy !== null", async () => {
                const data = await client.referral({ user: REFERRED });

                assertJsonSchema(schema, data);
                assert(data.referredBy !== null);
            });
        });

        await t.step("referrerState", async (t) => {
            await t.step("referrerState.stage === ready", async () => {
                const data = await client.referral({ user: STATE_READY });

                assertJsonSchema(schema, data);
                assert(data.referrerState.stage === "ready");
            });

            await t.step("referrerState.stage === needToCreateCode", async () => {
                const data = await client.referral({ user: STATE_NEED_TO_CREATE_CODE });

                assertJsonSchema(schema, data);
                assert(
                    data.referrerState.stage === "needToCreateCode",
                    "Failed to verify type with 'referrerState.stage === needToCreateCode'",
                );
            });

            await t.step("referrerState.stage === needToTrade", async () => {
                const data = await client.referral({ user: STATE_NEED_TO_TRADE });

                assertJsonSchema(schema, data);
                assert(
                    data.referrerState.stage === "needToTrade",
                    "Failed to verify type with 'referrerState.stage === needToTrade'",
                );
            });
        });

        // TODO: Not found not empty rewardHistory
        await t.step({ name: "rewardHistory", fn: () => {}, ignore: true });
    });

    await t.step("spotClearinghouseState", async () => {
        const data = await client.spotClearinghouseState({ user: USER_ADDRESS });

        assertJsonSchema(schema, data);
        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });

    await t.step("spotMeta", async (t) => {
        const data = await client.spotMeta();

        assertJsonSchema(schema, data);
        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });

        await t.step("tokens[].evmContract", async (t) => {
            await t.step("evmContract !== null", () => {
                assert(
                    data.tokens.find((item) => item.evmContract !== null),
                    "'evmContract !== null' failed",
                );
            });

            await t.step("evmContract === null", () => {
                assert(
                    data.tokens.find((item) => item.evmContract === null),
                    "'evmContract === null' failed",
                );
            });
        });

        await t.step("tokens[].fullName", async (t) => {
            await t.step("fullName === null", () => {
                assert(
                    data.tokens.find((item) => item.fullName === null),
                    "'fullName === null' failed",
                );
            });

            await t.step("typeof fullName === string", () => {
                assert(
                    data.tokens.find((item) => typeof item.fullName === "string"),
                    "'typeof fullName === string' failed",
                );
            });
        });
    });

    await t.step("spotMetaAndAssetCtxs", async (t) => {
        const data = await client.spotMetaAndAssetCtxs();

        assertJsonSchema(schema, data);
        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });

        await t.step("[0]", async (t) => {
            await t.step("tokens[].evmContract", async (t) => {
                await t.step("evmContract !== null", () => {
                    assert(
                        data[0].tokens.find((item) => item.evmContract !== null),
                        "'evmContract !== null' failed",
                    );
                });

                await t.step("evmContract === null", () => {
                    assert(
                        data[0].tokens.find((item) => item.evmContract === null),
                        "'evmContract === null' failed",
                    );
                });
            });

            await t.step("tokens[].fullName", async (t) => {
                await t.step("fullName === null", () => {
                    assert(
                        data[0].tokens.find((item) => item.fullName === null),
                        "'fullName === null' failed",
                    );
                });

                await t.step("typeof fullName === string", () => {
                    assert(
                        data[0].tokens.find((item) => typeof item.fullName === "string"),
                        "'typeof fullName === string' failed",
                    );
                });
            });
        });

        await t.step("[1]", async (t) => {
            await t.step("typeof AssetCtx.midPx === string", () => {
                assert(
                    data[1].find((item) => typeof item.midPx === "string"),
                    "'typeof AssetCtx.midPx === string' failed",
                );
            });

            await t.step("AssetCtx.midPx === null", () => {
                assert(
                    data[1].find((item) => item.midPx === null),
                    "'AssetCtx.midPx === null' failed",
                );
            });
        });
    });

    await t.step("subAccounts", async (t) => {
        const data = await client.subAccounts({ user: USER_ADDRESS });

        assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step("clearinghouseState", async (t) => {
            await t.step("assetPositions[].position.leverage", async (t) => {
                await t.step("type === isolated", () => {
                    assert(
                        data.find((item) =>
                            item.clearinghouseState.assetPositions.find((item) => item.position.leverage.type === "isolated")
                        ),
                    );
                });

                await t.step("type === cross", () => {
                    assert(
                        data.find((item) =>
                            item.clearinghouseState.assetPositions.find((item) => item.position.leverage.type === "cross")
                        ),
                    );
                });
            });

            await t.step("assetPositions[].position.liquidationPx", async (t) => {
                await t.step("typeof liquidationPx === string", () => {
                    assert(
                        data.find((item) =>
                            item.clearinghouseState.assetPositions.find((item) => typeof item.position.liquidationPx === "string")
                        ),
                    );
                });

                await t.step("liquidationPx === null", () => {
                    assert(
                        data.find((item) =>
                            item.clearinghouseState.assetPositions.find((item) => item.position.liquidationPx === null)
                        ),
                    );
                });
            });
        });

        await t.step("spotState.balances.length > 0", () => {
            assert(data.find((item) => item.spotState.balances.length > 0));
        });
    });

    await t.step("userFees", async () => {
        const data = await client.userFees({ user: USER_ADDRESS });

        assertJsonSchema(schema, data);
        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(
                    value.length,
                    0,
                    `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                );
            }
        });
    });

    await t.step("userFills", async (t) => {
        const data = await client.userFills({ user: USER_ADDRESS });

        assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step("side", async (t) => {
            await t.step("side === B", () => {
                assert(data.find((item) => item.side === "B"));
            });

            await t.step("side === A", () => {
                assert(data.find((item) => item.side === "A"));
            });
        });

        await t.step("cloid", async (t) => {
            await t.step("typeof cloid === string", () => {
                assert(data.find((item) => typeof item.cloid === "string"));
            });

            await t.step("cloid !== undefined", () => {
                assert(data.find((item) => item.cloid));
            });
        });

        await t.step("liquidation", async (t) => {
            await t.step("liquidation === undefined", () => {
                assert(data.find((item) => item.liquidation === undefined));
            });

            await t.step("liquidation !== undefined", () => {
                assert(data.find((item) => item.liquidation !== undefined));
            });
        });

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(
                    value.length,
                    0,
                    `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                );
            }
        });
    });

    await t.step("userFillsByTime", async (t) => {
        await t.step("user + startTime", async (t) => {
            const data = await client.userFillsByTime({
                user: USER_ADDRESS,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            });

            assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
            data.forEach((item) => assertJsonSchema(schema, item));

            await t.step("side", async (t) => {
                await t.step("side === B", () => {
                    assert(data.find((item) => item.side === "B"));
                });

                await t.step("side === A", () => {
                    assert(data.find((item) => item.side === "A"));
                });
            });

            await t.step("cloid", async (t) => {
                await t.step("typeof cloid === string", () => {
                    assert(data.find((item) => typeof item.cloid === "string"));
                });

                await t.step("cloid !== undefined", () => {
                    assert(data.find((item) => item.cloid));
                });
            });

            await t.step("liquidation", async (t) => {
                await t.step("liquidation === undefined", () => {
                    assert(data.find((item) => item.liquidation === undefined));
                });

                await t.step("liquidation !== undefined", () => {
                    assert(data.find((item) => item.liquidation !== undefined));
                });
            });

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
        });

        await t.step("user + startTime + endTime", async (t) => {
            const data = await client.userFillsByTime({
                user: USER_ADDRESS,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: Date.now(),
            });

            assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
            data.forEach((item) => assertJsonSchema(schema, item));

            await t.step("side", async (t) => {
                await t.step("side === B", () => {
                    assert(data.find((item) => item.side === "B"));
                });

                await t.step("side === A", () => {
                    assert(data.find((item) => item.side === "A"));
                });
            });

            await t.step("cloid", async (t) => {
                await t.step("typeof cloid === string", () => {
                    assert(data.find((item) => typeof item.cloid === "string"));
                });

                await t.step("cloid !== undefined", () => {
                    assert(data.find((item) => item.cloid));
                });
            });

            await t.step("liquidation", async (t) => {
                await t.step("liquidation === undefined", () => {
                    assert(data.find((item) => item.liquidation === undefined));
                });

                await t.step("liquidation !== undefined", () => {
                    assert(data.find((item) => item.liquidation !== undefined));
                });
            });

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
        });
    });

    await t.step("userFunding", async (t) => {
        await t.step("user + startTime", async (t) => {
            const data = await client.userFunding({
                user: USER_ADDRESS,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            });

            assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
            data.forEach((item) => assertJsonSchema(schema, item));
            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });

            await t.step("nSamples", async (t) => {
                await t.step("typeof nSamples === number", () => {
                    assert(data.find((item) => typeof item.delta.nSamples === "number"));
                });

                await t.step("nSamples === null", () => {
                    assert(data.find((item) => item.delta.nSamples === null));
                });
            });
        });

        await t.step("user + startTime + endTime", async (t) => {
            const data = await client.userFunding({
                user: USER_ADDRESS,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: Date.now(),
            });

            assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
            data.forEach((item) => assertJsonSchema(schema, item));
            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });

            await t.step("nSamples", async (t) => {
                await t.step("typeof nSamples === number", () => {
                    assert(data.find((item) => typeof item.delta.nSamples === "number"));
                });

                await t.step("nSamples === null", () => {
                    assert(data.find((item) => item.delta.nSamples === null));
                });
            });
        });
    });

    await t.step("userNonFundingLedgerUpdates", async (t) => {
        await t.step("user + startTime", async (t) => {
            const data = await client.userNonFundingLedgerUpdates({
                user: USER_ADDRESS,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            });

            assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
            data.forEach((item) => assertJsonSchema(schema, item));

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });

            await t.step("type === deposit", () => {
                assert(data.find((item) => item.delta.type === "deposit"));
            });

            await t.step("type === accountClassTransfer", () => {
                assert(data.find((item) => item.delta.type === "accountClassTransfer"));
            });

            await t.step("type === internalTransfer", () => {
                assert(data.find((item) => item.delta.type === "internalTransfer"));
            });

            await t.step("type === spotTransfer", () => {
                assert(data.find((item) => item.delta.type === "spotTransfer"));
            });

            await t.step("type === withdraw", () => {
                assert(data.find((item) => item.delta.type === "withdraw"));
            });

            await t.step("type === vaultCreate", () => {
                assert(data.find((item) => item.delta.type === "vaultCreate"));
            });

            await t.step("type === vaultDistribution", () => {
                assert(data.find((item) => item.delta.type === "vaultDistribution"));
            });

            await t.step("type === subAccountTransfer", () => {
                assert(data.find((item) => item.delta.type === "subAccountTransfer"));
            });
        });

        await t.step("user + startTime + endTime", async (t) => {
            const data = await client.userNonFundingLedgerUpdates({
                user: USER_ADDRESS,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: Date.now(),
            });

            assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
            data.forEach((item) => assertJsonSchema(schema, item));

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });

            await t.step("type === deposit", () => {
                assert(data.find((item) => item.delta.type === "deposit"));
            });

            await t.step("type === accountClassTransfer", () => {
                assert(data.find((item) => item.delta.type === "accountClassTransfer"));
            });

            await t.step("type === internalTransfer", () => {
                assert(data.find((item) => item.delta.type === "internalTransfer"));
            });

            await t.step("type === spotTransfer", () => {
                assert(data.find((item) => item.delta.type === "spotTransfer"));
            });

            await t.step("type === withdraw", () => {
                assert(data.find((item) => item.delta.type === "withdraw"));
            });

            await t.step("type === vaultCreate", () => {
                assert(data.find((item) => item.delta.type === "vaultCreate"));
            });

            await t.step("type === vaultDistribution", () => {
                assert(data.find((item) => item.delta.type === "vaultDistribution"));
            });

            await t.step("type === subAccountTransfer", () => {
                assert(data.find((item) => item.delta.type === "subAccountTransfer"));
            });
        });
    });

    await t.step("userRateLimit", async () => {
        const data = await client.userRateLimit({ user: USER_ADDRESS });

        assertJsonSchema(schema, data);
    });
});
