import { assertEquals } from "jsr:@std/assert@^1.0.10";
import { ExchangeClient } from "../../../mod.ts";

Deno.test("_formatDecimal", () => {
    assertEquals(
        // @ts-ignore - Accessing private method
        new ExchangeClient({})._formatDecimal("123.0"),
        "123",
        "Should remove trailing zero after decimal point",
    );

    assertEquals(
        // @ts-ignore - Accessing private method
        new ExchangeClient({})._formatDecimal("123."),
        "123",
        "Should remove trailing dot when no fractional digits remain",
    );

    assertEquals(
        // @ts-ignore - Accessing private method
        new ExchangeClient({})._formatDecimal("0.1230"),
        "0.123",
        "Should remove trailing zeros in the fractional part",
    );

    assertEquals(
        // @ts-ignore - Accessing private method
        new ExchangeClient({})._formatDecimal("456"),
        "456",
        "Should return unchanged integer values",
    );

    assertEquals(
        // @ts-ignore - Accessing private method
        new ExchangeClient({})._formatDecimal("78.901"),
        "78.901",
        "Should return unchanged decimal values",
    );
});
