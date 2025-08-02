"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signTypedData = signTypedData;
exports.getWalletChainId = getWalletChainId;
exports.getWalletAddress = getWalletAddress;
const ethers_js_1 = require("./ethers.js");
const private_key_js_1 = require("./private_key.js");
const viem_js_1 = require("./viem.js");
async function signTypedData(args) {
    const { wallet, domain, types, primaryType, message } = args;
    let signature;
    if ((0, viem_js_1.isAbstractViemWallet)(wallet)) {
        signature = await wallet.signTypedData({
            domain,
            types: {
                EIP712Domain: [
                    { name: "name", type: "string" },
                    { name: "version", type: "string" },
                    { name: "chainId", type: "uint256" },
                    { name: "verifyingContract", type: "address" },
                ],
                ...types,
            },
            primaryType,
            message,
        });
    }
    else if ((0, ethers_js_1.isAbstractEthersV6Signer)(wallet)) {
        signature = await wallet.signTypedData(domain, types, message);
    }
    else if ((0, ethers_js_1.isAbstractEthersV5Signer)(wallet)) {
        signature = await wallet._signTypedData(domain, types, message);
    }
    else if ((0, private_key_js_1.isValidPrivateKey)(wallet)) {
        signature = await (0, private_key_js_1.signTypedData)({ privateKey: wallet, domain, types, primaryType, message });
    }
    else {
        throw new Error("Unsupported wallet for signing typed data");
    }
    return splitSignature(signature);
}
function splitSignature(signature) {
    const r = `0x${signature.slice(2, 66)}`;
    const s = `0x${signature.slice(66, 130)}`;
    const v = parseInt(signature.slice(130, 132), 16);
    return { r, s, v };
}
/** Get the chain ID of the wallet. */
async function getWalletChainId(wallet) {
    if ((0, viem_js_1.isAbstractViemWallet)(wallet)) {
        if ("getChainId" in wallet && wallet.getChainId) {
            const chainId = await wallet.getChainId();
            return `0x${chainId.toString(16)}`;
        }
        else {
            return "0x1";
        }
    }
    else if ((0, ethers_js_1.isAbstractEthersV6Signer)(wallet) || (0, ethers_js_1.isAbstractEthersV5Signer)(wallet)) {
        if ("provider" in wallet && wallet.provider) {
            const network = await wallet.provider.getNetwork();
            return `0x${network.chainId.toString(16)}`;
        }
        else {
            return "0x1";
        }
    }
    else {
        return "0x1";
    }
}
/** Get the wallet address from various wallet types. */
async function getWalletAddress(wallet) {
    if ((0, viem_js_1.isAbstractViemWallet)(wallet)) {
        if ("address" in wallet && wallet.address) {
            return wallet.address;
        }
        else if ("getAddresses" in wallet && wallet.getAddresses) {
            const addresses = await wallet.getAddresses();
            return addresses[0];
        }
    }
    else if ((0, ethers_js_1.isAbstractEthersV6Signer)(wallet) || (0, ethers_js_1.isAbstractEthersV5Signer)(wallet)) {
        if ("getAddress" in wallet && wallet.getAddress) {
            return await wallet.getAddress();
        }
    }
    else if ((0, private_key_js_1.isValidPrivateKey)(wallet)) {
        return (0, private_key_js_1.privateKeyToAddress)(wallet);
    }
    throw new Error("Unsupported wallet for getting address");
}
