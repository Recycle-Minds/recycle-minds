import { NextRequest, NextResponse } from 'next/server'
import { PublicKey } from '@solana/web3.js'

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

    const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
    
    const response = await fetch(heliusUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: owner,
          page: 1,
          limit: 1000
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

    const assets = data.result?.items || []
    
    // Filter for NFT-like assets (exclude burnt ones)
    const nftAssets = assets.filter((asset: any) => 
      !asset.burnt && 
      (asset.interface === 'V1_NFT' || 
       asset.interface === 'ProgrammableNFT' || 
       asset.interface === 'MplCoreAsset' ||
       asset.interface === 'MplCoreCollection')
    )

    const nftAccounts = nftAssets.map((asset: any) => {
      const name = asset.content?.metadata?.name || asset.json?.name || `NFT #${asset.id.slice(0, 8)}`
      const symbol = asset.content?.metadata?.symbol || asset.json?.symbol || 'NFT'
      const image = asset.content?.files?.[0]?.uri || asset.content?.metadata?.image || '/placeholder.jpg'
      
      // Try to get collection info from grouping or metadata
      let collection = undefined
      if (asset.grouping && asset.grouping.length > 0) {
        const collectionGroup = asset.grouping.find((g: any) => g.group_key === 'collection')
        if (collectionGroup) {
          collection = {
            name: collectionGroup.group_value,
            address: collectionGroup.group_value,
            verified: true // DAS API collections are verified
          }
        }
      } else if (asset.json?.collection) {
        collection = {
          name: asset.json.collection.name || 'Unknown Collection',
          address: asset.json.collection.address || asset.id,
          verified: asset.json.collection.verified || false
        }
      }

      return {
        mint: asset.id,
        owner: asset.ownership.owner,
        name,
        symbol,
        image,
        interface: asset.interface,
        collection,
        burnt: asset.burnt
      }
    })

    return NextResponse.json({ nfts: nftAccounts })
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 })
  }
}
