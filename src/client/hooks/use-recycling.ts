"use client"

import { useState } from 'react'
import { useNFTs } from './use-nfts'
import { useWalletInfo } from './use-wallet-info'

export function useRecycling() {
  const { burnNFT, getNFTsByCollection } = useNFTs()
  const { isConnected } = useWalletInfo()
  const [burning, setBurning] = useState<string[]>([])
  const [burnedNFTs, setBurnedNFTs] = useState<string[]>([])

  const burnCollection = async (collectionAddress: string) => {
    if (!isConnected) throw new Error('Wallet not connected')

    const nfts = getNFTsByCollection(collectionAddress)
    const burningMints: string[] = []
    const burnedMints: string[] = []

    setBurning(nfts.map(nft => nft.mint))

    try {
      for (const nft of nfts) {
        try {
          burningMints.push(nft.mint)
          setBurning(burningMints)
          
          await burnNFT(nft.mint)
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

    setBurning([mintAddress])

    try {
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

  const isBurning = (mintAddress: string) => burning.includes(mintAddress)
  const isBurned = (mintAddress: string) => burnedNFTs.includes(mintAddress)

  return {
    burnCollection,
    burnSingle,
    isBurning,
    isBurned,
    burning,
    burnedNFTs
  }
}
