"use client"

import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useState, useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import { NFTService } from '@/lib/nft-service'

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

export interface NFTItem {
  name: string
  image: string
  mint: string
  interface: string
  collection?: {
    name: string
    address: string
  }
  burnt?: boolean
}

export function useNFTs() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [nfts, setNfts] = useState<NFTItem[]>([])
  const [collections, setCollections] = useState<NFTCollection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNFTs = async () => {
    if (!publicKey || !connection) return

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching NFTs for wallet:', publicKey.toString())
      
      const nftService = new NFTService(connection)
      const nftAccounts = await nftService.getNFTsByOwner(publicKey)
      const collectionAccounts = await nftService.getCollectionsByOwner(publicKey)

      // Convert to our interface format
      const nftItems: NFTItem[] = nftAccounts.map(nft => ({
        name: nft.name,
        image: nft.image,
        mint: nft.mint,
        collection: nft.collection ? {
          name: nft.collection.name,
          address: nft.collection.address
        } : undefined
      }))

      console.log('Fetched collections:', collectionAccounts)
      console.log('Fetched NFTs:', nftItems)

      setNfts(nftItems)
      setCollections(collectionAccounts)
    } catch (err) {
      console.error('Error fetching NFTs:', err)
      setError('Failed to fetch NFTs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (connected && publicKey) {
      fetchNFTs()
    } else {
      setNfts([])
      setCollections([])
    }
  }, [connected, publicKey])

  const getNFTsByCollection = (collectionAddress: string) => {
    return nfts.filter(nft => nft.collection?.address === collectionAddress)
  }

  const burnNFT = async (mintAddress: string) => {
    if (!publicKey || !connection) throw new Error('Wallet not connected')

    try {
      console.log('Burning NFT:', mintAddress)
      const nftService = new NFTService(connection)
      const result = await nftService.burnNFT(mintAddress, publicKey)
      return result
    } catch (err) {
      console.error('Error burning NFT:', err)
      throw new Error('Failed to burn NFT')
    }
  }

  return {
    nfts,
    collections,
    loading,
    error,
    fetchNFTs,
    getNFTsByCollection,
    burnNFT
  }
}
