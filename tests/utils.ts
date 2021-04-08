const anchor = require("@project-serum/anchor");

export const newAccountWithLamports = async (connection, lamports = 1e10) => {
  const account = new anchor.web3.Account();

  let retries = 30;
  await connection.requestAirdrop(account.publicKey, lamports);
  while (true) {
    await sleep(500);
    if (lamports == (await connection.getBalance(account.publicKey))) {
      return account;
    }
    if (--retries <= 0) {
      break;
    }
  }
  throw new Error(`Airdrop of ${lamports} failed`);
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
