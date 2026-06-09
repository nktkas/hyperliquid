// deno-lint-ignore-file no-import-prefix

import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import type { IRequestTransport } from "@nktkas/hyperliquid";
import { ApiRequestError, blockDetails } from "@nktkas/hyperliquid/api/explorer";

/** Creates a transport stub that resolves every request with the given response. */
function transportWith(response: unknown): IRequestTransport<"explorer"> {
  return {
    isTestnet: false,
    request<T>(): Promise<T> {
      return Promise.resolve(response as T);
    },
  };
}

Deno.test("explorer error responses", async (t) => {
  await t.step("error response throws ApiRequestError with the server message", async () => {
    const transport = transportWith({ type: "error", message: "invalid block height: 0" });

    const error = await assertRejects(
      () => blockDetails({ transport }, { height: 1 }),
      ApiRequestError,
      "invalid block height: 0",
    );
    assertEquals(error.response, { type: "error", message: "invalid block height: 0" });
  });

  await t.step("error response without message throws with a generic message", async () => {
    const transport = transportWith({ type: "error" });

    await assertRejects(
      () => blockDetails({ transport }, { height: 1 }),
      ApiRequestError,
      "An unknown error occurred",
    );
  });

  await t.step("successful response is returned as data", async () => {
    const data = { type: "blockDetails", blockDetails: { height: 1 } };
    const transport = transportWith(data);

    assertEquals(await blockDetails({ transport }, { height: 1 }), data);
  });
});
