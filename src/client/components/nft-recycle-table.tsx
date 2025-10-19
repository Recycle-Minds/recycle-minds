import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown, Loader2 } from "lucide-react"
import { useNFTs } from "@/hooks/use-nfts"
import { useRecycling } from "@/hooks/use-recycling"
import { useWalletInfo } from "@/hooks/use-wallet-info"
import { useState } from "react"

interface NFTRecycleTableProps {
  onViewCollection?: (collectionAddress: string) => void
}

export function NFTRecycleTable({ onViewCollection }: NFTRecycleTableProps) {
  const { collections, loading, error } = useNFTs()
  const { burnCollection, isBurning } = useRecycling()
  const { isConnected } = useWalletInfo()
  const [searchTerm, setSearchTerm] = useState("")
  const [burningCollections, setBurningCollections] = useState<string[]>([])

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <h2 className="text-2xl font-bold text-[#00ff00] mb-4">Connect Your Wallet</h2>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by Collection or Contract"
            className="pl-10 bg-[#1a1a1a] border-gray-800/30 text-white placeholder:text-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black min-w-[150px] justify-between bg-transparent"
        >
          Solana
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#00ff00] mb-2">MY NFTS TO RECYCLE</h2>
        <p className="text-sm text-gray-400">Recycle your unused NFTs and recover SOL rent</p>
      </div>

      {filteredCollections.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Collections Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'You don\'t have any NFT collections yet'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4 text-[#00ff00] font-medium">Collection</th>
                <th className="text-left py-4 px-4 text-[#00ff00] font-medium">Network</th>
                <th className="text-left py-4 px-4 text-[#00ff00] font-medium">Owned NFTs</th>
                <th className="text-right py-4 px-4 text-[#00ff00] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.map((collection) => (
                <tr key={collection.mint} className="border-b border-gray-800 hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                        {collection.image ? (
                          <img src={collection.image} alt={collection.name} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-600">NFT</span>
                        )}
                      </div>
                      <span className="font-medium">{collection.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl text-purple-400">≡</span>
                      <span>Solana</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium">{collection.count}</td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black bg-transparent"
                        onClick={() => handleViewCollection(collection.collection?.address || collection.mint)}
                      >
                        View Collection
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black bg-transparent"
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
      )}
    </div>
  )
}
