import { Card } from "@/components/ui/card"
import { Layers, Battery } from "lucide-react"

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card className="bg-[#1a1a1a] border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center">
            <svg viewBox="0 0 40 40" className="h-full w-full">
              <rect x="15" y="5" width="10" height="10" fill="#00ff00" rx="2" />
              <rect x="5" y="15" width="10" height="10" fill="#00ff00" rx="2" />
              <rect x="25" y="15" width="10" height="10" fill="#00ff00" rx="2" />
              <rect x="15" y="25" width="10" height="10" fill="#00ff00" rx="2" />
            </svg>
          </div>
          <span className="text-gray-400 text-sm">Earned Points</span>
        </div>
        <div className="text-3xl font-bold">550</div>
      </Card>

      <Card className="bg-[#1a1a1a] border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Battery className="h-10 w-10 text-[#00ff00]" />
          <span className="text-gray-400 text-sm">My Recycled NFTs</span>
        </div>
        <div className="text-3xl font-bold">75</div>
      </Card>

      <Card className="bg-[#1a1a1a] border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-[#00ff00] font-bold text-lg">+CO₂</div>
          <span className="text-gray-400 text-sm">Global CO₂ Saved</span>
        </div>
        <div className="text-2xl font-bold">1,000,000,000,000 t</div>
      </Card>

      <Card className="bg-gradient-to-br from-teal-900 to-teal-950 border-teal-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="h-10 w-10 text-teal-400" />
          <span className="text-gray-300 text-sm">SOL to Claim</span>
        </div>
        <div className="text-3xl font-bold">508708707</div>
      </Card>
    </div>
  )
}
