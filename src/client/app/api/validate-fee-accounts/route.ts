import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const addresses = searchParams.get('addresses')
    
    if (!addresses) {
      return NextResponse.json({ error: 'Addresses parameter is required' }, { status: 400 })
    }

    const heliusApiKey = process.env.HELIUS_API_KEY
    if (!heliusApiKey) {
      return NextResponse.json({ error: 'Helius API key not configured' }, { status: 500 })
    }

    const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`)
    const addressList = addresses.split(',')
    
    const results = []
    
    for (const address of addressList) {
      try {
        const pubkey = new PublicKey(address)
        const accountInfo = await connection.getAccountInfo(pubkey)
        
        if (!accountInfo) {
          results.push({
            address,
            valid: false,
            error: 'Account does not exist on-chain'
          })
        } else if (!accountInfo.owner.equals(SystemProgram.programId)) {
          results.push({
            address,
            valid: false,
            error: 'Account is not a System account'
          })
        } else {
          results.push({
            address,
            valid: true,
            lamports: accountInfo.lamports,
            owner: accountInfo.owner.toString()
          })
        }
      } catch (error) {
        results.push({
          address,
          valid: false,
          error: `Invalid address format: ${error}`
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error validating fee accounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
