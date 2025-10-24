import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const heliusApiKey = process.env.HELIUS_API_KEY
    if (!heliusApiKey) {
      return NextResponse.json(
        { error: 'Helius API key not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      endpoint: `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
    })
  } catch (error) {
    console.error('Error getting RPC endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to get RPC endpoint' },
      { status: 500 }
    )
  }
}
