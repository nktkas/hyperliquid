import { isAbstractEthersV5Signer, isAbstractEthersV6Signer, } from "./ethers.js";
import { isValidPrivateKey, privateKeyToAddress, signTypedData as signTypedDataWithPrivateKey } from "./private_key.js";
import { isAbstractViemWallet } from "./viem.js";
export async function signTypedData(args) {
    const { wallet, domain, types, primaryType, message } = args;
    let signature;
    if (isAbstractViemWallet(wallet)) {
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
    else if (isAbstractEthersV6Signer(wallet)) {
        signature = await wallet.signTypedData(domain, types, message);
    }
    else if (isAbstractEthersV5Signer(wallet)) {
        signature = await wallet._signTypedData(domain, types, message);
    }
    else if (isValidPrivateKey(wallet)) {
        signature = await signTypedDataWithPrivateKey({ privateKey: wallet, domain, types, primaryType, message });
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
export async function getWalletChainId(wallet) {
    if (isAbstractViemWallet(wallet)) {
        if ("getChainId" in wallet && wallet.getChainId) {
            const chainId = await wallet.getChainId();
            return `0x${chainId.toString(16)}`;
        }
        else {
            return "0x1";
        }
    }
    else if (isAbstractEthersV6Signer(wallet) || isAbstractEthersV5Signer(wallet)) {
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
export async function getWalletAddress(wallet) {
    if (isAbstractViemWallet(wallet)) {
        if ("address" in wallet && wallet.address) {
            return wallet.address;
        }
        else if ("getAddresses" in wallet && wallet.getAddresses) {
            const addresses = await wallet.getAddresses();
            return addresses[0];
        }
    }
    else if (isAbstractEthersV6Signer(wallet) || isAbstractEthersV5Signer(wallet)) {
        if ("getAddress" in wallet && wallet.getAddress) {
            return await wallet.getAddress();
        }
    }
    else if (isValidPrivateKey(wallet)) {
        return privateKeyToAddress(wallet);
    }
    throw new Error("Unsupported wallet for getting address");
}
