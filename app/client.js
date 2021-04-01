// client.js is used to introduce the reader to generating clients from IDLs.
// It is not expected users directly test with this example. For a more
// ergonomic example, see `tests/basic-0.js` in this workspace.

// const anchor = require("@project-serum/anchor");

import * as anchor from "@project-serum/anchor";

const provider = anchor.Provider.local();
// Configure the local cluster.
anchor.setProvider(anchor.Provider.local());

async function main() {
  // #region main
  // Read the generated IDL.
  const idl = JSON.parse(require("fs").readFileSync("../target/idl/test.json", "utf8"));

  // Address of the deployed program.
  const programId = new anchor.web3.PublicKey("CSVYbUJR4KV3xj8iasaX1xs5k2tud1LTzUvEbwB2qfzL");

  // Generate the program client from IDL.
  const program = new anchor.Program(idl, programId);

  // Execute the RPC.
  //   await program.rpc.initialize();
  const state = await program.state();
  console.log("state.count", state.count);
  // #endregion main

  await program.state.rpc.increment({
    accounts: {
      authority: provider.wallet.publicKey,
    },
  });
}

console.log("Running client.");
main().then(() => console.log("Success"));
