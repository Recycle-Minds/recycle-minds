import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('id')
    
    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 })
    }

    const heliusApiKey = process.env.HELIUS_API_KEY
    if (!heliusApiKey) {
      console.error('HELIUS_API_KEY environment variable is not set')
      return NextResponse.json({ error: 'Helius API key not configured' }, { status: 500 })
    }

    const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
    
    const response = await fetch(heliusUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'getAsset',
        params: {
          id: assetId
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`)
    }

    return NextResponse.json({ asset: data.result })
  } catch (error) {
    console.error('Error fetching asset:', error)
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 })
  }
}
