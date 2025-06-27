import { signTypedData as signTypedDataPrivKey } from "../../src/signing/_signTypedData/private_key.ts";
import { Wallet } from "npm:ethers@6";
import { assertEquals } from "jsr:@std/assert@1";

const PRIVATE_KEY = "0x720fdd809048d0104b0b82ae70642b5dcfd5fd6870eeefc9c882004ab35573ae";

const ethersWallet = new Wallet(PRIVATE_KEY);

async function assertSignTypedData(args: {
    // deno-lint-ignore no-explicit-any
    domain?: Record<string, any>;
    // deno-lint-ignore no-explicit-any
    types: Record<string, any>;
    // deno-lint-ignore no-explicit-any
    message: Record<string, any>;
    primaryType: string;
}): Promise<void> {
    const {
        types,
        message,
        domain = {
            name: "Test",
            version: "1",
            chainId: 1,
            verifyingContract: "0x0000000000000000000000000000000000000000",
        },
        primaryType,
    } = args;

    const ethersHash = await ethersWallet.signTypedData(domain, types, message);
    const privKeyHash = await signTypedDataPrivKey({ privateKey: PRIVATE_KEY, domain, types, message, primaryType });

    assertEquals(ethersHash, privKeyHash);
}

// Tests atomic types: address, bool, uint8-256, int8-256, bytes1-32
Deno.test("atomic_types", async (t) => {
    await t.step("address", async () => {
        await assertSignTypedData({
            types: {
                TestAddress: [
                    { name: "value", type: "address" },
                ],
            },
            message: { value: "0xa0b86a33e6ccf9c4b8e4c1e0c5e4c5a5c5e4c5a5" },
            primaryType: "TestAddress",
        });
    });

    await t.step("bool", async (t) => {
        await t.step("true", async () => {
            await assertSignTypedData({
                types: {
                    TestBool: [
                        { name: "value", type: "bool" },
                    ],
                },
                message: { value: true },
                primaryType: "TestBool",
            });
        });

        await t.step("false", async () => {
            await assertSignTypedData({
                types: {
                    TestBool: [
                        { name: "value", type: "bool" },
                    ],
                },
                message: { value: false },
                primaryType: "TestBool",
            });
        });
    });

    await t.step("uint", async (t) => {
        // Generate all uint sizes: 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160, 168, 176, 184, 192, 200, 208, 216, 224, 232, 240, 248, 256
        const uintSizes = Array.from({ length: 32 }, (_, i) => 8 + i * 8);

        for (const size of uintSizes) {
            const maxValue = size <= 32 ? (2 ** size) - 1 : ((2n ** BigInt(size)) - 1n).toString();
            const medianValue = size <= 32 ? Math.floor((2 ** size) / 2) : ((2n ** BigInt(size)) / 2n).toString();

            await t.step(`uint${size}`, async (t) => {
                await t.step("max", async () => {
                    await assertSignTypedData({
                        types: {
                            TestUint: [
                                { name: "value", type: `uint${size}` },
                            ],
                        },
                        message: { value: maxValue },
                        primaryType: "TestUint",
                    });
                });

                await t.step("median", async () => {
                    await assertSignTypedData({
                        types: {
                            TestUint: [
                                { name: "value", type: `uint${size}` },
                            ],
                        },
                        message: { value: medianValue },
                        primaryType: "TestUint",
                    });
                });

                await t.step("min", async () => {
                    await assertSignTypedData({
                        types: {
                            TestUint: [
                                { name: "value", type: `uint${size}` },
                            ],
                        },
                        message: { value: 0 },
                        primaryType: "TestUint",
                    });
                });
            });
        }
    });

    await t.step("int", async (t) => {
        // Generate all int sizes: 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160, 168, 176, 184, 192, 200, 208, 216, 224, 232, 240, 248, 256
        const intSizes = Array.from({ length: 32 }, (_, i) => 8 + i * 8);

        for (const size of intSizes) {
            const minValue = size <= 31 ? -(2 ** (size - 1)) : (-(2n ** BigInt(size - 1))).toString();
            const medianValue = size <= 31
                ? Math.floor(-(2 ** (size - 1)) / 2)
                : (-(2n ** BigInt(size - 1)) / 2n).toString();
            const maxValue = size <= 31 ? (2 ** (size - 1)) - 1 : ((2n ** BigInt(size - 1)) - 1n).toString();

            await t.step(`int${size}`, async (t) => {
                await t.step("max", async () => {
                    await assertSignTypedData({
                        types: {
                            TestInt: [
                                { name: "value", type: `int${size}` },
                            ],
                        },
                        message: { value: maxValue },
                        primaryType: "TestInt",
                    });
                });

                await t.step("median", async () => {
                    await assertSignTypedData({
                        types: {
                            TestInt: [
                                { name: "value", type: `int${size}` },
                            ],
                        },
                        message: { value: medianValue },
                        primaryType: "TestInt",
                    });
                });

                await t.step("min", async () => {
                    await assertSignTypedData({
                        types: {
                            TestInt: [
                                { name: "value", type: `int${size}` },
                            ],
                        },
                        message: { value: minValue },
                        primaryType: "TestInt",
                    });
                });
            });
        }
    });

    await t.step("bytes_fixed", async (t) => {
        // Generate all bytes sizes: 1-32
        const bytesSizes = Array.from({ length: 32 }, (_, i) => i + 1);

        for (const size of bytesSizes) {
            const maxValue = "0x" + "ff".repeat(size);
            const medianValue = "0x" + "7f" + "ff".repeat(size - 1);

            await t.step(`bytes${size}`, async (t) => {
                await t.step("max", async () => {
                    await assertSignTypedData({
                        types: {
                            TestBytes: [
                                { name: "value", type: `bytes${size}` },
                            ],
                        },
                        message: { value: maxValue },
                        primaryType: "TestBytes",
                    });
                });

                await t.step("median", async () => {
                    await assertSignTypedData({
                        types: {
                            TestBytes: [
                                { name: "value", type: `bytes${size}` },
                            ],
                        },
                        message: { value: medianValue },
                        primaryType: "TestBytes",
                    });
                });

                await t.step("empty", async () => {
                    await assertSignTypedData({
                        types: {
                            TestBytes: [
                                { name: "value", type: `bytes${size}` },
                            ],
                        },
                        message: { value: "0x" + "00".repeat(size) },
                        primaryType: "TestBytes",
                    });
                });
            });
        }
    });
});

// Tests dynamic types: string, bytes
Deno.test("dynamic_types", async (t) => {
    await t.step("string", async (t) => {
        await t.step("normal", async () => {
            await assertSignTypedData({
                types: {
                    TestString: [
                        { name: "value", type: "string" },
                    ],
                },
                message: { value: "Hello World" },
                primaryType: "TestString",
            });
        });

        await t.step("empty", async () => {
            await assertSignTypedData({
                types: {
                    TestString: [
                        { name: "value", type: "string" },
                    ],
                },
                message: { value: "" },
                primaryType: "TestString",
            });
        });

        await t.step("unicode", async () => {
            await assertSignTypedData({
                types: {
                    TestString: [
                        { name: "value", type: "string" },
                    ],
                },
                message: { value: "Hello 世界 🌍 Мир" },
                primaryType: "TestString",
            });
        });
    });

    await t.step("bytes_dynamic", async (t) => {
        await t.step("empty", async () => {
            await assertSignTypedData({
                types: {
                    TestBytes: [
                        { name: "value", type: "bytes" },
                    ],
                },
                message: { value: "0x" },
                primaryType: "TestBytes",
            });
        });

        await t.step("hex", async () => {
            await assertSignTypedData({
                types: {
                    TestBytes: [
                        { name: "value", type: "bytes" },
                    ],
                },
                message: { value: "0x48656c6c6f20576f726c64" },
                primaryType: "TestBytes",
            });
        });

        await t.step("uint8array", async () => {
            const bytesArray = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);

            await assertSignTypedData({
                types: {
                    TestBytes: [
                        { name: "value", type: "bytes" },
                    ],
                },
                message: { value: bytesArray },
                primaryType: "TestBytes",
            });
        });
    });
});

// Tests reference types: arrays (fixed/dynamic, multidimensional) and structs (simple/nested/complex)
Deno.test("reference_types", async (t) => {
    await t.step("arrays", async (t) => {
        await t.step("uint256", async (t) => {
            await t.step("fixed", async () => {
                await assertSignTypedData({
                    types: {
                        TestFixedArray: [
                            { name: "values", type: "uint256[3]" },
                        ],
                    },
                    message: { values: [1, 2, 3] },
                    primaryType: "TestFixedArray",
                });
            });

            await t.step("dynamic", async () => {
                await assertSignTypedData({
                    types: {
                        TestDynamicArray: [
                            { name: "values", type: "uint256[]" },
                        ],
                    },
                    message: { values: [1, 2, 3, 4, 5] },
                    primaryType: "TestDynamicArray",
                });
            });

            await t.step("empty", async () => {
                await assertSignTypedData({
                    types: {
                        TestEmptyArray: [
                            { name: "values", type: "uint256[]" },
                        ],
                    },
                    message: { values: [] },
                    primaryType: "TestEmptyArray",
                });
            });
        });

        await t.step("string", async () => {
            await assertSignTypedData({
                types: {
                    TestStringArray: [
                        { name: "values", type: "string[]" },
                    ],
                },
                message: { values: ["hello", "world", "test"] },
                primaryType: "TestStringArray",
            });
        });

        await t.step("bool", async () => {
            await assertSignTypedData({
                types: {
                    TestBoolArray: [
                        { name: "values", type: "bool[]" },
                    ],
                },
                message: { values: [true, false, true, false] },
                primaryType: "TestBoolArray",
            });
        });

        await t.step("bytes", async () => {
            await assertSignTypedData({
                types: {
                    TestBytesArray: [
                        { name: "values", type: "bytes[]" },
                    ],
                },
                message: { values: ["0x1234", "0x5678", "0xabcd"] },
                primaryType: "TestBytesArray",
            });
        });

        await t.step("address", async () => {
            await assertSignTypedData({
                types: {
                    TestAddressArray: [
                        { name: "values", type: "address[]" },
                    ],
                },
                message: {
                    values: [
                        "0xa0b86a33e6ccf9c4b8e4c1e0c5e4c5a5c5e4c5a5",
                        "0x1234567890abcdef1234567890abcdef12345678",
                        "0x0000000000000000000000000000000000000000",
                    ],
                },
                primaryType: "TestAddressArray",
            });
        });

        await t.step("struct_arrays", async (t) => {
            await t.step("dynamic", async () => {
                await assertSignTypedData({
                    types: {
                        Person: [
                            { name: "name", type: "string" },
                            { name: "age", type: "uint256" },
                        ],
                        TestStructArray: [
                            { name: "people", type: "Person[]" },
                        ],
                    },
                    message: {
                        people: [
                            { name: "Alice", age: 25 },
                            { name: "Bob", age: 30 },
                            { name: "Charlie", age: 35 },
                        ],
                    },
                    primaryType: "TestStructArray",
                });
            });

            await t.step("fixed", async () => {
                await assertSignTypedData({
                    types: {
                        Person: [
                            { name: "name", type: "string" },
                            { name: "age", type: "uint256" },
                        ],
                        TestFixedStructArray: [
                            { name: "people", type: "Person[2]" },
                        ],
                    },
                    message: {
                        people: [
                            { name: "Alice", age: 25 },
                            { name: "Bob", age: 30 },
                        ],
                    },
                    primaryType: "TestFixedStructArray",
                });
            });
        });

        await t.step("multidimensional", async (t) => {
            await t.step("2d", async () => {
                await assertSignTypedData({
                    types: {
                        Test2DArray: [
                            { name: "matrix", type: "uint256[][]" },
                        ],
                    },
                    message: {
                        matrix: [
                            [1, 2, 3],
                            [4, 5, 6],
                            [7, 8, 9],
                        ],
                    },
                    primaryType: "Test2DArray",
                });
            });

            await t.step("3d", async () => {
                await assertSignTypedData({
                    types: {
                        Test3DArray: [
                            { name: "cube", type: "uint256[][][]" },
                        ],
                    },
                    message: {
                        cube: [
                            [[1, 2], [3, 4]],
                            [[5, 6], [7, 8]],
                        ],
                    },
                    primaryType: "Test3DArray",
                });
            });

            await t.step("4d", async () => {
                await assertSignTypedData({
                    types: {
                        Test4DArray: [
                            { name: "hypercube", type: "uint256[][][][]" },
                        ],
                    },
                    message: {
                        hypercube: [
                            [[[1, 2]], [[3, 4]]],
                            [[[5, 6]], [[7, 8]]],
                        ],
                    },
                    primaryType: "Test4DArray",
                });
            });
        });
    });

    await t.step("structs", async (t) => {
        await t.step("simple", async () => {
            await assertSignTypedData({
                types: {
                    SimpleStruct: [
                        { name: "field1", type: "string" },
                        { name: "field2", type: "uint256" },
                    ],
                },
                message: { field1: "test", field2: "123" },
                primaryType: "SimpleStruct",
            });
        });

        await t.step("nested", async () => {
            await assertSignTypedData({
                types: {
                    InnerStruct: [
                        { name: "field1", type: "string" },
                        { name: "field2", type: "uint256" },
                    ],
                    NestedStruct: [
                        { name: "level1", type: "InnerStruct" },
                        { name: "level2", type: "InnerStruct" },
                    ],
                },
                message: {
                    level1: { field1: "deep1", field2: "111" },
                    level2: { field1: "deep2", field2: "222" },
                },
                primaryType: "NestedStruct",
            });
        });

        await t.step("complex", async () => {
            await assertSignTypedData({
                types: {
                    InnerStruct: [
                        { name: "field1", type: "string" },
                        { name: "field2", type: "uint256" },
                    ],
                    DeeperStruct: [
                        { name: "field1", type: "string" },
                        { name: "field2", type: "uint256" },
                    ],
                    NestedComplex: [
                        { name: "level1", type: "InnerStruct" },
                        { name: "level2", type: "DeeperStruct" },
                        { name: "value", type: "uint256" },
                    ],
                    ComplexStruct: [
                        { name: "struct_array_field", type: "InnerStruct[]" },
                        { name: "nested_complex", type: "NestedComplex" },
                        { name: "primitive_array", type: "uint256[]" },
                    ],
                },
                message: {
                    struct_array_field: [{ field1: "nested", field2: "456" }],
                    nested_complex: {
                        level1: { field1: "complex", field2: "888" },
                        level2: { field1: "final", field2: "999" },
                        value: "1000",
                    },
                    primitive_array: [10, 20, 30],
                },
                primaryType: "ComplexStruct",
            });
        });

        await t.step("empty_struct", async (t) => {
            await t.step("zero_fields", async () => {
                await assertSignTypedData({
                    types: {
                        EmptyStruct: [],
                    },
                    message: {},
                    primaryType: "EmptyStruct",
                });
            });

            await t.step("nested_empty", async () => {
                await assertSignTypedData({
                    types: {
                        EmptyStruct: [],
                        ContainerStruct: [
                            { name: "empty1", type: "EmptyStruct" },
                            { name: "empty2", type: "EmptyStruct" },
                            { name: "value", type: "string" },
                        ],
                    },
                    message: {
                        empty1: {},
                        empty2: {},
                        value: "test",
                    },
                    primaryType: "ContainerStruct",
                });
            });
        });

        // recursive types are not allowed.
        // await t.step("recursive", async () => {
        // });
    });
});

// Tests EIP-712 domain separator field variations: chainId, verifyingContract, version, name, salt, field combinations and ordering
Deno.test("domain_separator", async (t) => {
    await t.step("chain_id", async (t) => {
        const chainIds = [0, 1, 5, 10, 56, 137, 250, 42161, 43114, 1337, 31337];

        for (const chainId of chainIds) {
            await t.step(`chain_${chainId}`, async () => {
                await assertSignTypedData({
                    domain: {
                        name: "Test",
                        version: "1",
                        chainId: chainId,
                        verifyingContract: "0x0000000000000000000000000000000000000000",
                    },
                    types: {
                        TestChainId: [
                            { name: "value", type: "uint256" },
                        ],
                    },
                    message: { value: 42 },
                    primaryType: "TestChainId",
                });
            });
        }
    });

    await t.step("verifying_contract", async (t) => {
        await t.step("typical", async () => {
            await assertSignTypedData({
                domain: {
                    name: "Test",
                    version: "1",
                    chainId: 1,
                    verifyingContract: "0xa0b86a33e6ccf9c4b8e4c1e0c5e4c5a5c5e4c5a5",
                },
                types: {
                    TestContract: [
                        { name: "value", type: "uint256" },
                    ],
                },
                message: { value: 42 },
                primaryType: "TestContract",
            });
        });

        await t.step("zero", async () => {
            await assertSignTypedData({
                domain: {
                    name: "Test",
                    version: "1",
                    chainId: 1,
                    verifyingContract: "0x0000000000000000000000000000000000000000",
                },
                types: {
                    TestContract: [
                        { name: "value", type: "uint256" },
                    ],
                },
                message: { value: 42 },
                primaryType: "TestContract",
            });
        });

        await t.step("max", async () => {
            await assertSignTypedData({
                domain: {
                    name: "Test",
                    version: "1",
                    chainId: 1,
                    verifyingContract: "0xffffffffffffffffffffffffffffffffffffffff",
                },
                types: {
                    TestContract: [
                        { name: "value", type: "uint256" },
                    ],
                },
                message: { value: 42 },
                primaryType: "TestContract",
            });
        });
    });

    await t.step("version", async (t) => {
        const versions = ["1", "2", "3", "4", ""];

        for (const version of versions) {
            await t.step(`version_${version || "empty"}`, async () => {
                await assertSignTypedData({
                    domain: {
                        name: "Test",
                        version: version,
                        chainId: 1,
                        verifyingContract: "0x0000000000000000000000000000000000000000",
                    },
                    types: {
                        TestVersion: [
                            { name: "value", type: "uint256" },
                        ],
                    },
                    message: { value: 42 },
                    primaryType: "TestVersion",
                });
            });
        }
    });

    await t.step("name", async (t) => {
        await t.step("empty", async () => {
            await assertSignTypedData({
                domain: {
                    name: "",
                    version: "1",
                    chainId: 1,
                    verifyingContract: "0x0000000000000000000000000000000000000000",
                },
                types: {
                    TestName: [
                        { name: "value", type: "uint256" },
                    ],
                },
                message: { value: 42 },
                primaryType: "TestName",
            });
        });

        await t.step("unicode", async () => {
            await assertSignTypedData({
                domain: {
                    name: "测试 🌍 тест",
                    version: "1",
                    chainId: 1,
                    verifyingContract: "0x0000000000000000000000000000000000000000",
                },
                types: {
                    TestName: [
                        { name: "value", type: "uint256" },
                    ],
                },
                message: { value: 42 },
                primaryType: "TestName",
            });
        });

        await t.step("long", async () => {
            const longName = "A".repeat(1000);
            await assertSignTypedData({
                domain: {
                    name: longName,
                    version: "1",
                    chainId: 1,
                    verifyingContract: "0x0000000000000000000000000000000000000000",
                },
                types: {
                    TestName: [
                        { name: "value", type: "uint256" },
                    ],
                },
                message: { value: 42 },
                primaryType: "TestName",
            });
        });
    });

    await t.step("salt", async (t) => {
        await t.step("zero", async () => {
            await assertSignTypedData({
                domain: {
                    name: "Test",
                    version: "1",
                    chainId: 1,
                    verifyingContract: "0x0000000000000000000000000000000000000000",
                    salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
                },
                types: {
                    TestSalt: [
                        { name: "value", type: "uint256" },
                    ],
                },
                message: { value: 42 },
                primaryType: "TestSalt",
            });
        });

        await t.step("max", async () => {
            await assertSignTypedData({
                domain: {
                    name: "Test",
                    version: "1",
                    chainId: 1,
                    verifyingContract: "0x0000000000000000000000000000000000000000",
                    salt: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                },
                types: {
                    TestSalt: [
                        { name: "value", type: "uint256" },
                    ],
                },
                message: { value: 42 },
                primaryType: "TestSalt",
            });
        });
    });

    await t.step("partial_fields", async (t) => {
        const fields = ["name", "version", "chainId", "verifyingContract", "salt"];
        const baseValues = {
            name: "Test",
            version: "1",
            chainId: 1,
            verifyingContract: "0x0000000000000000000000000000000000000000",
            salt: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        };

        for (let i = 1; i < (1 << fields.length); i++) {
            const combo = fields.filter((_, idx) => i & (1 << idx));
            await t.step(`fields_${combo.join("_")}`, async () => {
                const domain: Record<string, unknown> = {};
                for (const field of combo) {
                    domain[field] = baseValues[field as keyof typeof baseValues];
                }

                await assertSignTypedData({
                    domain,
                    types: {
                        TestPartial: [
                            { name: "value", type: "uint256" },
                        ],
                    },
                    message: { value: 42 },
                    primaryType: "TestPartial",
                });
            });
        }
    });

    await t.step("field_order", async (t) => {
        const fields = ["name", "version", "chainId", "verifyingContract", "salt"];
        const baseValues = {
            name: "Test",
            version: "1",
            chainId: 1,
            verifyingContract: "0x0000000000000000000000000000000000000000",
            salt: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        };

        function* permutations(arr: string[]): Generator<string[]> {
            if (arr.length <= 1) yield arr;
            else {
                for (let i = 0; i < arr.length; i++) {
                    for (const perm of permutations([...arr.slice(0, i), ...arr.slice(i + 1)])) {
                        yield [arr[i], ...perm];
                    }
                }
            }
        }

        for (const order of permutations(fields)) {
            await t.step(`order_${order.join("_")}`, async () => {
                const domain: Record<string, unknown> = {};
                for (const field of order) {
                    domain[field] = baseValues[field as keyof typeof baseValues];
                }

                await assertSignTypedData({
                    domain,
                    types: {
                        TestOrder: [
                            { name: "value", type: "uint256" },
                        ],
                    },
                    message: { value: 42 },
                    primaryType: "TestOrder",
                });
            });
        }
    });
});

// Tests structured data edge cases: extra message properties filtering and complex type combinations
Deno.test("typed_structured_data", async (t) => {
    await t.step("extra_message_properties", async (t) => {
        await t.step("simple_struct", async () => {
            await assertSignTypedData({
                types: {
                    Person: [
                        { name: "name", type: "string" },
                        { name: "age", type: "uint256" },
                    ],
                },
                message: {
                    name: "Alice",
                    age: 25,
                    extra: "ignored",
                    another: 42,
                },
                primaryType: "Person",
            });
        });

        await t.step("nested_struct", async () => {
            await assertSignTypedData({
                types: {
                    Address: [
                        { name: "street", type: "string" },
                        { name: "city", type: "string" },
                    ],
                    Person: [
                        { name: "name", type: "string" },
                        { name: "addr", type: "Address" },
                    ],
                },
                message: {
                    name: "Bob",
                    addr: {
                        street: "Main St",
                        city: "NYC",
                        ignored: true,
                    },
                    extraTop: "also ignored",
                },
                primaryType: "Person",
            });
        });

        await t.step("array_elements", async () => {
            await assertSignTypedData({
                types: {
                    Item: [
                        { name: "name", type: "string" },
                        { name: "price", type: "uint256" },
                    ],
                    ShoppingList: [
                        { name: "items", type: "Item[]" },
                    ],
                },
                message: {
                    items: [
                        {
                            name: "apple",
                            price: 100,
                            extra: "data",
                        },
                        {
                            name: "banana",
                            price: 50,
                            category: "fruit",
                            discount: true,
                        },
                    ],
                },
                primaryType: "ShoppingList",
            });
        });
    });

    await t.step("type_combinations", async () => {
        await assertSignTypedData({
            types: {
                // Nested struct with atomic types
                PersonInfo: [
                    { name: "name", type: "string" },
                    { name: "age", type: "uint8" },
                    { name: "isActive", type: "bool" },
                    { name: "wallet", type: "address" },
                ],
                // Struct with fixed bytes
                Metadata: [
                    { name: "hash", type: "bytes32" },
                    { name: "signature", type: "bytes" },
                    { name: "data", type: "bytes4" },
                ],
                // Struct with arrays
                ArrayContainer: [
                    { name: "numbers", type: "uint256[]" },
                    { name: "flags", type: "bool[3]" },
                    { name: "addresses", type: "address[]" },
                    { name: "descriptions", type: "string[]" },
                ],
                // Complex nested structure combining everything
                ComplexData: [
                    { name: "person", type: "PersonInfo" },
                    { name: "metadata", type: "Metadata" },
                    { name: "arrays", type: "ArrayContainer" },
                    { name: "personList", type: "PersonInfo[]" },
                    { name: "nestedArrays", type: "uint256[][]" },
                    { name: "mixedInts", type: "int128[]" },
                    { name: "timestamp", type: "uint256" },
                    { name: "version", type: "string" },
                ],
            },
            message: {
                person: {
                    name: "Alice Smith",
                    age: 30,
                    isActive: true,
                    wallet: "0xa0b86a33e6ccf9c4b8e4c1e0c5e4c5a5c5e4c5a5",
                },
                metadata: {
                    hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
                    signature: "0x48656c6c6f20576f726c64",
                    data: "0x12345678",
                },
                arrays: {
                    numbers: [100, 200, 300, 400],
                    flags: [true, false, true],
                    addresses: [
                        "0x1234567890abcdef1234567890abcdef12345678",
                        "0x0000000000000000000000000000000000000000",
                    ],
                    descriptions: ["first", "second", "third"],
                },
                personList: [
                    {
                        name: "Bob",
                        age: 25,
                        isActive: false,
                        wallet: "0x1234567890abcdef1234567890abcdef12345678",
                    },
                    {
                        name: "Charlie",
                        age: 35,
                        isActive: true,
                        wallet: "0xffffffffffffffffffffffffffffffffffffffff",
                    },
                ],
                nestedArrays: [
                    [1, 2, 3],
                    [4, 5],
                    [6, 7, 8, 9],
                ],
                mixedInts: [-100, 0, 100, -2147483648, 2147483647],
                timestamp: "1672531200",
                version: "2.1.0",
            },
            primaryType: "ComplexData",
        });
    });
});

// Tests type aliases: uint (uint256) and int (int256)
Deno.test("type_aliases", async (t) => {
    await t.step("uint", async () => {
        await assertSignTypedData({
            types: {
                TestUintAlias: [
                    { name: "value", type: "uint" },
                ],
            },
            message: { value: "115792089237316195423570985008687907853269984665640564039457584007913129639935" },
            primaryType: "TestUintAlias",
        });
    });

    await t.step("int", async () => {
        await assertSignTypedData({
            types: {
                TestIntAlias: [
                    { name: "positive", type: "int" },
                    { name: "negative", type: "int" },
                    { name: "zero", type: "int" },
                ],
            },
            message: {
                positive: "57896044618658097711785492504343953926634992332820282019728792003956564819967",
                negative: "-57896044618658097711785492504343953926634992332820282019728792003956564819968",
                zero: "0",
            },
            primaryType: "TestIntAlias",
        });
    });
});

// Tests that message field ordering doesn't affect signature generation (types define canonical order)
Deno.test("field_ordering", async (t) => {
    await t.step("inverted_message_order", async () => {
        // Types define order: name, age, active
        // Message provides: active, age, name (inverted)
        await assertSignTypedData({
            types: {
                Person: [
                    { name: "name", type: "string" },
                    { name: "age", type: "uint256" },
                    { name: "active", type: "bool" },
                ],
            },
            message: {
                active: true,
                age: 25,
                name: "Alice",
            },
            primaryType: "Person",
        });
    });

    await t.step("random_message_order", async () => {
        // Types define order: field1, field2, field3, field4, field5
        // Message provides: field3, field1, field5, field2, field4
        await assertSignTypedData({
            types: {
                TestOrdering: [
                    { name: "field1", type: "string" },
                    { name: "field2", type: "uint256" },
                    { name: "field3", type: "bool" },
                    { name: "field4", type: "address" },
                    { name: "field5", type: "bytes32" },
                ],
            },
            message: {
                field3: true,
                field1: "test",
                field5: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
                field2: "42",
                field4: "0xa0b86a33e6ccf9c4b8e4c1e0c5e4c5a5c5e4c5a5",
            },
            primaryType: "TestOrdering",
        });
    });

    await t.step("nested_struct_ordering", async () => {
        await assertSignTypedData({
            types: {
                Address: [
                    { name: "street", type: "string" },
                    { name: "city", type: "string" },
                    { name: "zipCode", type: "uint256" },
                ],
                Person: [
                    { name: "name", type: "string" },
                    { name: "address", type: "Address" },
                    { name: "age", type: "uint256" },
                ],
            },
            message: {
                age: 30,
                address: {
                    zipCode: 12345,
                    street: "Main St",
                    city: "NYC",
                },
                name: "Bob",
            },
            primaryType: "Person",
        });
    });
});

// Tests complex multidimensional arrays with various data types
Deno.test("multidimensional_complex_arrays", async (t) => {
    await t.step("string_2d_arrays", async () => {
        await assertSignTypedData({
            types: {
                TestString2D: [
                    { name: "matrix", type: "string[][]" },
                ],
            },
            message: {
                matrix: [
                    ["hello", "world", "test"],
                    ["foo", "bar"],
                    ["single"],
                    [],
                ],
            },
            primaryType: "TestString2D",
        });
    });

    await t.step("bytes_2d_arrays", async () => {
        await assertSignTypedData({
            types: {
                TestBytes2D: [
                    { name: "data", type: "bytes[][]" },
                ],
            },
            message: {
                data: [
                    ["0x1234", "0x5678", "0xabcd"],
                    ["0xdeadbeef"],
                    ["0x", "0xff", "0x00"],
                ],
            },
            primaryType: "TestBytes2D",
        });
    });

    await t.step("struct_2d_arrays", async () => {
        await assertSignTypedData({
            types: {
                Point: [
                    { name: "x", type: "uint256" },
                    { name: "y", type: "uint256" },
                ],
                TestStruct2D: [
                    { name: "grid", type: "Point[][]" },
                ],
            },
            message: {
                grid: [
                    [
                        { x: 1, y: 2 },
                        { x: 3, y: 4 },
                    ],
                    [
                        { x: 5, y: 6 },
                        { x: 7, y: 8 },
                        { x: 9, y: 10 },
                    ],
                    [],
                ],
            },
            primaryType: "TestStruct2D",
        });
    });

    await t.step("string_3d_arrays", async () => {
        await assertSignTypedData({
            types: {
                TestString3D: [
                    { name: "cube", type: "string[][][]" },
                ],
            },
            message: {
                cube: [
                    [
                        ["a", "b"],
                        ["c", "d"],
                    ],
                    [
                        ["e", "f", "g"],
                        [],
                    ],
                ],
            },
            primaryType: "TestString3D",
        });
    });

    await t.step("struct_4d_arrays", async () => {
        await assertSignTypedData({
            types: {
                Point: [
                    { name: "x", type: "uint256" },
                    { name: "y", type: "uint256" },
                ],
                TestStruct4D: [
                    { name: "hypergrid", type: "Point[][][][]" },
                ],
            },
            message: {
                hypergrid: [
                    [
                        [
                            [{ x: 1, y: 2 }, { x: 3, y: 4 }],
                            [{ x: 5, y: 6 }],
                        ],
                        [
                            [{ x: 7, y: 8 }, { x: 9, y: 10 }, { x: 11, y: 12 }],
                        ],
                    ],
                    [
                        [
                            [{ x: 13, y: 14 }],
                            [{ x: 15, y: 16 }, { x: 17, y: 18 }],
                        ],
                    ],
                ],
            },
            primaryType: "TestStruct4D",
        });
    });

    await t.step("mixed_multidimensional", async () => {
        await assertSignTypedData({
            types: {
                Item: [
                    { name: "name", type: "string" },
                    { name: "value", type: "uint256" },
                ],
                TestMixed: [
                    { name: "strings2d", type: "string[][]" },
                    { name: "bytes2d", type: "bytes[][]" },
                    { name: "structs2d", type: "Item[][]" },
                    { name: "uints3d", type: "uint256[][][]" },
                ],
            },
            message: {
                strings2d: [["hello"], ["world", "test"]],
                bytes2d: [["0x1234"], ["0x5678", "0xabcd"]],
                structs2d: [
                    [{ name: "item1", value: 100 }],
                    [{ name: "item2", value: 200 }, { name: "item3", value: 300 }],
                ],
                uints3d: [
                    [[1, 2], [3]],
                    [[4, 5, 6]],
                ],
            },
            primaryType: "TestMixed",
        });
    });
});

// Tests combinations of fixed and dynamic arrays with different types
Deno.test("mixed_array_types", async (t) => {
    await t.step("dynamic_static_mix", async () => {
        await assertSignTypedData({
            types: {
                TestMixedArrays: [
                    { name: "dynamicUints", type: "uint256[]" },
                    { name: "fixedBools", type: "bool[3]" },
                    { name: "dynamicStrings", type: "string[]" },
                    { name: "fixedBytes", type: "bytes32[2]" },
                    { name: "dynamicBytes", type: "bytes[]" },
                ],
            },
            message: {
                dynamicUints: [100, 200, 300, 400],
                fixedBools: [true, false, true],
                dynamicStrings: ["hello", "world", "test", "example"],
                fixedBytes: [
                    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
                    "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
                ],
                dynamicBytes: ["0x1234", "0x5678", "0xabcd", "0xef"],
            },
            primaryType: "TestMixedArrays",
        });
    });

    await t.step("atomic_types_arrays", async () => {
        await assertSignTypedData({
            types: {
                TestAtomicArrays: [
                    { name: "addresses", type: "address[]" },
                    { name: "fixedUints", type: "uint128[4]" },
                    { name: "dynamicInts", type: "int256[]" },
                    { name: "fixedAddresses", type: "address[2]" },
                    { name: "booleans", type: "bool[]" },
                ],
            },
            message: {
                addresses: [
                    "0xa0b86a33e6ccf9c4b8e4c1e0c5e4c5a5c5e4c5a5",
                    "0x1234567890abcdef1234567890abcdef12345678",
                    "0x0000000000000000000000000000000000000000",
                ],
                fixedUints: ["1000", "2000", "3000", "4000"],
                dynamicInts: ["-100", "0", "100", "-999999999"],
                fixedAddresses: [
                    "0xffffffffffffffffffffffffffffffffffffffff",
                    "0x1111111111111111111111111111111111111111",
                ],
                booleans: [true, false, false, true, false],
            },
            primaryType: "TestAtomicArrays",
        });
    });

    await t.step("struct_array_combinations", async () => {
        await assertSignTypedData({
            types: {
                Person: [
                    { name: "name", type: "string" },
                    { name: "age", type: "uint256" },
                ],
                Company: [
                    { name: "name", type: "string" },
                    { name: "founded", type: "uint256" },
                ],
                TestStructArrays: [
                    { name: "people", type: "Person[]" },
                    { name: "fixedCompanies", type: "Company[2]" },
                    { name: "numbers", type: "uint256[]" },
                    { name: "fixedFlags", type: "bool[3]" },
                ],
            },
            message: {
                people: [
                    { name: "Alice", age: 25 },
                    { name: "Bob", age: 30 },
                    { name: "Charlie", age: 35 },
                ],
                fixedCompanies: [
                    { name: "TechCorp", founded: 2020 },
                    { name: "DataInc", founded: 2018 },
                ],
                numbers: [10, 20, 30, 40, 50],
                fixedFlags: [true, false, true],
            },
            primaryType: "TestStructArrays",
        });
    });

    await t.step("bytes_variations", async () => {
        await assertSignTypedData({
            types: {
                TestBytesVariations: [
                    { name: "dynamicBytes", type: "bytes[]" },
                    { name: "fixedBytes1", type: "bytes1[3]" },
                    { name: "fixedBytes32", type: "bytes32[2]" },
                    { name: "dynamicBytes4", type: "bytes4[]" },
                    { name: "singleBytes", type: "bytes" },
                ],
            },
            message: {
                dynamicBytes: ["0x1234", "0x567890ab", "0xcd"],
                fixedBytes1: ["0xff", "0x00", "0xaa"],
                fixedBytes32: [
                    "0x1111111111111111111111111111111111111111111111111111111111111111",
                    "0x2222222222222222222222222222222222222222222222222222222222222222",
                ],
                dynamicBytes4: ["0x12345678", "0x9abcdef0", "0x11111111"],
                singleBytes: "0xdeadbeef",
            },
            primaryType: "TestBytesVariations",
        });
    });
});
