"use client"

import { useState } from 'react'
import { useNFTs } from './use-nfts'
import { useWalletInfo } from './use-wallet-info'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { NFTService } from '@/lib/nft-service'
import { PublicKey } from '@solana/web3.js'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey as umiPublicKey } from '@metaplex-foundation/umi'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'
import { burnV1, mplCore } from '@metaplex-foundation/mpl-core'
import toast from 'react-hot-toast'

export function useRecycling() {
  const { burnNFT, getNFTsByCollection } = useNFTs()
  const { isConnected } = useWalletInfo()
  const { publicKey, sendTransaction, wallet } = useWallet()
  const { connection } = useConnection()
  const [burning, setBurning] = useState<string[]>([])
  const [burnedNFTs, setBurnedNFTs] = useState<string[]>([])

  const burnCollection = async (collectionAddress: string) => {
    if (!isConnected) throw new Error('Wallet not connected')
    if (!publicKey) throw new Error('No wallet')

    const nfts = getNFTsByCollection(collectionAddress)
    const burningMints: string[] = []
    const burnedMints: string[] = []

    setBurning(nfts.map(nft => nft.mint))
    const loadingToast = toast.loading(`Starting to burn ${nfts.length} NFT(s)...`, { id: 'burning-collection' })

    try {
      for (const nft of nfts) {
        try {
          burningMints.push(nft.mint)
          setBurning(burningMints)
          
          // Build and send the actual burn transaction
          const service = new NFTService(connection)
          
          let signature: string | null = null
          if (nft.interface === 'MplCoreAsset') {
            if (!wallet) throw new Error('Wallet adapter not ready')
            // Use UMI official Core burn with proper program repository
            const umi = createUmi(connection.rpcEndpoint)
              .use(walletAdapterIdentity((wallet as any)?.adapter))
              .use(mplCore())
            console.log('Sending Core burn via UMI for:', nft.mint)
            const res = await burnV1(umi, { asset: umiPublicKey(nft.mint) }).sendAndConfirm(umi)
            signature = res.signature
            console.log('Core burn sent, signature:', signature)
          } else {
            // Handle undefined interface by trying different NFT types
            let tx
            const interfaces = nft.interface ? [nft.interface] : ['V1_NFT', 'ProgrammableNFT']
            for (const interfaceType of interfaces) {
              try {
                const nftWithInterface = { ...nft, interface: interfaceType }
                tx = await service.buildBurnTransactionAuto(nftWithInterface as any, publicKey)
                break
              } catch (err) {
                console.log(`Failed to build transaction for ${nft.mint} with interface ${interfaceType}:`, err)
                if (interfaceType === interfaces[interfaces.length - 1]) throw err
              }
            }
            if (!tx) throw new Error('Failed to build transaction for any interface type')
            tx.feePayer = publicKey
            console.log('Sending burn transaction for:', nft.mint)
            signature = await sendTransaction(tx, connection)
            console.log('Transaction sent, signature:', signature)
            await connection.confirmTransaction(signature, 'confirmed')
            console.log('Transaction confirmed for:', nft.mint)
          }
          
          // Verify on-chain that the asset is actually gone
          const verifier = new NFTService(connection)
          const ok = await verifier.verifyBurnSuccess(nft.mint, publicKey, nft.interface)
          if (!ok) {
            throw new Error('On-chain verification failed: asset still present or not burned')
          }

          // Update stats after verified burn
          await verifier.updateStatsAfterBurn(nft.mint, publicKey, nft.name, nft.image, nft.collection?.name || 'Unknown Collection')

          burnedMints.push(nft.mint)
          setBurnedNFTs(prev => [...prev, nft.mint])
        } catch (err) {
          console.error(`Failed to burn NFT ${nft.mint}:`, err)
          // Don't show individual error toasts, just log them
        }
      }
    } finally {
      setBurning([])
      toast.dismiss('burning-collection')
      
      if (burnedMints.length > 0) {
        toast.success(`Successfully burned ${burnedMints.length} NFT(s)! Check your wallet and history.`, {
          duration: 4000
        })
      } else {
        toast.error('Failed to burn any NFTs. Please try again.', {
          duration: 5000
        })
      }
    }

    return {
      burned: burnedMints,
      failed: nfts.filter(nft => !burnedMints.includes(nft.mint))
    }
  }

  const burnSingle = async (mintAddress: string) => {
    if (!isConnected) throw new Error('Wallet not connected')
    if (!publicKey) throw new Error('No wallet')

    setBurning([mintAddress])

    try {
      // Build and send real transaction on mainnet
      const service = new NFTService(connection)
      // Try pNFT/legacy auto selection by probing DAS interface from our cached list
      let tx
      try {
        // Use auto if we can map mint -> interface from current list
        const current = (await (async () => {
          // naive lookup from current nfts list
          const all = getNFTsByCollection("") // returns all when empty in our hook
          return all.find(n => n.mint === mintAddress)
        })()) as any
        if (current && current.interface) {
          tx = await service.buildBurnTransactionAuto({
            mint: mintAddress,
            owner: publicKey.toString(),
            name: current.name,
            symbol: '',
            image: current.image,
            interface: current.interface,
            burnt: false
          } as any, publicKey)
        } else {
          tx = await service.buildBurnTransaction(mintAddress, publicKey)
        }
      } catch {
        tx = await service.buildBurnTransaction(mintAddress, publicKey)
      }
      tx.feePayer = publicKey
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
      const sig = await sendTransaction(tx, connection)
      console.log('Burn tx sent:', sig)

      // Verify then update stats
      const ok = await service.verifyBurnSuccess(mintAddress, publicKey, (tx as any)?.interface || 'V1_NFT')
      if (!ok) throw new Error('On-chain verification failed: asset still present or not burned')
      await service.updateStatsAfterBurn(mintAddress, publicKey, 'Unknown NFT', '/placeholder.jpg', 'Unknown Collection')
      setBurnedNFTs(prev => [...prev, mintAddress])
      return true
    } catch (err) {
      console.error(`Failed to burn NFT ${mintAddress}:`, err)
      return false
    } finally {
      setBurning(prev => prev.filter(mint => mint !== mintAddress))
    }
  }

  const cleanupClaim = async (limit: number = 10) => {
    if (!isConnected) throw new Error('Wallet not connected')
    if (!publicKey) throw new Error('No wallet')
    const service = new NFTService(connection)
    const { tx, closedAccounts } = await service.buildCleanupTransaction(publicKey, limit)
    if (closedAccounts.length === 0) return { signature: null, closed: 0 }
    tx.feePayer = publicKey
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    const signature = await sendTransaction(tx, connection)
    return { signature, closed: closedAccounts.length }
  }

  const cleanupClaimSelected = async (accountAddresses: string[]) => {
    if (!isConnected) throw new Error('Wallet not connected')
    if (!publicKey) throw new Error('No wallet')
    const service = new NFTService(connection)
    const pubkeys = accountAddresses.map((a) => new PublicKey(a))
    const { tx, closedAccounts } = await service.buildCleanupTransactionForAccounts(publicKey, pubkeys)
    if (closedAccounts.length === 0) return { signature: null, closed: 0 }
    tx.feePayer = publicKey
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    const signature = await sendTransaction(tx, connection)
    return { signature, closed: closedAccounts.length }
  }

  const isBurning = (mintAddress: string) => burning.includes(mintAddress)
  const isBurned = (mintAddress: string) => burnedNFTs.includes(mintAddress)

  return {
    burnCollection,
    burnSingle,
    isBurning,
    isBurned,
    burning,
    burnedNFTs,
    cleanupClaim,
    cleanupClaimSelected
  }
}
