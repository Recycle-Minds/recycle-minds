import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown, Loader2, HelpCircle } from "lucide-react"
import { useNFTs } from "@/hooks/use-nfts"
import { useRecycling } from "@/hooks/use-recycling"
import { useWalletInfo } from "@/hooks/use-wallet-info"
import { useEffect, useMemo, useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

interface NFTRecycleTableProps {
  onViewCollection?: (collectionAddress: string) => void
}

export function NFTRecycleTable({ onViewCollection }: NFTRecycleTableProps) {
  const { collections, loading, error, nfts } = useNFTs() as any
  const { burnCollection, isBurning } = useRecycling()
  const { isConnected } = useWalletInfo()
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const [searchTerm, setSearchTerm] = useState("")
  const [burningCollections, setBurningCollections] = useState<string[]>([])
  const [realSolByCollection, setRealSolByCollection] = useState<Record<string, number>>({})

  // Filter out Legacy NFT collections and apply search filter
  const filteredCollections = collections.filter(collection => {
    // First check if it matches search term
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Then check if it's a Legacy-only collection
    const collectionKey = collection.collection?.address || collection.mint
    const isLegacyOnly = (() => {
      if (!nfts || nfts.length === 0) return false
      
      const collectionNFTs = nfts.filter((n: any) => {
        if (collectionKey === n.mint) return true
        return n.collection?.address === collectionKey
      })
      
      if (collectionNFTs.length === 0) return false
      
      // Check if all NFTs in collection are Legacy
      return collectionNFTs.every((nft: any) => nft.interface === 'V1_NFT')
    })()
    
    return matchesSearch && !isLegacyOnly
  })

  // Helper to get NFT type label
  const getNFTTypeLabel = (collectionKey: string) => {
    const inCol = (nfts || []).filter((n: any) => {
      if (collectionKey === n.mint) return true
      return n.collection?.address === collectionKey
    })
    
    if (inCol.length === 0) return 'Unknown'
    
    // Count each interface type
    const typeCounts: Record<string, number> = {}
    inCol.forEach((nft: any) => {
      const type = nft.interface || 'Unknown'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
    
    // Get the most common type
    const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]
    
    // Convert to friendly labels
    const typeLabels: Record<string, string> = {
      'MplCoreAsset': 'Core',
      'ProgrammableNFT': 'pNFT',
      'V1_NFT': 'Legacy',
      'MplCoreCollection': 'Core Collection'
    }
    
    return typeLabels[mostCommonType] || mostCommonType
  }

  // Compute real SOL recoverable per collection by summing lamports in token/core accounts
  useEffect(() => {
    if (!isConnected || !publicKey || !connection || !collections?.length) return

    let cancelled = false
    ;(async () => {
      const results: Record<string, number> = {}
      for (const col of collections) {
        try {
          const key: string = col.collection?.address || col.mint
          // Find NFTs in this collection
          const inCol = (nfts || []).filter((n: any) => {
            if (key === n.mint) return true
            return n.collection?.address === key
          })
          let lamportsSum = 0n
          const addressesToCheck: string[] = []
          
          for (const nft of inCol) {
            if (nft.interface === 'MplCoreAsset') {
              addressesToCheck.push(nft.mint)
            } else {
              const mintPk = new PublicKey(nft.mint)
              const ata = await getAssociatedTokenAddress(mintPk, publicKey, true)
              addressesToCheck.push(ata.toString())
            }
          }
          
          if (addressesToCheck.length > 0) {
            try {
              const response = await fetch(`/api/account-info?addresses=${addressesToCheck.join(',')}`)
              if (response.ok) {
                const data = await response.json()
                if (data.results) {
                  for (const result of data.results) {
                    if (result.accountInfo) {
                      lamportsSum += BigInt(result.accountInfo.lamports)
                    }
                  }
                }
              }
            } catch {}
          }
          const sol = Number(lamportsSum) / 1_000_000_000
          results[key] = sol
        } catch {}
      }
      if (!cancelled) setRealSolByCollection(results)
    })()

    return () => { cancelled = true }
  }, [isConnected, publicKey, connection, collections, nfts])

  const handleRecycleAll = async (collectionAddress: string) => {
    if (!isConnected) return

    setBurningCollections(prev => [...prev, collectionAddress])
    try {
      await burnCollection(collectionAddress)
    } catch (err) {
      console.error('Error recycling collection:', err)
    } finally {
      setBurningCollections(prev => prev.filter(addr => addr !== collectionAddress))
    }
  }

  const handleViewCollection = (collectionAddress: string) => {
    if (onViewCollection) {
      onViewCollection(collectionAddress)
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to view and recycle your NFT collections</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#00ff00]" />
        <p className="text-gray-400">Loading your NFT collections...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Collections</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div>
      <div className="flex flex-col md:flex-col gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by Collection or Contract"
            className="pl-12 h-10 bg-gradient-to-r from-[#0f0f0f] to-[#1a1a1a] border border-[#292929] text-white placeholder:text-gray-400 rounded-xl shadow-lg focus:border-[#00ff00] focus:ring-2 focus:ring-[#00ff00]/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex md:flex-row text-center text-[12px] justify-center items-center font-medium text-[#878787] mb-2 pl-5"><span className="text-[20px] pr-1">&#x1F6C8;</span> If your NFT isn’t listed below, it can’t be recycled. Legacy NFTs (V1_NFT) are not displayed as they cannot be burned reliably. Only Core and pNFT collections are shown here.</div>
      </div>


      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Digital Recycler</h2>
        <p className="text-[#11fe00]">Recycle your unused NFTs and recover SOL rent</p>
      </div>

      {filteredCollections.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-2xl p-12 shadow-2xl shadow-black/50 border border-[#292929]">
            <h3 className="text-2xl font-bold text-gray-300 mb-4">No Collections Found</h3>
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Try adjusting your search terms' : 'You don\'t have any burnable NFT collections yet'}
            </p>
            
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-2xl pb-6 pl-6 pr-6 pt-3 shadow-2xl shadow-black/50 border border-[#292929] backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#292929]">
                <th className="text-left py-4 px-6 text-[#00ff00] font-semibold text-base">Collection</th>
                <th className="text-left py-4 px-6 text-[#00ff00] font-semibold text-base">
                  <div className="flex items-center gap-2">
                    Type
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-[#00ff00] hover:text-[#00dd00] transition-colors cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-sm">
                        <div className="space-y-2">
                          <p className="font-semibold text-[#00ff00]">NFT Types</p>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Core:</span> New Metaplex Core NFTs (supported)</p>
                            <p><span className="font-medium">pNFT:</span> Programmable NFTs (supported)</p>
                            <p><span className="font-medium">Legacy:</span> Old V1 NFTs (not supported)</p>
                          </div>
                          <p className="text-xs text-gray-400">Legacy NFTs are not displayed as they cannot be burned reliably.</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-[#00ff00] font-semibold text-base">Network</th>
                <th className="text-left py-4 px-6 text-[#00ff00] font-semibold text-base">Owned NFTs</th>
                <th className="text-left py-4 pl-6 pr-1 text-[#00ff00] font-semibold text-base">
                  <div className="flex items-center gap-2">
                    SOL to recover
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-[#00ff00] hover:text-[#00dd00] transition-colors cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-sm">
                        <div className="space-y-2">
                          <p className="font-semibold text-[#00ff00]">SOL to Recover</p>
                          <p>This shows the SOL you can recover by burning NFTs in this collection. The SOL comes from the rent paid when creating NFT accounts on Solana.</p>
                          <p className="text-xs text-gray-400">When you burn an NFT, you get back the SOL that was locked as rent for that account. This process is irreversible.</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-center py-4 pl-1 pr-6 text-[#00ff00] font-semibold text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCollections.map((collection) => (
                  <tr key={collection.mint} className="border-b border-[#292929] last:border-b-0 hover:bg-gradient-to-r hover:from-[#00ff00]/5 hover:to-transparent transition-all duration-300 group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg">
                            {collection.image ? (
                              <img src={collection.image} alt={collection.name} className="h-8 w-8 rounded-lg object-cover" />
                            ) : (
                              <span className="text-sm text-gray-400 font-bold">NFT</span>
                            )}
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-black"></div>
                        </div>
                        <div>
                          <span className="text-white font-semibold text-base">
                            {collection.name.length > 13 ? `${collection.name.substring(0, 13)}...` : collection.name}
                          </span>
                          <div className="text-xs text-gray-400">NFT Collection</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#00ff00]/20 to-[#00dd00]/10 text-[#00ff00] border border-[#00ff00]/30">
                          {getNFTTypeLabel(collection.collection?.address || collection.mint)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-10">
                      <div className="flex items-center gap-3">
                        <Image 
                          src="/icon_dashboard_solana.png" 
                          alt="Earned Points" 
                          width={32} 
                          height={32} 
                          className="h-4 w-5"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-lg">{collection.count}</span>
                        <span className="text-gray-400 text-sm">NFTs</span>
                      </div>
                    </td>
                    <td className="py-4 pl-6 pr-1">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-lg">
                          {(() => {
                            const key: string = collection.collection?.address || collection.mint
                            const v = realSolByCollection[key]
                            return v !== undefined ? v.toFixed(6) : '—'
                          })()}
                        </span>
                        <span className="text-gray-400 text-sm">SOL</span>
                      </div>
                    </td>
                    <td className="py-4 pl-1 pr-6">
                      <div className="flex justify-center gap-3">
                        <Button
                          size="sm"
                          className="bg-[#0d330d] text-white hover:bg-[#1a4d1a] border border-[#00ff00] px-4 py-2 font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)]"
                          onClick={() => handleViewCollection(collection.collection?.address || collection.mint)}
                        >
                          View Collection
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#0d330d] text-white hover:bg-[#1a4d1a] border border-[#00ff00] px-4 py-2 font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)]"
                          onClick={() => handleRecycleAll(collection.collection?.address || collection.mint)}
                          disabled={burningCollections.includes(collection.collection?.address || collection.mint)}
                        >
                          {burningCollections.includes(collection.collection?.address || collection.mint) ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Recycling...
                            </>
                          ) : (
                            'Recycle All'
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </TooltipProvider>
  )
}
