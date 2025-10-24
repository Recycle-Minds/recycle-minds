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
import { getAsset } from '@/lib/das-api'

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
          // Resolve authoritative interface via DAS to avoid misclassification
          let iface = nft.interface
          try {
            const das = await getAsset(connection.rpcEndpoint, nft.mint)
            if (das?.interface) iface = das.interface as any
          } catch {}
          
          let signature: string | null = null
          if (iface === 'MplCoreAsset') {
            if (!wallet) throw new Error('Wallet adapter not ready')
            // Get secure RPC endpoint from server
            const endpointResponse = await fetch('/api/rpc-endpoint')
            if (!endpointResponse.ok) {
              throw new Error('Failed to get RPC endpoint')
            }
            const { endpoint } = await endpointResponse.json()
            
            // Use UMI with secure server-provided endpoint
            const umi = createUmi(endpoint)
              .use(walletAdapterIdentity((wallet as any)?.adapter))
              .use(mplCore())
            
            console.log('Sending Core burn via UMI for:', nft.mint)
            console.log('NFT collection info:', nft.collection)
            
            // Build burn parameters with collection if available
            const burnParams: any = { asset: umiPublicKey(nft.mint) }
            
            // Add collection if the NFT has one
            if (nft.collection?.address) {
              burnParams.collection = umiPublicKey(nft.collection.address)
              console.log('Using collection for burn:', nft.collection.address)
            }
            
            const res = await burnV1(umi, burnParams).sendAndConfirm(umi)
            signature = res.signature.toString()
            console.log('Core burn sent, signature:', signature)
          } else {
            // Handle undefined interface by trying different NFT types
            let tx
            const interfaces = iface ? [iface] : ['ProgrammableNFT', 'V1_NFT']
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
          const ok = await verifier.verifyBurnSuccess(nft.mint, publicKey, iface)
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
    const loadingToast = toast.loading('Burning NFT...', { id: `burn-${mintAddress}` })

    try {
      // Build and send real transaction on mainnet
      const service = new NFTService(connection)
      // Resolve interface via DAS before building
      let iface: string = 'V1_NFT'
      try {
        const das = await getAsset(connection.rpcEndpoint, mintAddress)
        if (das?.interface) iface = das.interface as any
      } catch {}

      let signature: string | null = null
      if (iface === 'MplCoreAsset') {
        if (!wallet) throw new Error('Wallet adapter not ready')
        const umi = createUmi(connection.rpcEndpoint)
          .use(walletAdapterIdentity((wallet as any)?.adapter))
          .use(mplCore())
        console.log('Sending Core burn via UMI for:', mintAddress)
        const res = await burnV1(umi, { asset: umiPublicKey(mintAddress) }).sendAndConfirm(umi)
        signature = res.signature
        console.log('Core burn sent, signature:', signature)
      } else {
        // Try pNFT first, then V1_NFT
        let tx
        const interfaces = ['ProgrammableNFT', 'V1_NFT']
        for (const t of interfaces) {
          try {
            tx = await service.buildBurnTransactionAuto({
              mint: mintAddress,
              owner: publicKey.toString(),
              name: 'Unknown NFT',
              symbol: '',
              image: '/placeholder.jpg',
              interface: t,
              burnt: false
            } as any, publicKey)
            break
          } catch (err) {
            if (t === interfaces[interfaces.length - 1]) throw err
          }
        }
        if (!tx) throw new Error('Failed to build transaction')
        tx.feePayer = publicKey
        // Get latest blockhash from server-side API
      const blockhashResponse = await fetch('/api/latest-blockhash')
      if (!blockhashResponse.ok) {
        throw new Error(`Failed to get latest blockhash: ${blockhashResponse.status}`)
      }
      const { blockhash } = await blockhashResponse.json()
      tx.recentBlockhash = blockhash
        const sig = await sendTransaction(tx, connection)
        console.log('Burn tx sent:', sig)
        signature = sig
      }

      // Verify then update stats
      const ok = await service.verifyBurnSuccess(mintAddress, publicKey, iface)
      if (!ok) throw new Error('On-chain verification failed: asset still present or not burned')
      await service.updateStatsAfterBurn(mintAddress, publicKey, 'Unknown NFT', '/placeholder.jpg', 'Unknown Collection')
      setBurnedNFTs(prev => [...prev, mintAddress])
      
      toast.success('NFT burned successfully!', { id: `burn-${mintAddress}` })
      return true
    } catch (err) {
      console.error(`Failed to burn NFT ${mintAddress}:`, err)
      toast.error(`Failed to burn NFT: ${err instanceof Error ? err.message : 'Unknown error'}`, { 
        id: `burn-${mintAddress}`,
        duration: 5000
      })
      return false
    } finally {
      setBurning(prev => prev.filter(mint => mint !== mintAddress))
    }
  }

  const cleanupClaim = async (limit: number = 10) => {
    if (!isConnected) throw new Error('Wallet not connected')
    if (!publicKey) throw new Error('No wallet')
    
    const loadingToast = toast.loading('Closing empty accounts...', { id: 'cleanup-claim' })
    
    try {
      const service = new NFTService(connection)
      const { tx, closedAccounts } = await service.buildCleanupTransaction(publicKey, limit)
      if (closedAccounts.length === 0) {
        toast.dismiss('cleanup-claim')
        toast.info('No empty accounts found to close')
        return { signature: null, closed: 0 }
      }
      
      tx.feePayer = publicKey
      // Get latest blockhash from server-side API
      const blockhashResponse = await fetch('/api/latest-blockhash')
      if (!blockhashResponse.ok) {
        throw new Error(`Failed to get latest blockhash: ${blockhashResponse.status}`)
      }
      const { blockhash } = await blockhashResponse.json()
      tx.recentBlockhash = blockhash
      const signature = await sendTransaction(tx, connection)
      
      toast.success(`Successfully closed ${closedAccounts.length} empty account(s)!`, { id: 'cleanup-claim' })
      return { signature, closed: closedAccounts.length }
    } catch (err) {
      console.error('Failed to close empty accounts:', err)
      toast.error(`Failed to close accounts: ${err instanceof Error ? err.message : 'Unknown error'}`, { 
        id: 'cleanup-claim',
        duration: 5000
      })
      throw err
    }
  }

  const cleanupClaimSelected = async (accountAddresses: string[]) => {
    if (!isConnected) throw new Error('Wallet not connected')
    if (!publicKey) throw new Error('No wallet')
    
    const loadingToast = toast.loading(`Closing ${accountAddresses.length} selected account(s)...`, { id: 'cleanup-selected' })
    
    try {
      const service = new NFTService(connection)
      const pubkeys = accountAddresses.map((a) => new PublicKey(a))
      const { tx, closedAccounts } = await service.buildCleanupTransactionForAccounts(publicKey, pubkeys)
      if (closedAccounts.length === 0) {
        toast.dismiss('cleanup-selected')
        toast.info('No accounts to close')
        return { signature: null, closed: 0 }
      }
      
      tx.feePayer = publicKey
      // Get latest blockhash from server-side API
      const blockhashResponse = await fetch('/api/latest-blockhash')
      if (!blockhashResponse.ok) {
        throw new Error(`Failed to get latest blockhash: ${blockhashResponse.status}`)
      }
      const { blockhash } = await blockhashResponse.json()
      tx.recentBlockhash = blockhash
      const signature = await sendTransaction(tx, connection)
      
      toast.success(`Successfully closed ${closedAccounts.length} selected account(s)!`, { id: 'cleanup-selected' })
      return { signature, closed: closedAccounts.length }
    } catch (err) {
      console.error('Failed to close selected accounts:', err)
      toast.error(`Failed to close selected accounts: ${err instanceof Error ? err.message : 'Unknown error'}`, { 
        id: 'cleanup-selected',
        duration: 5000
      })
      throw err
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
    burnedNFTs,
    cleanupClaim,
    cleanupClaimSelected
  }
}
