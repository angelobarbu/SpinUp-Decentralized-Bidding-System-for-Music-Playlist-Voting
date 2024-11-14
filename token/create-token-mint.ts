import "dotenv/config";
import { getKeypairFromEnvironment, getExplorerLink } from "@solana-developers/helpers";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import fs from "fs";

// Token decimals set to 0
const DECIMALS = 0;

// Initialize connection to Solana Devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Load wallet from secret key in .env
const wallet = getKeypairFromEnvironment("WALLET_SECRET_KEY");

console.log("Wallet public key:", wallet.publicKey.toBase58());

// Create a new token mint
const createTokenMint = async () => {
    
    try {
        // Create a new mint for SpinCoin
        const mint = await createMint(
            connection,
            wallet,
            wallet.publicKey,
            null,
            DECIMALS
        );

        const link = getExplorerLink("address", mint.toBase58(), "devnet");

        console.log("Token mint created! Address:", mint.toBase58());

        return mint.toBase58();

    } catch (error) {
        console.error("Error creating token mint:", error);

        return null;
    }

};

// Create a new associated token account for the token mint
const createTokenAssociatedAccount = async (wallet, mint) => {
    try {
        const associatedTokenAddress = await getOrCreateAssociatedTokenAccount(
            connection,
            wallet,
            new PublicKey(mint),
            wallet.publicKey

        );
        console.log("Associated token account created! Address:", associatedTokenAddress.address.toBase58());
        return associatedTokenAddress;

    } catch (error) {
        console.error("Error creating associated token account:", error);

        return null;
    }

};

// Save mint and associated token account addresses to a file
const saveAddresses = (mintAddress: string, associatedTokenAddress: string) => {
    const data = {
        owner: wallet.publicKey.toBase58(),
        mintAuthority: wallet.publicKey.toBase58(),
        mintAddress: mintAddress,
        associatedTokenAddress: associatedTokenAddress
    };

    fs.writeFileSync("spincoin_addresses.json", JSON.stringify(data, null, 4), "utf-8");
    console.log("Addresses saved to spincoin_addresses.json");
};

// Execute the script
const execute = async () => {
    const mintAddress = await createTokenMint();
    if (!mintAddress) return;

    const associatedTokenAddress = await createTokenAssociatedAccount(wallet, mintAddress);
    if (!associatedTokenAddress) return;

    saveAddresses(mintAddress, associatedTokenAddress.address.toBase58());
};

execute();


