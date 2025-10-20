import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    
    if (!owner) {
      return NextResponse.json({ error: 'Owner address is required' }, { status: 400 })
    }

    const heliusApiKey = process.env.HELIUS_API_KEY
    if (!heliusApiKey) {
      return NextResponse.json({ error: 'Helius API key not configured' }, { status: 500 })
    }

    const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`)
    const ownerPubkey = new PublicKey(owner)

    // Get all token accounts for the owner
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPubkey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    })

    // Filter for empty accounts
    const emptyAccounts = tokenAccounts.value.filter((acc) => {
      try {
        const info: any = acc.account.data.parsed.info
        const amount = info.tokenAmount?.uiAmount || 0
        return amount === 0
      } catch {
        return false
      }
    })

    // Format the response
    const formattedAccounts = emptyAccounts.map(acc => ({
      address: acc.pubkey.toString(),
      mint: acc.account.data.parsed.info.mint,
      owner: acc.account.data.parsed.info.owner,
      amount: 0,
      decimals: acc.account.data.parsed.info.tokenAmount.decimals
    }))

    return NextResponse.json({ emptyAccounts: formattedAccounts })
  } catch (error) {
    console.error('Error fetching empty accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch empty accounts' }, { status: 500 })
  }
}
