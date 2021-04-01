import React, { ReactElement } from "react";

import { Program } from "@project-serum/anchor";
import { Provider } from "@project-serum/common";
import Wallet from "@project-serum/sol-wallet-adapter";

import idl from "../target/idl/test";
import payerAccount from "./payer";
import { Connection, PublicKey, ConfirmOptions } from "@solana/web3.js";

export function App(): ReactElement {
  console.log(payerAccount.publicKey.toBase58());

  const opts: ConfirmOptions = {
    skipPreflight: true,
    commitment: "singleGossip",
    preflightCommitment: "singleGossip",
  };

  const networkUrl = "http://localhost:8899";
  const providerUrl = "https://www.sollet.io";

  const connection = new Connection(networkUrl, opts.preflightCommitment);
  const wallet = new Wallet(providerUrl, networkUrl);
  const provider = new Provider(connection, wallet, opts);

  const PROGRAM_ID_KEY = "E67H3eVYoZH8adR4AB2B9dzfBfJyPrDCA2FbTmAMJsy2";

  wallet.on("connect", (publicKey) => console.log("Connected to " + publicKey.toBase58()));
  wallet.on("disconnect", () => console.log("Disconnected"));

  // Address of the deployed program.
  const programId = new PublicKey(PROGRAM_ID_KEY);
  // Generate the program client from IDL.
  const poolClient = new Program(idl, programId, provider);

  const connectWallet = async () => {
    await wallet.connect();
  };

  const handleProcess = async () => {
    try {
      const state = await poolClient.state();
      console.log(state);
      console.log("Success");
    } catch (e) {
      console.log("ERRRR:", e);
    }
  };

  return (
    <>
      <button type="button" onClick={connectWallet}>
        Connect Wallet
      </button>
      <button type="button" onClick={handleProcess}>
        Click
      </button>
    </>
  );
}
