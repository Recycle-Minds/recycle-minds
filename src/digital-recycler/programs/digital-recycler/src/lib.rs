use anchor_lang::prelude::*;

declare_id!("HwPQR9R7FDUTiSVHGVcobh5NYd4LrCysFviSXS1pzhL8");

#[program]
pub mod digital_recycler {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
