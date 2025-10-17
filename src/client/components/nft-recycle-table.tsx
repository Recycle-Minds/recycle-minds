import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown } from "lucide-react"

export function NFTRecycleTable() {
  const collections = [
    { name: "Collection Name", network: "Solana", icon: "≡", color: "text-purple-400", count: 50 },
    { name: "Collection Name", network: "Polygon", icon: "◇", color: "text-purple-500", count: 2 },
    { name: "Collection Name", network: "Ethereum", icon: "◆", color: "text-gray-400", count: 12 },
    { name: "Collection Name", network: "Base", icon: "●", color: "text-blue-400", count: 6 },
  ]

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by Collection or Contract"
            className="pl-10 bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
        <Button
          variant="outline"
          className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black min-w-[150px] justify-between bg-transparent"
        >
          Chains
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#00ff00] mb-2">MY NFTS TO RECYCLE</h2>
        <p className="text-sm text-gray-400">(switch network to view Solana/EVM NFTs)</p>
      </div>

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
            {collections.map((collection, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-[#1a1a1a] transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white" />
                    <span>{collection.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xl ${collection.color}`}>{collection.icon}</span>
                    <span>{collection.network}</span>
                  </div>
                </td>
                <td className="py-4 px-4">{collection.count}</td>
                <td className="py-4 px-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black bg-transparent"
                    >
                      View Collection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black bg-transparent"
                    >
                      Recycle All
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
