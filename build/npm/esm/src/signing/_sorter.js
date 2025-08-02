/** Action sorter and formatter for correct signature generation. */
export const actionSorter = {
    approveAgent: (action) => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            agentAddress: action.agentAddress.toLowerCase(),
            agentName: action.agentName,
            nonce: action.nonce,
        };
    },
    approveBuilderFee: (action) => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            maxFeeRate: action.maxFeeRate,
            builder: action.builder.toLowerCase(),
            nonce: action.nonce,
        };
    },
    batchModify: (action) => {
        return {
            type: action.type,
            modifies: action.modifies.map((modify) => {
                const sortedModify = {
                    oid: modify.oid,
                    order: {
                        a: modify.order.a,
                        b: modify.order.b,
                        p: formatDecimal(modify.order.p),
                        s: formatDecimal(modify.order.s),
                        r: modify.order.r,
                        t: "limit" in modify.order.t
                            ? {
                                limit: {
                                    tif: modify.order.t.limit.tif,
                                },
                            }
                            : {
                                trigger: {
                                    isMarket: modify.order.t.trigger.isMarket,
                                    triggerPx: formatDecimal(modify.order.t.trigger.triggerPx),
                                    tpsl: modify.order.t.trigger.tpsl,
                                },
                            },
                        c: modify.order.c,
                    },
                };
                if (sortedModify.order.c === undefined)
                    delete sortedModify.order.c;
                return sortedModify;
            }),
        };
    },
    cancel: (action) => {
        return {
            type: action.type,
            cancels: action.cancels.map((cancel) => ({
                a: cancel.a,
                o: cancel.o,
            })),
        };
    },
    cancelByCloid: (action) => {
        return {
            type: action.type,
            cancels: action.cancels.map((cancel) => ({
                asset: cancel.asset,
                cloid: cancel.cloid,
            })),
        };
    },
    cDeposit: (action) => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            wei: action.wei,
            nonce: action.nonce,
        };
    },
    claimRewards: (action) => {
        return {
            type: action.type,
        };
    },
    convertToMultiSigUser: (action) => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            signers: typeof action.signers === "string" ? action.signers : JSON.stringify(action.signers === null ? action.signers : {
                authorizedUsers: action.signers.authorizedUsers,
                threshold: action.signers.threshold,
            }),
            nonce: action.nonce,
        };
    },
    createSubAccount: (action) => {
        return {
            type: action.type,
            name: action.name,
        };
    },
    createVault: (action) => {
        return {
            type: action.type,
            name: action.name,
            description: action.description,
            initialUsd: action.initialUsd,
            nonce: action.nonce,
        };
    },
    CSignerAction: (action) => {
        if ("jailSelf" in action) {
            return {
                type: action.type,
                jailSelf: action.jailSelf,
            };
        }
        else {
            return {
                type: action.type,
                unjailSelf: action.unjailSelf,
            };
        }
    },
    CValidatorAction: (action) => {
        if ("changeProfile" in action) {
            return {
                type: action.type,
                changeProfile: {
                    node_ip: action.changeProfile.node_ip,
                    name: action.changeProfile.name,
                    description: action.changeProfile.description,
                    unjailed: action.changeProfile.unjailed,
                    disable_delegations: action.changeProfile.disable_delegations,
                    commission_bps: action.changeProfile.commission_bps,
                    signer: action.changeProfile.signer?.toLowerCase(),
                },
            };
        }
        else if ("register" in action) {
            return {
                type: action.type,
                register: {
                    profile: {
                        node_ip: {
                            Ip: action.register.profile.node_ip.Ip,
                        },
                        name: action.register.profile.name,
                        description: action.register.profile.description,
                        delegations_disabled: action.register.profile.delegations_disabled,
                        commission_bps: action.register.profile.commission_bps,
                        signer: action.register.profile.signer.toLowerCase(),
                    },
                    unjailed: action.register.unjailed,
                    initial_wei: action.register.initial_wei,
                },
            };
        }
        else {
            return {
                type: action.type,
                unregister: action.unregister,
            };
        }
    },
    cWithdraw: (action) => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            wei: action.wei,
            nonce: action.nonce,
        };
    },
    evmUserModify: (action) => {
        return {
            type: action.type,
            usingBigBlocks: action.usingBigBlocks,
        };
    },
    modify: (action) => {
        const sortedAction = {
            type: action.type,
            oid: action.oid,
            order: {
                a: action.order.a,
                b: action.order.b,
                p: formatDecimal(action.order.p),
                s: formatDecimal(action.order.s),
                r: action.order.r,
                t: "limit" in action.order.t
                    ? {
                        limit: {
                            tif: action.order.t.limit.tif,
                        },
                    }
                    : {
                        trigger: {
                            isMarket: action.order.t.trigger.isMarket,
                            triggerPx: formatDecimal(action.order.t.trigger.triggerPx),
                            tpsl: action.order.t.trigger.tpsl,
                        },
                    },
                c: action.order.c,
            },
        };
        if (sortedAction.order.c === undefined)
            delete sortedAction.order.c;
        return sortedAction;
    },
    multiSig: (action) => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            signatures: action.signatures.map((signature) => ({
                r: signature.r.replace(/^0x0+/, "0x").toLowerCase(),
                s: signature.s.replace(/^0x0+/, "0x").toLowerCase(),
                v: signature.v,
            })),
            payload: {
                multiSigUser: action.payload.multiSigUser.toLowerCase(),
                outerSigner: action.payload.outerSigner.toLowerCase(),
                action: actionSorter[action.payload.action.type](
                // @ts-ignore - TypeScript cannot infer the type correctly
                action.payload.action),
            },
        };
    },
    order: (action) => {
        const sortedAction = {
            type: action.type,
            orders: action.orders.map((order) => {
                const sortedOrder = {
                    a: order.a,
                    b: order.b,
                    p: formatDecimal(order.p),
                    s: formatDecimal(order.s),
                    r: order.r,
                    t: "limit" in order.t
                        ? {
                            limit: {
                                tif: order.t.limit.tif,
                            },
                        }
                        : {
                            trigger: {
                                isMarket: order.t.trigger.isMarket,
                                triggerPx: formatDecimal(order.t.trigger.triggerPx),
                                tpsl: order.t.trigger.tpsl,
                            },
                        },
                    c: order.c,
                };
                if (order.c === undefined)
                    delete sortedOrder.c;
                return sortedOrder;
            }),
            grouping: action.grouping,
            builder: action.builder
                ? {
                    b: action.builder.b.toLowerCase(),
                    f: action.builder.f,
                }
                : action.builder,
        };
        if (sortedAction.builder === undefined)
            delete sortedAction.builder;
        return sortedAction;
    },
    perpDeploy: (action) => {
        if ("registerAsset" in action) {
            return {
                type: action.type,
                registerAsset: {
                    maxGas: action.registerAsset.maxGas,
                    assetRequest: {
                        coin: action.registerAsset.assetRequest.coin,
                        szDecimals: action.registerAsset.assetRequest.szDecimals,
                        oraclePx: action.registerAsset.assetRequest.oraclePx,
                        marginTableId: action.registerAsset.assetRequest.marginTableId,
                        onlyIsolated: action.registerAsset.assetRequest.onlyIsolated,
                    },
                    dex: action.registerAsset.dex,
                    schema: action.registerAsset.schema
                        ? {
                            fullName: action.registerAsset.schema.fullName,
                            collateralToken: action.registerAsset.schema.collateralToken,
                            oracleUpdater: action.registerAsset.schema.oracleUpdater?.toLowerCase(),
                        }
                        : action.registerAsset.schema,
                },
            };
        }
        else {
            return {
                type: action.type,
                setOracle: {
                    dex: action.setOracle.dex,
                    oraclePxs: action.setOracle.oraclePxs.map((el) => [...el]),
                    markPxs: action.setOracle.markPxs.map((el) => el.map((el2) => [...el2])),
                },
            };
        }
    },
    registerReferrer: (action) => {
        return {
            type: action.type,
            code: action.code,
        };
    },
    reserveRequestWeight: (action) => {
        return {
            type: action.type,
            weight: action.weight,
        };
    },
    scheduleCancel: (action) => {
        const sortedAction = {
            type: action.type,
            time: action.time,
        };
        if (sortedAction.time === undefined)
            delete sortedAction.time;
        return sortedAction;
    },
    setDisplayName: (action) => {
        return {
            type: action.type,
            displayName: action.displayName,
        };
    },
    setReferrer: (action) => {
        return {
            type: action.type,
            code: action.code,
        };
    },
    spotDeploy: (action) => {
        if ("genesis" in action) {
            const sortedAction = {
                type: action.type,
                genesis: {
                    token: action.genesis.token,
                    maxSupply: action.genesis.maxSupply,
                    noHyperliquidity: action.genesis.noHyperliquidity,
                },
            };
            if (sortedAction.genesis.noHyperliquidity === undefined)
                delete sortedAction.genesis.noHyperliquidity;
            return sortedAction;
        }
        else if ("registerHyperliquidity" in action) {
            const sortedAction = {
                type: action.type,
                registerHyperliquidity: {
                    spot: action.registerHyperliquidity.spot,
                    startPx: action.registerHyperliquidity.startPx,
                    orderSz: action.registerHyperliquidity.orderSz,
                    nOrders: action.registerHyperliquidity.nOrders,
                    nSeededLevels: action.registerHyperliquidity.nSeededLevels,
                },
            };
            if (sortedAction.registerHyperliquidity.nSeededLevels === undefined) {
                delete sortedAction.registerHyperliquidity.nSeededLevels;
            }
            return sortedAction;
        }
        else if ("registerSpot" in action) {
            return {
                type: action.type,
                registerSpot: {
                    tokens: [...action.registerSpot.tokens],
                },
            };
        }
        else if ("registerToken2" in action) {
            const sortedAction = {
                type: action.type,
                registerToken2: {
                    spec: {
                        name: action.registerToken2.spec.name,
                        szDecimals: action.registerToken2.spec.szDecimals,
                        weiDecimals: action.registerToken2.spec.weiDecimals,
                    },
                    maxGas: action.registerToken2.maxGas,
                    fullName: action.registerToken2.fullName,
                },
            };
            if (sortedAction.registerToken2.fullName === undefined)
                delete sortedAction.registerToken2.fullName;
            return sortedAction;
        }
        else if ("setDeployerTradingFeeShare" in action) {
            return {
                type: action.type,
                setDeployerTradingFeeShare: {
                    token: action.setDeployerTradingFeeShare.token,
                    share: action.setDeployerTradingFeeShare.share,
                },
            };
        }
        else {
            const sortedAction = {
                type: action.type,
                userGenesis: {
                    token: action.userGenesis.token,
                    userAndWei: action.userGenesis.userAndWei.map((el) => [...el]),
                    existingTokenAndWei: action.userGenesis.existingTokenAndWei.map((el) => [...el]),
                    blacklistUsers: action.userGenesis.blacklistUsers?.map((el) => [...el]),
                },
            };
            if (sortedAction.userGenesis.blacklistUsers === undefined)
                delete sortedAction.userGenesis.blacklistUsers;
            return sortedAction;
        }
    },
    spotSend: (action) => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            destination: action.destination.toLowerCase(),
            token: action.token,
            amount: action.amount,
            time: action.time,
        };
    },
    spotUser: (action) => {
        return {
            type: action.type,
            toggleSpotDusting: {
                optOut: action.toggleSpotDusting.optOut,
            },
        };
    },
    subAccountModify: (action) => {
        return {
            type: action.type,
            subAccountUser: action.subAccountUser.toLowerCase(),
            name: action.name,
        };
    },
    subAccountSpotTransfer: (action) => {
        return {
            type: action.type,
            subAccountUser: action.subAccountUser.toLowerCase(),
            isDeposit: action.isDeposit,
            token: action.token,
            amount: action.amount,
        };
    },
    subAccountTransfer: (action) => {
        return {
            type: action.type,
            subAccountUser: action.subAccountUser.toLowerCase(),
            isDeposit: action.isDeposit,
            usd: action.usd,
        };
    },
    tokenDelegate: (action) => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            validator: action.validator.toLowerCase(),
            wei: action.wei,
            isUndelegate: action.isUndelegate,
            nonce: action.nonce,
        };
    },
    twapCancel: (action) => {
        return {
            type: action.type,
            a: action.a,
            t: action.t,
        };
    },
    twapOrder: (action) => {
        return {
            type: action.type,
            twap: {
                a: action.twap.a,
                b: action.twap.b,
                s: formatDecimal(action.twap.s),
                r: action.twap.r,
                m: action.twap.m,
                t: action.twap.t,
            },
        };
    },
    updateIsolatedMargin: (action) => {
        return {
            type: action.type,
            asset: action.asset,
            isBuy: action.isBuy,
            ntli: action.ntli,
        };
    },
    updateLeverage: (action) => {
        return {
            type: action.type,
            asset: action.asset,
            isCross: action.isCross,
            leverage: action.leverage,
        };
    },
    usdClassTransfer: (action) => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            amount: action.amount,
            toPerp: action.toPerp,
            nonce: action.nonce,
        };
    },
    usdSend: (action) => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            destination: action.destination.toLowerCase(),
            amount: action.amount,
            time: action.time,
        };
    },
    vaultDistribute: (action) => {
        return {
            type: action.type,
            vaultAddress: action.vaultAddress,
            usd: action.usd,
        };
    },
    vaultModify: (action) => {
        return {
            type: action.type,
            vaultAddress: action.vaultAddress,
            allowDeposits: action.allowDeposits,
            alwaysCloseOnWithdraw: action.alwaysCloseOnWithdraw,
        };
    },
    vaultTransfer: (action) => {
        return {
            type: action.type,
            vaultAddress: action.vaultAddress,
            isDeposit: action.isDeposit,
            usd: action.usd,
        };
    },
    withdraw3: (action) => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            destination: action.destination.toLowerCase(),
            amount: action.amount,
            time: action.time,
        };
    },
};
/** Removes trailing zeros from decimal string. */
function formatDecimal(numStr) {
    if (!numStr.includes("."))
        return numStr;
    const [intPart, fracPart] = numStr.split(".");
    const newFrac = fracPart.replace(/0+$/, "");
    return newFrac ? `${intPart}.${newFrac}` : intPart;
}
/** EIP-712 type definitions for user-signed actions. */
export const userSignedActionEip712Types = {
    approveAgent: {
        "HyperliquidTransaction:ApproveAgent": [
            { name: "hyperliquidChain", type: "string" },
            { name: "agentAddress", type: "address" },
            { name: "agentName", type: "string" },
            { name: "nonce", type: "uint64" },
        ],
    },
    approveBuilderFee: {
        "HyperliquidTransaction:ApproveBuilderFee": [
            { name: "hyperliquidChain", type: "string" },
            { name: "maxFeeRate", type: "string" },
            { name: "builder", type: "address" },
            { name: "nonce", type: "uint64" },
        ],
    },
    cDeposit: {
        "HyperliquidTransaction:CDeposit": [
            { name: "hyperliquidChain", type: "string" },
            { name: "wei", type: "uint64" },
            { name: "nonce", type: "uint64" },
        ],
    },
    convertToMultiSigUser: {
        "HyperliquidTransaction:ConvertToMultiSigUser": [
            { name: "hyperliquidChain", type: "string" },
            { name: "signers", type: "string" },
            { name: "nonce", type: "uint64" },
        ],
    },
    cWithdraw: {
        "HyperliquidTransaction:CWithdraw": [
            { name: "hyperliquidChain", type: "string" },
            { name: "wei", type: "uint64" },
            { name: "nonce", type: "uint64" },
        ],
    },
    multiSig: {
        "HyperliquidTransaction:SendMultiSig": [
            { name: "hyperliquidChain", type: "string" },
            { name: "multiSigActionHash", type: "bytes32" },
            { name: "nonce", type: "uint64" },
        ],
    },
    spotSend: {
        "HyperliquidTransaction:SpotSend": [
            { name: "hyperliquidChain", type: "string" },
            { name: "destination", type: "string" },
            { name: "token", type: "string" },
            { name: "amount", type: "string" },
            { name: "time", type: "uint64" },
        ],
    },
    tokenDelegate: {
        "HyperliquidTransaction:TokenDelegate": [
            { name: "hyperliquidChain", type: "string" },
            { name: "validator", type: "address" },
            { name: "wei", type: "uint64" },
            { name: "isUndelegate", type: "bool" },
            { name: "nonce", type: "uint64" },
        ],
    },
    usdClassTransfer: {
        "HyperliquidTransaction:UsdClassTransfer": [
            { name: "hyperliquidChain", type: "string" },
            { name: "amount", type: "string" },
            { name: "toPerp", type: "bool" },
            { name: "nonce", type: "uint64" },
        ],
    },
    usdSend: {
        "HyperliquidTransaction:UsdSend": [
            { name: "hyperliquidChain", type: "string" },
            { name: "destination", type: "string" },
            { name: "amount", type: "string" },
            { name: "time", type: "uint64" },
        ],
    },
    withdraw3: {
        "HyperliquidTransaction:Withdraw": [
            { name: "hyperliquidChain", type: "string" },
            { name: "destination", type: "string" },
            { name: "amount", type: "string" },
            { name: "time", type: "uint64" },
        ],
    },
};
