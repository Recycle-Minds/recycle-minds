import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const addresses = searchParams.get('addresses')
    
    if (!address && !addresses) {
      return NextResponse.json({ error: 'Account address(es) is required' }, { status: 400 })
    }

    const heliusApiKey = process.env.HELIUS_API_KEY
    if (!heliusApiKey) {
      return NextResponse.json({ error: 'Helius API key not configured' }, { status: 500 })
    }

    const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`)

    // Handle single address
    if (address) {
      // Validate address format
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
        return NextResponse.json({ error: 'Invalid address format' }, { status: 400 })
      }
      
      const accountPubkey = new PublicKey(address)
      const accountInfo = await connection.getAccountInfo(accountPubkey)
      
      if (!accountInfo) {
        return NextResponse.json({ accountInfo: null })
      }

      return NextResponse.json({ 
        accountInfo: {
          lamports: accountInfo.lamports,
          owner: accountInfo.owner.toString(),
          executable: accountInfo.executable,
          rentEpoch: accountInfo.rentEpoch
        }
      })
    }

    // Handle multiple addresses
    if (addresses) {
      const addressList = addresses.split(',')
      const pubkeys = addressList.map(addr => new PublicKey(addr))
      
      const accountInfos = await connection.getMultipleAccountsInfo(pubkeys)
      
      const results = accountInfos.map((info, index) => ({
        address: addressList[index],
        accountInfo: info ? {
          lamports: info.lamports,
          owner: info.owner.toString(),
          executable: info.executable,
          rentEpoch: info.rentEpoch
        } : null
      }))

      return NextResponse.json({ results })
    }
  } catch (error) {
    console.error('Error fetching account info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
