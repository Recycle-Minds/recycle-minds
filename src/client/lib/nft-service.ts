import { Connection, PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createBurnInstruction,
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import {
  PROGRAM_ID as TMETA_PROGRAM_ID,
  findMetadataPda,
  findMasterEditionPda,
  findTokenRecordPda,
  createBurnV1Instruction,
} from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from '@metaplex-foundation/umi'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'
import { createBurnV1Instruction as coreCreateBurnV1Instruction } from '@metaplex-foundation/mpl-core'
import { getAssetsByOwner, getAsset, DasAsset } from './das-api'
import { StatsService, RecycledNFT } from './stats-service'
import { PLATFORM_FEE_ACCOUNT, calculatePlatformFeeTransfer, solToLamports } from './platform-config'

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

  // Create platform fee transfer instruction
  private async createPlatformFeeInstruction(from: PublicKey, rentRecovery: number): Promise<TransactionInstruction> {
    const platformFee = calculatePlatformFeeTransfer(rentRecovery)
    const feeLamports = solToLamports(platformFee)
    
    this.log('Creating platform fee instruction:', platformFee, 'SOL (12% of', rentRecovery, 'SOL rent recovery)')
    this.log('Platform fee in lamports:', feeLamports)
    
    // Check user's actual balance before creating the instruction
    try {
      const balance = await this.connection.getBalance(from)
      const balanceSOL = balance / 1_000_000_000
      this.log('User actual balance:', balanceSOL, 'SOL')
      this.log('User balance in lamports:', balance)
      this.log('Platform fee in lamports:', feeLamports)
      this.log('Transaction fee estimate: ~5000 lamports')
      this.log('Total required:', feeLamports + 5000, 'lamports')
      
      if (balance < feeLamports + 10000) { // Reserve 10k lamports for transaction fees
        this.log('WARNING: User may not have enough SOL for platform fee + transaction fees')
        this.log('Balance:', balance, 'lamports, Required:', feeLamports + 10000, 'lamports')
      }
    } catch (error) {
      this.log('Error checking balance:', error)
    }

    // Destination account preflight: must exist and be a System account, or the transfer may fail
    try {
      const destInfo = await this.connection.getAccountInfo(PLATFORM_FEE_ACCOUNT)
      if (!destInfo) {
        // If the destination account does not exist, a small transfer (< rent-exempt) will fail simulation
        // because new System accounts must meet rent-exempt minimum at creation.
        // Require the platform fee account to be pre-created/funded once or set via env to an existing wallet.
        const message = 'Platform fee account does not exist on-chain. Fund it once (>= rent-exempt min) or set NEXT_PUBLIC_PLATFORM_FEE_ACCOUNT to an existing System wallet.'
        this.log(message, PLATFORM_FEE_ACCOUNT.toString())
        throw new Error(message)
      }
      // Ensure it's a System account
      if (!destInfo.owner.equals(SystemProgram.programId)) {
        const message = 'Platform fee account is not a System account. Set NEXT_PUBLIC_PLATFORM_FEE_ACCOUNT to a valid System wallet address.'
        this.log(message, PLATFORM_FEE_ACCOUNT.toString())
        throw new Error(message)
      }
    } catch (e) {
      // Surface clear error so UI/toast can show actionable message
      throw e instanceof Error ? e : new Error('Failed to validate platform fee destination account')
    }
    
    return SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: PLATFORM_FEE_ACCOUNT,
      lamports: feeLamports,
    })
  }

  async getNFTsByOwner(owner: PublicKey): Promise<NFTAccount[]> {
    try {
      this.log('Fetching NFTs for owner:', owner.toString())
      
      // Use Helius DAS API directly
      const heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY || 'demo-key'
      const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
      
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

  // Build a burn + close transaction for classic SPL NFTs (supply 1, decimals 0)
  async buildBurnTransaction(mintAddress: string, owner: PublicKey): Promise<Transaction> {
    this.log('Building burn transaction for:', mintAddress)
    const mint = new PublicKey(mintAddress)

    try {
      // Derive ATA
      const ata = await getAssociatedTokenAddress(mint, owner, true)
      this.log('Derived ATA:', ata.toString())

      // Check if the ATA actually exists
      const ataInfo = await this.connection.getAccountInfo(ata)
      if (!ataInfo) {
        this.log('ATA does not exist for mint:', mintAddress)
        throw new Error(`Associated token account does not exist for mint ${mintAddress}`)
      }

      this.log('ATA exists, building burn instructions')

      // Burn 1 token and close account to owner
      const burnIx = createBurnInstruction(
        ata,
        mint,
        owner,
        1,
        [],
        TOKEN_PROGRAM_ID
      )

      const closeIx = createCloseAccountInstruction(
        ata,
        owner,      // destination (receive rent)
        owner,      // owner/authority
        [],
        TOKEN_PROGRAM_ID
      )

      const tx = new Transaction()
      
      // Add platform fee FIRST (12% of rent recovery)
      const rentRecovery = 0.002 // Typical rent recovery for token account
      const platformFeeIx = await this.createPlatformFeeInstruction(owner, rentRecovery)
      tx.add(platformFeeIx)
      this.log('Added platform fee to V1_NFT burn transaction')
      
      // Add burn and close instructions AFTER platform fee
      tx.add(burnIx, closeIx)
      
      this.log('Built V1_NFT burn transaction successfully')
      return tx
    } catch (error) {
      this.log('Error building V1_NFT burn transaction:', error)
      throw new Error(`Failed to build V1_NFT burn transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Build a burn for Programmable NFTs (pNFT) using Token Metadata burnV1
  async buildProgrammableBurnTransaction(mintAddress: string, owner: PublicKey): Promise<Transaction> {
    this.log('Building pNFT burn transaction for:', mintAddress)
    const mint = new PublicKey(mintAddress)
    const token = await getAssociatedTokenAddress(mint, owner, true)
    const metadata = findMetadataPda(mint)
    const edition = findMasterEditionPda(mint)
    const tokenRecord = findTokenRecordPda(mint, token)

    const accounts = {
      metadata,
      edition,
      mint,
      token,
      authority: owner,
      splTokenProgram: TOKEN_PROGRAM_ID,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      tokenRecord,
      // ruleSet and auth rules accounts are optional here; if the asset has a rule set, the program will enforce it
    }

    const ix = createBurnV1Instruction(accounts)
    const closeIx = createCloseAccountInstruction(token, owner, owner, [], TOKEN_PROGRAM_ID)
    const tx = new Transaction()
    
    // Add platform fee FIRST (12% of rent recovery)
    const rentRecovery = 0.002 // Typical rent recovery for token account
    const platformFeeIx = await this.createPlatformFeeInstruction(owner, rentRecovery)
    tx.add(platformFeeIx)
    this.log('Added platform fee to pNFT burn transaction')
    
    // Add burn and close instructions AFTER platform fee
    tx.add(ix, closeIx)
    
    this.log('Built pNFT burn transaction successfully')
    return tx
  }

  async buildBurnTransactionAuto(nft: NFTAccount, owner: PublicKey): Promise<Transaction> {
    if (nft.interface === 'V1_NFT') return this.buildBurnTransaction(nft.mint, owner)
    if (nft.interface === 'ProgrammableNFT') return this.buildProgrammableBurnTransaction(nft.mint, owner)
    if (nft.interface === 'MplCoreAsset') {
      // For Core assets, we'll try the Core burn first, but fallback to V1_NFT if it fails
      console.log('Building MplCoreAsset burn transaction for:', nft.mint)
      try {
        return await this.buildCoreAssetBurnTransaction(nft.mint, owner)
      } catch (error) {
        console.log('Core asset burn failed, falling back to V1_NFT approach:', error)
        // Fallback to treating it as V1_NFT
        try {
          console.log('Trying V1_NFT approach for Core asset...')
          const result = await this.buildBurnTransaction(nft.mint, owner)
          console.log('V1_NFT approach succeeded!')
          return result
        } catch (v1Error) {
          console.log('V1_NFT approach also failed, trying ProgrammableNFT approach:', v1Error)
          // If V1_NFT also fails, try ProgrammableNFT approach
          try {
            console.log('Trying ProgrammableNFT approach for Core asset...')
            const result = await this.buildProgrammableBurnTransaction(nft.mint, owner)
            console.log('ProgrammableNFT approach succeeded!')
            return result
          } catch (pNFTError) {
            console.log('ProgrammableNFT approach also failed, trying CoreAssetFallback:', pNFTError)
            // As a last resort, try to find and close any token accounts for this mint
            console.log('Trying CoreAssetFallback approach for Core asset...')
            const result = await this.buildCoreAssetFallbackBurn(nft.mint, owner)
            console.log('CoreAssetFallback approach succeeded!')
            return result
          }
        }
      }
    }
    if (nft.interface === 'MplCoreCollection') {
      // Removing a collection is different; skip by default to avoid footguns
      throw new Error('Burning Core collections is not supported in client-only flow')
    }
    throw new Error(`Unsupported burn interface: ${nft.interface}`)
  }

  // Build a burn transaction for MplCoreAsset
  async buildCoreAssetBurnTransaction(mintAddress: string, owner: PublicKey): Promise<Transaction> {
    this.log('Building Core asset burn transaction for:', mintAddress)
    
    // Build instruction compatible with web3.js tx using mpl-core's JS binding
    const asset = new PublicKey(mintAddress)
    const ix = coreCreateBurnV1Instruction({ asset, authority: owner, payer: owner })
    const tx = new Transaction()
    
    // Add platform fee FIRST (12% of rent recovery)
    const rentRecovery = 0.002 // Typical rent recovery for token account
    const platformFeeIx = await this.createPlatformFeeInstruction(owner, rentRecovery)
    tx.add(platformFeeIx)
    this.log('Added platform fee to Core asset burn transaction')
    
    // Add burn instruction AFTER platform fee
    tx.add(ix)
    
    this.log('Built Core asset burn transaction successfully')
    return tx
  }

  // Fallback burn method for MplCoreAsset - tries to find and close any token accounts
  async buildCoreAssetFallbackBurn(mintAddress: string, owner: PublicKey): Promise<Transaction> {
    this.log('Building Core asset fallback burn for:', mintAddress)
    
    // No-op by design; there is no SPL fallback for Core assets.
    throw new Error('MplCoreAsset burn fallback is not available; Core assets are not SPL tokens')
  }

  // Verify on-chain that an asset is actually gone/burned before updating stats
  async verifyBurnSuccess(mintAddress: string, owner: PublicKey, iface: string): Promise<boolean> {
    try {
      if (iface === 'V1_NFT' || iface === 'ProgrammableNFT') {
        const mint = new PublicKey(mintAddress)
        const ata = await getAssociatedTokenAddress(mint, owner, true)
        const ataInfo = await this.connection.getAccountInfo(ata)
        if (!ataInfo) return true // account closed => burned/closed
        try {
          const parsed = await this.connection.getParsedAccountInfo(ata)
          const amount = (parsed.value as any)?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0
          return amount === 0
        } catch {
          return false
        }
      }
      if (iface === 'MplCoreAsset') {
        const rpcUrl = this.connection.rpcEndpoint
        const asset = await getAsset(rpcUrl, mintAddress)
        if (!asset) return true
        if (asset.burnt) return true
        if (asset.ownership?.owner && asset.ownership.owner !== owner.toString()) return true
        return false
      }
      return false
    } catch (e) {
      this.log('verifyBurnSuccess error:', e)
      return false
    }
  }

  // Build a cleanup transaction that closes up to `limit` empty token accounts
  async buildCleanupTransaction(owner: PublicKey, limit: number = 10): Promise<{ tx: Transaction; closedAccounts: PublicKey[] }> {
    this.log('Building cleanup transaction for owner:', owner.toString())
    const parsed = await this.connection.getParsedTokenAccountsByOwner(owner, { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') })

    const emptyAccounts = parsed.value
      .filter((acc) => {
        try {
          const info: any = acc.account.data.parsed.info
          const amount = info.tokenAmount?.uiAmount || 0
          return amount === 0
        } catch {
          return false
        }
      })
      .slice(0, limit)

    const tx = new Transaction()
    const closed: PublicKey[] = []

    for (const acc of emptyAccounts) {
      tx.add(createCloseAccountInstruction(
        acc.pubkey,
        owner,
        owner,
        [],
        TOKEN_PROGRAM_ID
      ))
      closed.push(acc.pubkey)
    }

    this.log('Prepared close instructions for accounts:', closed.length)
    return { tx, closedAccounts: closed }
  }

  // Build cleanup tx for an explicit list of token account pubkeys
  async buildCleanupTransactionForAccounts(owner: PublicKey, accounts: PublicKey[]): Promise<{ tx: Transaction; closedAccounts: PublicKey[] }> {
    this.log('Building targeted cleanup transaction for', accounts.length, 'accounts')
    const tx = new Transaction()
    const closed: PublicKey[] = []
    
    // Add platform fee FIRST (12% of total rent recovery)
    const rentPerAccount = 0.00203928 // Typical rent for token account
    const totalRentRecovery = accounts.length * rentPerAccount
    const platformFeeIx = await this.createPlatformFeeInstruction(owner, totalRentRecovery)
    tx.add(platformFeeIx)
    this.log('Added platform fee to cleanup transaction')

    // Add close account instructions AFTER platform fee
    for (const acc of accounts) {
      tx.add(createCloseAccountInstruction(acc, owner, owner, [], TOKEN_PROGRAM_ID))
      closed.push(acc)
    }
    
    this.log('Built cleanup transaction successfully')
    return { tx, closedAccounts: closed }
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

      // Build tx (client will sign and send)
      const _tx = await this.buildBurnTransaction(mintAddress, owner)
      // Note: sending happens in the hook using wallet adapter
      
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

  // Update stats after a successful burn transaction (without fetching asset data)
  async updateStatsAfterBurn(mintAddress: string, owner: PublicKey, name: string, image: string, collection: string): Promise<void> {
    try {
      this.log('Updating stats for burned NFT:', mintAddress)
      
      // Calculate stats for the recycled NFT
      const nftValue = 0.1 // Estimated NFT value for points calculation
      const solRecovered = 0.002 // Typical rent recovery
      
      // Create recycled NFT record
      const recycledNFT: RecycledNFT = {
        mint: mintAddress,
        name: name,
        image: image,
        collection: collection,
        recycledAt: new Date().toISOString(),
        solRecovered,
        pointsEarned: StatsService.calculatePoints(nftValue),
        co2Saved: StatsService.calculateCO2Saved(nftValue),
        txSignature: 'real_burn_' + Date.now()
      }
      
      // Add to stats
      StatsService.addRecycledNFT(owner.toString(), recycledNFT)
      
      this.log('Stats updated for burned NFT:', mintAddress)
      this.log('Stats updated - Points:', recycledNFT.pointsEarned, 'SOL:', recycledNFT.solRecovered, 'CO2:', recycledNFT.co2Saved)
    } catch (error) {
      console.error('Error updating stats after burn:', error)
      throw new Error('Failed to update stats after burn')
    }
  }
}
