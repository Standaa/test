import React, { ReactElement } from "react";

import { Program, Provider, web3 } from "@project-serum/anchor";
import Wallet from "@project-serum/sol-wallet-adapter";

import idl from "../target/idl/test";

export function App(): ReactElement {
  const NETWORK_URL_KEY = "http://localhost:8899";
  const WALLET_URL_KEY = "https://www.sollet.io";
  const PROGRAM_ID_KEY = "BTUP4TioquQzGDE9wD5qiTzPKQjDaaJNxHSdV3rD6JyM";

  const connection = new web3.Connection(NETWORK_URL_KEY);
  const programId = new web3.PublicKey(PROGRAM_ID_KEY);

  const opts: web3.ConfirmOptions = {
    preflightCommitment: "singleGossip",
    commitment: "confirmed",
  };

  const seed = "testSeed";
  let userWallet: any;
  let derivedAccount: web3.PublicKey;
  let provider: Provider;
  let poolProgram: Program;

  const testConnection = async () => {
    const { blockhash } = await connection.getRecentBlockhash();
    console.log("blockhash", blockhash);
  };

  const connectWallet = async () => {
    userWallet = new Wallet(WALLET_URL_KEY, NETWORK_URL_KEY);

    userWallet.on("connect", (publicKey: { toBase58: () => string }) =>
      console.log("Connected to " + publicKey.toBase58()),
    );
    userWallet.on("disconnect", () => console.log("Disconnected"));
    await userWallet.connect();

    provider = new Provider(connection, userWallet, opts);
    poolProgram = new Program(idl, programId, provider);

    console.log("wallet.publicKey", userWallet.publicKey);
    derivedAccount = await web3.PublicKey.createWithSeed(provider.wallet.publicKey, seed, poolProgram.programId);
  };

  const processDeposit = async () => {
    try {
      console.log("User wallet address", userWallet.publicKey.toBase58());
      console.log("User derived address", derivedAccount.toBase58());

      await poolProgram.rpc.initializeUserPoolAccount({
        accounts: {
          userPoolAccount: derivedAccount,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
        instructions: [
          await web3.SystemProgram.createAccountWithSeed({
            basePubkey: userWallet.publicKey,
            fromPubkey: userWallet.publicKey,
            lamports: 1e7,
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
