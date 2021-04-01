const assert = require("assert");
const anchor = require("@project-serum/anchor");

describe("test", () => {
  const provider = anchor.Provider.local();

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.Test;

  it("Is runs the constructor", async () => {
    // #region ctor
    // Initialize the program's state struct.
    await program.state.rpc.new({
      accounts: {
        authority: provider.wallet.publicKey,
      },
    });
    // #endregion ctor

    // Fetch the state struct from the network.
    // #region accessor
    const state = await program.state();
    // #endregion accessor

    assert.ok(state.count.eq(new anchor.BN(0)));
  });

  it("Executes a method on the program", async () => {
    // #region instruction
    await program.state.rpc.increment({
      accounts: {
        authority: provider.wallet.publicKey,
      },
    });
    // #endregion instruction
    const state = await program.state();
    assert.ok(state.count.eq(new anchor.BN(1)));
  });
});
