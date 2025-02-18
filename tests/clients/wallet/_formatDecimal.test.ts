import { assertEquals } from "jsr:@std/assert@^1.0.10";
import { WalletClient } from "../../../mod.ts";

Deno.test("_formatDecimal", async (t) => {
    // @ts-ignore - We need a minimum instance
    const walletClient = new WalletClient({});

    await t.step("Should remove trailing zero after decimal point", () => {
        assertEquals(
            // @ts-ignore - Accessing private method
            walletClient._formatDecimal("123.0"),
            "123",
        );
    });

    await t.step("Should remove trailing dot when no fractional digits remain", () => {
        assertEquals(
            // @ts-ignore - Accessing private method
            walletClient._formatDecimal("123."),
            "123",
        );
    });

    await t.step("Should remove trailing zeros in the fractional part", () => {
        assertEquals(
            // @ts-ignore - Accessing private method
            walletClient._formatDecimal("0.1230"),
            "0.123",
        );
    });

    await t.step("Should remove multiple trailing zeros in the fractional part", () => {
        assertEquals(
            // @ts-ignore - Accessing private method
            walletClient._formatDecimal("0.0012300"),
            "0.00123",
        );
    });

    await t.step("Should return number without dot unchanged", () => {
        assertEquals(
            // @ts-ignore - Accessing private method
            walletClient._formatDecimal("456"),
            "456",
        );
    });

    await t.step("Should leave a fractional part with no trailing zeros intact", () => {
        assertEquals(
            // @ts-ignore - Accessing private method
            walletClient._formatDecimal("78.901"),
            "78.901",
        );
    });
});
