#![feature(proc_macro_hygiene)]

use anchor_lang::prelude::*;

#[program]
pub mod test {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }

    pub fn initialise_user_pool_account(ctx: Context<InitialiseUserPoolAccount>) -> ProgramResult {
        let user_pool_account = &mut ctx.accounts.user_pool_account;
        user_pool_account.shares = 0;
        user_pool_account.collateral = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct InitialiseUserPoolAccount<'info> {
    #[account(init)]
    pub user_pool_account: ProgramAccount<'info, UserPoolAccount>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct UserPoolAccount {
    pub shares: u64,
    pub collateral: u64,
}

#[error]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
}
