"use client"

import { useState } from 'react'
import { useNFTs } from './use-nfts'
import { useWalletInfo } from './use-wallet-info'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { NFTService } from '@/lib/nft-service'
import { PublicKey } from '@solana/web3.js'

export function useRecycling() {
  const { burnNFT, getNFTsByCollection } = useNFTs()
  const { isConnected } = useWalletInfo()
  const { publicKey, sendTransaction } = useWallet()
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

    try {
      for (const nft of nfts) {
        try {
          burningMints.push(nft.mint)
          setBurning(burningMints)
          
          // Build and send the actual burn transaction
          const service = new NFTService(connection)
          
          // Handle undefined interface by trying different NFT types
          let tx
          const interfaces = nft.interface ? [nft.interface] : ['V1_NFT', 'ProgrammableNFT']
          
          for (const interfaceType of interfaces) {
            try {
              const nftWithInterface = {
                ...nft,
                interface: interfaceType
              }
              
              tx = await service.buildBurnTransactionAuto(nftWithInterface as any, publicKey)
              break // Success, exit the loop
            } catch (err) {
              console.log(`Failed to build transaction for ${nft.mint} with interface ${interfaceType}:`, err)
              if (interfaceType === interfaces[interfaces.length - 1]) {
                throw err // Re-throw if this was the last attempt
              }
            }
          }
          
          if (!tx) throw new Error('Failed to build transaction for any interface type')
          
          tx.feePayer = publicKey
          const signature = await sendTransaction(tx, connection)
          await connection.confirmTransaction(signature, 'confirmed')

          // Update stats after successful burn
          const statsService = new NFTService(connection)
          await statsService.burnNFT(nft.mint, publicKey)

          burnedMints.push(nft.mint)
          setBurnedNFTs(prev => [...prev, nft.mint])
        } catch (err) {
          console.error(`Failed to burn NFT ${nft.mint}:`, err)
        }
      }
    } finally {
      setBurning([])
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

      // Update stats via existing service method (records local history)
      await burnNFT(mintAddress)
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
