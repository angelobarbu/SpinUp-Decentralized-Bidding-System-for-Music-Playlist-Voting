import "dotenv/config";
import { mintTo } from "@solana/spl-token";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import fs from "fs";

// Get mint amount from environment
const MINT_AMOUNT = parseInt(process.env.MINT_AMOUNT);

// Initialize connection to Solana Devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Load wallet from secret key in .env
const wallet = getKeypairFromEnvironment("WALLET_SECRET_KEY");

// Load token mint and associated token address from file
const loadAddresses = () => {
    const data = JSON.parse(fs.readFileSync("spincoin_addresses.json", "utf-8"));
    const mintAddress = new PublicKey(data.mintAddress);
    const associatedTokenAddress = new PublicKey(data.associatedTokenAddress);
    return { mintAddress, associatedTokenAddress };
};

// Mint tokens to the associated token account
const mintTokens = async () => {
    try {
        const { mintAddress, associatedTokenAddress } = loadAddresses();
        await mintTo(
            connection,
            wallet,
            mintAddress,
            associatedTokenAddress,
            wallet,
            MINT_AMOUNT
        );
        console.log("Minted", MINT_AMOUNT, "tokens to associated token account:", associatedTokenAddress.toBase58());
    } catch (error) {
        console.error("Error minting tokens:", error);
    }
};

mintTokens();