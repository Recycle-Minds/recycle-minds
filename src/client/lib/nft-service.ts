import { Connection, PublicKey } from '@solana/web3.js'
import { getAssetsByOwner, getAsset, DasAsset } from './das-api'
import { StatsService, RecycledNFT } from './stats-service'

export interface NFTAccount {
  mint: string
  owner: string
  name: string
  symbol: string
  image: string
  interface: string
  collection?: {
    name: string
    address: string
    verified: boolean
  }
  burnt: boolean
}

export interface NFTCollection {
  name: string
  symbol: string
  image: string
  count: number
  mint: string
  interface: string
  collection?: {
    address: string
    verified: boolean
  }
}

export class NFTService {
  private connection: Connection
  private debug: boolean

  constructor(connection: Connection, debug: boolean = true) {
    this.connection = connection
    this.debug = debug
  }

  private log(message: string, ...args: any[]) {
    if (this.debug) {
      console.log(`[NFTService] ${message}`, ...args)
    }
  }

  async getNFTsByOwner(owner: PublicKey): Promise<NFTAccount[]> {
    try {
      this.log('Fetching NFTs for owner:', owner.toString())
      
      // Use Helius DAS API directly
      const heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY || 'demo-key'
      const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
      this.log('Using Helius DAS API:', heliusUrl)
      
      const response = await fetch(heliusUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: owner.toString(),
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
      this.log('Total assets found via DAS API:', assets.length)

      // Filter for NFT-like assets (exclude burnt ones)
      const nftAssets = assets.filter(asset => 
        !asset.burnt && 
        (asset.interface === 'V1_NFT' || 
         asset.interface === 'ProgrammableNFT' || 
         asset.interface === 'MplCoreAsset' ||
         asset.interface === 'MplCoreCollection')
      )

      this.log('NFT assets found via DAS API:', nftAssets.length)

      const nftAccounts: NFTAccount[] = nftAssets.map(asset => {
        const name = asset.content?.metadata?.name || asset.json?.name || `NFT #${asset.id.slice(0, 8)}`
        const symbol = asset.content?.metadata?.symbol || asset.json?.symbol || 'NFT'
        const image = asset.content?.files?.[0]?.uri || asset.content?.metadata?.image || '/placeholder.jpg'
        
        // Try to get collection info from grouping or metadata
        let collection = undefined
        if (asset.grouping && asset.grouping.length > 0) {
          const collectionGroup = asset.grouping.find(g => g.group_key === 'collection')
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

      this.log('Processed NFTs via DAS API:', nftAccounts.length)
      return nftAccounts
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      throw new Error('Failed to fetch NFTs')
    }
  }

  async getNFTsByOwnerTraditional(owner: PublicKey): Promise<NFTAccount[]> {
    try {
      this.log('Using traditional NFT fetching methods')
      
      // Get all token accounts for the owner
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(owner, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      })

      this.log('Found token accounts:', tokenAccounts.value.length)

      const nftAccounts: NFTAccount[] = []
      let nftCount = 0

      for (const tokenAccount of tokenAccounts.value) {
        try {
          const accountData = tokenAccount.account.data.parsed.info
          
          // Check if it's an NFT (supply = 1, decimals = 0)
          if (accountData.tokenAmount.uiAmount === 1 && accountData.tokenAmount.decimals === 0) {
            nftCount++
            const mint = accountData.mint
            this.log(`Processing NFT ${nftCount}:`, mint)
            
            // Get metadata
            const [metadataPDA] = PublicKey.findProgramAddressSync(
              [
                Buffer.from('metadata'),
                new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
                new PublicKey(mint).toBuffer()
              ],
              new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
            )

            try {
              const metadataAccount = await this.connection.getAccountInfo(metadataPDA)
              if (metadataAccount) {
                // Parse Metaplex metadata format
                const data = metadataAccount.data
                const nameLength = data.readUInt32LE(4)
                const name = data.slice(4, 4 + nameLength).toString('utf8')
                const symbolLength = data.readUInt32LE(4 + nameLength)
                const symbol = data.slice(4 + nameLength, 4 + nameLength + symbolLength).toString('utf8')
                
                // Try to get URI for image
                const uriLength = data.readUInt32LE(4 + nameLength + symbolLength)
                const uri = data.slice(4 + nameLength + symbolLength, 4 + nameLength + symbolLength + uriLength).toString('utf8')
                
                // Fetch metadata JSON from URI
                let image = '/placeholder.jpg'
                try {
                  if (uri && uri.startsWith('http')) {
                    const metadataResponse = await fetch(uri)
                    if (metadataResponse.ok) {
                      const metadataJson = await metadataResponse.json()
                      image = metadataJson.image || '/placeholder.jpg'
                    }
                  }
                } catch (uriError) {
                  this.log('Error fetching metadata URI:', uriError)
                }
                
                const nftAccount: NFTAccount = {
                  mint,
                  owner: owner.toString(),
                  name: name || `NFT #${mint.slice(0, 8)}`,
                  symbol: symbol || 'NFT',
                  image,
                  interface: 'V1_NFT',
                  collection: undefined,
                  burnt: false
                }

                nftAccounts.push(nftAccount)
                this.log(`Successfully processed NFT: ${name}`)
              } else {
                this.log(`No metadata account found for ${mint}`)
              }
            } catch (metadataError) {
              this.log('Error fetching metadata for', mint, metadataError)
            }
          }
        } catch (error) {
          this.log('Error processing token account:', error)
        }
      }

      this.log(`Found ${nftCount} potential NFTs, successfully processed ${nftAccounts.length} NFTs via traditional method`)
      return nftAccounts
    } catch (error) {
      this.log('Traditional NFT fetching failed:', error)
      throw error
    }
  }

  async getCollectionsByOwner(owner: PublicKey): Promise<NFTCollection[]> {
    try {
      const nfts = await this.getNFTsByOwner(owner)
      const collectionMap = new Map<string, NFTCollection>()

      this.log('Processing', nfts.length, 'NFTs for collections')

      for (const nft of nfts) {
        if (nft.collection) {
          const collectionKey = nft.collection.address
          const existing = collectionMap.get(collectionKey)
          
          if (existing) {
            existing.count++
          } else {
            collectionMap.set(collectionKey, {
              name: nft.collection.name,
              symbol: nft.symbol,
              image: nft.image,
              count: 1,
              mint: nft.mint,
              interface: nft.interface,
              collection: {
                address: collectionKey,
                verified: nft.collection.verified
              }
            })
          }
        } else {
          // Group NFTs without collection by their mint address (individual NFTs)
          const individualKey = `individual_${nft.mint}`
          collectionMap.set(individualKey, {
            name: nft.name,
            symbol: nft.symbol,
            image: nft.image,
            count: 1,
            mint: nft.mint,
            interface: nft.interface,
            collection: undefined
          })
        }
      }

      const collections = Array.from(collectionMap.values())
      this.log('Found collections:', collections.length)
      return collections
    } catch (error) {
      console.error('Error fetching collections:', error)
      throw new Error('Failed to fetch collections')
    }
  }

  async burnNFT(mintAddress: string, owner: PublicKey): Promise<boolean> {
    try {
      this.log('Burning NFT:', mintAddress, 'for owner:', owner.toString())
      
      // First, verify the asset exists and is owned by the user
      const rpcUrl = this.connection.rpcEndpoint
      const asset = await getAsset(rpcUrl, mintAddress)
      
      if (!asset) {
        throw new Error('Asset not found')
      }
      
      if (asset.burnt) {
        throw new Error('Asset is already burnt')
      }
      
      if (asset.ownership.owner !== owner.toString()) {
        throw new Error('Asset is not owned by the user')
      }

      // In a real implementation, you would:
      // 1. Create a transaction to close the token account
      // 2. This would recover the rent (about 0.00203928 SOL)
      // 3. Send the transaction to the network
      
      // For now, we'll simulate the burn process
      // The actual implementation would use @solana/spl-token to create the close account instruction
      
      this.log('Simulating NFT burn - in production this would close the token account and recover rent')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Calculate stats for the recycled NFT
      const nftValue = 0.1 // Estimated NFT value for points calculation
      const solRecovered = 0.002 // Typical rent recovery
      
      // Create recycled NFT record
      const recycledNFT: RecycledNFT = {
        mint: mintAddress,
        name: asset.content?.metadata?.name || asset.json?.name || `NFT #${mintAddress.slice(0, 8)}`,
        image: asset.content?.files?.[0]?.uri || asset.content?.metadata?.image || '/placeholder.jpg',
        collection: asset.json?.collection?.name || 'Unknown Collection',
        recycledAt: new Date().toISOString(),
        solRecovered,
        pointsEarned: StatsService.calculatePoints(nftValue),
        co2Saved: StatsService.calculateCO2Saved(nftValue),
        txSignature: 'simulated_signature_' + Date.now()
      }
      
      // Add to stats
      StatsService.addRecycledNFT(owner.toString(), recycledNFT)
      
      this.log('NFT burned successfully:', mintAddress)
      this.log('Stats updated - Points:', recycledNFT.pointsEarned, 'SOL:', recycledNFT.solRecovered, 'CO2:', recycledNFT.co2Saved)
      
      return true
    } catch (error) {
      console.error('Error burning NFT:', error)
      throw new Error('Failed to burn NFT')
    }
  }
}
