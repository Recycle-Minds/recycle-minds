import { NextRequest, NextResponse } from 'next/server'
import { Connection } from '@solana/web3.js'

export async function GET(request: NextRequest) {
  try {
    const heliusApiKey = process.env.HELIUS_API_KEY
    if (!heliusApiKey) {
      return NextResponse.json({ error: 'Helius API key not configured' }, { status: 500 })
    }

    const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`)
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    
    return NextResponse.json({ 
      blockhash,
      lastValidBlockHeight: lastValidBlockHeight.toString()
    })
  } catch (error) {
    console.error('Error fetching latest blockhash:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
