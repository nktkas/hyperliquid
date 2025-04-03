import { HttpTransport, PublicClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

const SIDE_B = 15029784876;
const SIDE_A = 27379010444;

const ORDER_TYPE_LIMIT = 15029784876;
const ORDER_TYPE_STOP_MARKET = 15030144135;
const ORDER_TYPE_STOP_LIMIT = 14940693141;
const ORDER_TYPE_TAKE_PROFIT_MARKET = 27379010444;
const ORDER_TYPE_TAKE_PROFIT_LIMIT = 27379156434;

const TIF_NULL = 15030144135;
const TIF_GTC = 15029784876;
const TIF_ALO = 14947967914;
const TIF_IOC = 23629760457;
const TIF_FRONTEND_MARKET = 20776394366;
const TIF_LIQUIDATION_MARKET = 21904297440;

const STATUS_OPEN = 27379010444;
const STATUS_FILLED = 15029784876;
const STATUS_CANCELED = 15030144135;
const STATUS_REJECTED = 20776394366;
const STATUS_REDUCE_ONLY_CANCELED = 27378915177;

const CLOID = "0xd4bb069b673a48161bca56cfc88deb6b";
const WITHOUT_CLOID = 15548036277;

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<PublicClient["orderStatus"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("orderStatus", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        client.orderStatus({ user: USER_ADDRESS, oid: 0 }),
        client.orderStatus({ user: USER_ADDRESS, oid: SIDE_B }),
        client.orderStatus({ user: USER_ADDRESS, oid: SIDE_A }),
        client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_LIMIT }),
        client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_STOP_MARKET }),
        client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_STOP_LIMIT }),
        client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_TAKE_PROFIT_MARKET }),
        client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_TAKE_PROFIT_LIMIT }),

        client.orderStatus({ user: USER_ADDRESS, oid: TIF_NULL }),
        client.orderStatus({ user: USER_ADDRESS, oid: TIF_GTC }),
        client.orderStatus({ user: USER_ADDRESS, oid: TIF_ALO }),
        client.orderStatus({ user: USER_ADDRESS, oid: TIF_IOC }),
        client.orderStatus({ user: USER_ADDRESS, oid: TIF_FRONTEND_MARKET }),
        client.orderStatus({ user: USER_ADDRESS, oid: TIF_LIQUIDATION_MARKET }),

        client.orderStatus({ user: USER_ADDRESS, oid: STATUS_OPEN }),
        client.orderStatus({ user: USER_ADDRESS, oid: STATUS_FILLED }),
        client.orderStatus({ user: USER_ADDRESS, oid: STATUS_CANCELED }),
        client.orderStatus({ user: USER_ADDRESS, oid: STATUS_REJECTED }),
        client.orderStatus({ user: USER_ADDRESS, oid: STATUS_REDUCE_ONLY_CANCELED }),

        client.orderStatus({ user: USER_ADDRESS, oid: CLOID }),
        client.orderStatus({ user: USER_ADDRESS, oid: WITHOUT_CLOID }),
    ]);

    schemaCoverage(MethodReturnType, data, {
        ignoreEmptyArrayPaths: [
            "#/anyOf/0/properties/order/properties/order/properties/children",
        ],
        ignoreEnumValuesByPath: {
            "#/anyOf/0/properties/order/properties/status": [
                "delistedCanceled",
                "liquidatedCanceled",
                "marginCanceled",
                "openInterestCapCanceled",
                "scheduledCancel",
                "selfTradeCanceled",
                "siblingFilledCanceled",
                "triggered",
                "vaultWithdrawalCanceled",
            ],
        },
    });
});
