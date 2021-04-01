// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

const anchor = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  // Add your deploy script here.
  const program = anchor.workspace.Test;

  // Initialize the program's state struct.
  await program.state.rpc.new({
    accounts: {
      authority: provider.wallet.publicKey,
    },
  });

  const state = await program.state();

  console.log("state count", state.count);
};
