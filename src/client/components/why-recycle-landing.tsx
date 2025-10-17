import { Button } from "@/components/ui/button"
import { Clock, Gift, Globe } from "lucide-react"
import Image from "next/image"

export function WhyRecycleLanding() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative h-[200px] rounded-lg overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00ff00] to-[#00aa00] opacity-20" />
        <Image src="/digital-tech-circuit-pattern-green.jpg" alt="Digital recycling hero" fill className="object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white text-center">
            Welcome to the World&apos;s First Digital Recycler
          </h1>
        </div>
        {/* Carousel dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-white" />
          <div className="w-2 h-2 rounded-full bg-white/50" />
          <div className="w-2 h-2 rounded-full bg-white/50" />
        </div>
      </div>

      {/* Recycle Your NFTs Section */}
      <div className="text-center space-y-8">
        <div>
          <h2 className="text-4xl font-bold text-[#00ff00] mb-2">Recycle your NFTs</h2>
          <p className="text-xl text-gray-400">When digital trash comes to life.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left side - Logo and slogan */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-12 h-12 bg-[#00ff00] rounded" />
                <div className="w-12 h-12 bg-[#00ff00] rounded" />
                <div className="w-12 h-12 bg-[#00ff00] rounded" />
                <div className="w-12 h-12 bg-transparent rounded" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">NO DEGEN</div>
              <div className="text-3xl font-bold text-[#00ff00]">YES PURPOSE</div>
              <div className="text-xl text-white mt-2">RecycleMinds</div>
            </div>
          </div>

          {/* Right side - Description */}
          <div className="text-left space-y-4">
            <p className="text-[#00ff00] text-lg font-semibold">
              We believe that every NFT should have a reason to exist. NFT without purpose is digital trash.
            </p>
            <p className="text-gray-300">
              At <span className="text-white font-semibold">RecycleMinds</span>, we create a{" "}
              <span className="text-white">Non-Degen</span> culture, which wins life with the advancement of digital
              recycling. A platform where trash is transformed into value, and you participate in a conscious digital
              movement, transparent and with a positive impact.
            </p>
          </div>
        </div>
      </div>

      {/* Environmental Impact Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        {/* Left side - Text */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-[#00ff00]">Millions of NFTs are created without real utility.</h3>
          <p className="text-gray-300">
            This occupation of space in blockchains generates unnecessary transactions, each one consuming energy and
            emitting CO₂, even in low-impact networks.
          </p>
          <p className="text-[#00ff00] text-lg font-semibold">
            Result: accumulated digital trash + growing environmental damage.
          </p>
        </div>

        {/* Right side - Image */}
        <div className="relative h-[300px] rounded-lg overflow-hidden">
          <Image src="/digital-trash-pile-colorful-nft-waste.jpg" alt="Digital trash pile" fill className="object-cover" />
        </div>
      </div>

      {/* On-chain Recycling Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#00ff00] mb-4">On-chain Recycling</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Each recycled NFT generates points, which can be exchanged for $HEAD tokens, exclusive badges, or special
            products.
          </p>
        </div>

        <div className="relative h-[400px] rounded-lg overflow-hidden max-w-5xl mx-auto">
          <Image src="/futuristic-recycling-machine-with-green-recycle-sy.jpg" alt="Futuristic recycling machine" fill className="object-cover" />
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Measurable Impact */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#00ff00] flex items-center justify-center">
              <Clock className="w-8 h-8 text-[#00ff00]" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#00ff00]">Measurable Impact</h3>
          <p className="text-gray-300 text-sm">
            On our platform, you track the reduction of digital trash and carbon emissions in a clear and transparent
            way.
          </p>
        </div>

        {/* Benefits for Users */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#00ff00] flex items-center justify-center">
              <Gift className="w-8 h-8 text-[#00ff00]" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#00ff00]">Benefits for Users</h3>
          <p className="text-gray-300 text-sm">
            Accumulate points, exchange for $HEAD tokens, participate in exclusive launches, and be part of a conscious
            non-degen community.
          </p>
        </div>

        {/* Benefits for the World */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#00ff00] flex items-center justify-center">
              <Globe className="w-8 h-8 text-[#00ff00]" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#00ff00]">Benefits for the World</h3>
          <p className="text-gray-300 text-sm">
            Each destroyed NFT is a transference of value. Less trash in the digital space, more space for innovation.
          </p>
        </div>
      </div>

      {/* Multichain Section */}
      <div className="text-center space-y-6">
        <p className="text-xl text-gray-300">
          <span className="text-[#00ff00] font-semibold">Natively Multichain</span> - It operates on Polygon, Ethereum,
          Solana and Base. New integrations are on the way.
        </p>
        <div className="flex justify-center items-center gap-8 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded" />
            <span className="text-white font-semibold">polygon</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-400 rounded-full" />
            <span className="text-white font-semibold">ethereum</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-400 rounded" />
            <span className="text-white font-semibold">SOLANA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded" />
            <span className="text-white font-semibold">base</span>
          </div>
        </div>
      </div>

      {/* Solana Rescue Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#00ff00] mb-4">Here you also rescue Solana</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our platform is located at SOL locked in previous transactions and returns it instantly to your wallet,
            without complications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
          {/* Left side - Image */}
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image src="/hand-holding-solana-coins-tokens-cryptocurrency.jpg" alt="Hand holding Solana tokens" fill className="object-cover" />
          </div>

          {/* Right side - Claim Box */}
          <div className="bg-[#00ff00] text-black p-8 rounded-lg space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">SOL</span>
              </div>
              <span className="text-2xl font-bold">SOLANA</span>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">
                Release the SOL that was stuck in your transactions with tokens and NFTs. Connect your wallet, confirm
                and rescue in a simple way:
              </h3>
              <ol className="space-y-2 text-sm">
                <li>1 - Connect your wallet</li>
                <li>2 - Confirm how much you can rescue</li>
                <li>3 - Rescue with one click</li>
              </ol>
            </div>

            <Button className="w-full bg-black text-[#00ff00] hover:bg-gray-900 text-lg py-6">Claim SOL</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
