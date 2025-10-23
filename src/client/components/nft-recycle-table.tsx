import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown, Loader2 } from "lucide-react"
import { useNFTs } from "@/hooks/use-nfts"
import { useRecycling } from "@/hooks/use-recycling"
import { useWalletInfo } from "@/hooks/use-wallet-info"
import { useEffect, useMemo, useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { getAssociatedTokenAddress } from "@solana/spl-token"

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

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by Collection or Contract"
            className="pl-12 h-10 bg-gradient-to-r from-[#0f0f0f] to-[#1a1a1a] border border-[#292929] text-white placeholder:text-gray-400 rounded-xl shadow-lg focus:border-[#00ff00] focus:ring-2 focus:ring-[#00ff00]/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Digital Recycler</h2>
        <p className="text-gray-400">Recycle your unused NFTs and recover SOL rent</p>
      </div>

      {filteredCollections.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-2xl p-12 shadow-2xl shadow-black/50 border border-[#292929]">
            <h3 className="text-2xl font-bold text-gray-300 mb-4">No Collections Found</h3>
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Try adjusting your search terms' : 'You don\'t have any NFT collections yet'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-2xl pb-6 pl-6 pr-6 pt-3 shadow-2xl shadow-black/50 border border-[#292929] backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#292929]">
                <th className="text-left py-4 px-6 text-white font-semibold text-base">Collection</th>
                <th className="text-left py-4 px-6 text-white font-semibold text-base">Network</th>
                <th className="text-left py-4 px-6 text-white font-semibold text-base">Owned NFTs</th>
                <th className="text-left py-4 px-6 text-white font-semibold text-base">SOL to recover</th>
                <th className="text-center py-4 px-6 text-white font-semibold text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCollections.map((collection) => (
                  <tr key={collection.mint} className="border-b border-[#292929] last:border-b-0 hover:bg-gradient-to-r hover:from-[#00ff00]/5 hover:to-transparent transition-all duration-300 group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
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
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="w-4 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded" />
                          <div className="w-4 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded" />
                          <div className="w-4 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded" />
                        </div>
                        <span className="text-white font-medium">Solana</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-lg">{collection.count}</span>
                        <span className="text-gray-400 text-sm">NFTs</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
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
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#00ff00] text-white hover:bg-[#00dd00] border-[#292929] px-4 py-2 font-bold rounded-lg transition-all duration-300"
                          onClick={() => handleViewCollection(collection.collection?.address || collection.mint)}
                        >
                          View Collection
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#00ff00] text-white hover:bg-[#00dd00] border-[#292929] px-4 py-2 font-bold rounded-lg transition-all duration-300"
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
  )
}
