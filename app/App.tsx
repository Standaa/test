import React, { ReactElement } from "react";

import { Program, Provider, web3, Wallet } from "@project-serum/anchor";

import { newAccountWithLamports } from "./utils";
import idl from "../target/idl/test";

export function App(): ReactElement {
  const NETWORK_URL_KEY = "http://localhost:8899";
  const PROGRAM_ID_KEY = "A69qsHArSsH1kYzXCs6Y5G2CiRsE79GCGMZSDgM4MqWB";

  const connection = new web3.Connection(NETWORK_URL_KEY);
  const programId = new web3.PublicKey(PROGRAM_ID_KEY);

  const opts: web3.ConfirmOptions = {
    preflightCommitment: "singleGossip",
    commitment: "finalized",
  };

  const seed = "testSeed";
  let derivedAccount: web3.PublicKey;
  let userAccount: web3.Account;
  let userWallet: Wallet;
  let provider: Provider;
  let poolProgram: Program;

  const testConnection = async () => {
    const { blockhash } = await connection.getRecentBlockhash();
    console.log("blockhash", blockhash);
  };

  const connectWallet = async () => {
    userAccount = await newAccountWithLamports(connection);
    userWallet = new Wallet(userAccount);
    provider = new Provider(connection, userWallet, opts);
    poolProgram = new Program(idl, programId, provider);
    derivedAccount = await web3.PublicKey.createWithSeed(userWallet.publicKey, seed, poolProgram.programId);
  };

  const processDeposit = async () => {
    try {
      console.log("User wallet address", userAccount.publicKey.toBase58());
      console.log("User derived address", derivedAccount.toBase58());
      await poolProgram.rpc.initializeUserPoolAccount({
        accounts: {
          userPoolAccount: derivedAccount,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [userAccount],
        instructions: [
          await web3.SystemProgram.createAccountWithSeed({
            basePubkey: userWallet.publicKey,
            fromPubkey: userWallet.publicKey,
            lamports: 10e8,
            newAccountPubkey: derivedAccount,
            programId: poolProgram.programId,
            seed: seed,
            space: 8 + 128,
          }),
        ],
      });
      const userAccountAfterInit = await poolProgram.account.userPoolAccount(derivedAccount);
      console.log("Derived Account after init & creation:", userAccountAfterInit);

      console.log("Success");
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
