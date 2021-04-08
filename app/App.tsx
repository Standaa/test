import React, { ReactElement } from "react";

import { Program, Provider, web3 } from "@project-serum/anchor";
import Wallet from "@project-serum/sol-wallet-adapter";

import idl from "../target/idl/test";

export function App(): ReactElement {
  // const NETWORK_URL_KEY = "https://devnet.solana.com";
  const NETWORK_URL_KEY = "http://localhost:8899";
  const WALLET_PROVIDER = "https://www.sollet.io";
  const PROGRAM_ID_KEY = "89q7CoJhBrWhb2ZmZzAbaU2Rs4EEQBzhLCzZxfb6bBTu";

  const connection = new web3.Connection(NETWORK_URL_KEY);
  const wallet = new Wallet(WALLET_PROVIDER, NETWORK_URL_KEY);
  const programId = new web3.PublicKey(PROGRAM_ID_KEY);

  const opts: web3.ConfirmOptions = {
    preflightCommitment: "singleGossip",
    commitment: "singleGossip",
  };

  const provider = new Provider(connection, wallet, opts);
  const poolClient = new Program(idl, programId, provider);

  const testConnection = async () => {
    const { blockhash } = await connection.getRecentBlockhash();
    console.log("blockhash", blockhash);
  };

  const connectWallet = async () => {
    await wallet.connect();
  };

  wallet.on("connect", () => {
    console.log("Connected to wallet ", wallet.publicKey.toBase58());
  });

  wallet.on("disconnect", () => {
    console.log("Disconnected from wallet");
  });

  const processDeposit = async () => {
    try {
      const seed = "seedTest";

      const userPoolAccountPublicKey = await web3.PublicKey.createWithSeed(
        wallet.publicKey,
        seed,
        poolClient.programId,
      );

      console.log("userPoolAccountPublicKey", userPoolAccountPublicKey);

      await poolClient.rpc.initialiseUserPoolAccount({
        accounts: {
          userPoolAccount: userPoolAccountPublicKey,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [wallet],
        instructions: [
          await web3.SystemProgram.createAccountWithSeed({
            basePubkey: wallet.publicKey,
            fromPubkey: wallet.publicKey,
            lamports: 1e8,
            newAccountPubkey: userPoolAccountPublicKey,
            programId: poolClient.programId,
            seed: seed,
            space: 16,
          }),
        ],
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <button type="button" onClick={testConnection}>
        Test Connection
      </button>
      <button type="button" onClick={connectWallet}>
        Connect Wallet
      </button>
      <button type="button" onClick={processDeposit}>
        Initialise Pool Account
      </button>
    </>
  );
}
