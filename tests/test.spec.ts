const assert = require("assert");
const anchor = require("@project-serum/anchor");

import { newAccountWithLamports } from "./utils";

describe("test", () => {
  const provider = anchor.Provider.local();

  anchor.setProvider(provider);
  const poolProgram = anchor.workspace.Test;
  const connection = provider.connection;

  it("Uses the workspace to invoke the initialize instruction", async () => {
    const userWallet = await newAccountWithLamports(connection);

    const seed = "test";

    const userPoolAccountPublicKey = await anchor.web3.PublicKey.createWithSeed(
      userWallet.publicKey,
      seed,
      poolProgram.programId,
    );

    await poolProgram.rpc.initializeUserPoolAccount({
      accounts: {
        userPoolAccount: userPoolAccountPublicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [userWallet],
      instructions: [
        anchor.web3.SystemProgram.createAccountWithSeed({
          basePubkey: userWallet.publicKey,
          fromPubkey: userWallet.publicKey,
          lamports: 1e8,
          newAccountPubkey: userPoolAccountPublicKey,
          programId: poolProgram.programId,
          seed: seed,
          space: 24,
        }),
      ],
    });

    const userPoolAccountAfterInit = await poolProgram.account.userPoolAccount(userPoolAccountPublicKey);

    console.log(userPoolAccountAfterInit);

    assert.ok(userPoolAccountAfterInit.shares.eq(new anchor.BN(0)));
    assert.ok(userPoolAccountAfterInit.collateral.eq(new anchor.BN(0)));
  });
});
