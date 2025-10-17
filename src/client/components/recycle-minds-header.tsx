import { Button } from "@/components/ui/button"
import { Globe, Wallet } from "lucide-react"

export function RecycleMindsHeader() {
  return (
    <header className="border-b border-gray-800 bg-[#0a0a0a]">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center">
            <svg viewBox="0 0 40 40" className="h-full w-full">
              <rect x="15" y="5" width="10" height="10" fill="#00ff00" rx="2" />
              <rect x="5" y="15" width="10" height="10" fill="#00ff00" rx="2" />
              <rect x="25" y="15" width="10" height="10" fill="#00ff00" rx="2" />
              <rect x="15" y="25" width="10" height="10" fill="#00ff00" rx="2" />
            </svg>
          </div>
          <span className="text-xl font-bold">RecycleMinds</span>
        </div>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="#" className="hover:text-[#00ff00] transition-colors">
            Home
          </a>
          <a href="#" className="hover:text-[#00ff00] transition-colors">
            $HEAD
          </a>
          <a href="#" className="hover:text-[#00ff00] transition-colors">
            Coleções NFT
          </a>
          <a href="#" className="text-[#00ff00] hover:text-[#00ff00] transition-colors">
            Recicladora
          </a>
          <a href="#" className="hover:text-[#00ff00] transition-colors">
            DeFi
          </a>
          <a href="#" className="hover:text-[#00ff00] transition-colors">
            Loja
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button className="bg-[#00ff00] text-black hover:bg-[#00dd00] font-medium">
            <Wallet className="mr-2 h-4 w-4" />
            Connector Carteira
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full border border-gray-700">
            <Globe className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
