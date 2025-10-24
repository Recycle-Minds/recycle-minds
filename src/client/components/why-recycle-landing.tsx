import { Button } from "@/components/ui/button"
import { Clock, Gift, Globe } from "lucide-react"
import Image from "next/image"

export function WhyRecycleLanding() {
  return (
    <div className="space-y-16">

      {/* Recycle Your NFTs Section */}
      <div className="text-center space-y-8">
        <div className="my-20">
          <h2 className="text-5xl font-medium text-[#00ff00] mb-2">Recycle your NFTs</h2>
          <p className="text-3xl text-[#fff]">Turning digital waste into new value.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[53%_auto] gap-12 items-center w-full mb-20">
          {/* Left side - Logo and slogan */}
          <div className="flex flex-col items-center space-y-4 relative rounded-lg overflow-hidden">
            <Image
              src="/img_no_degen_yes_purpose.jpg"
              alt="Digital trash pile"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>

          {/* Right side - Description */}
          <div className="text-left space-y-4">
            <p className="text-[#00ff00] text-3xl font-medium">
              We believe every NFT should have a reason to exist. An NFT without purpose is nothing but digital waste.
            </p>
            <p className="text-gray-300 break-words text-[20px]">
              At Recycle Minds, we are building a Non Degen culture that comes to life with the launch of the Digital Recycler, a platform where your NFTs gain new utility, are redefined in meaning and become part of a solid, transparent and purpose driven ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* Environmental Impact Section */}

        <div className="grid grid-cols-1 md:grid-cols-[45%_auto] gap-12 items-center w-full">
          {/* Left side - Text */}
          <div className="space-y-4">
            <p className="text-[#00ff00] text-3xl font-medium">Millions of NFTs are created without real utility.</p>
            <p className="text-gray-300 break-words my-10 text-[20px]">
             They take up space in wallets and generate unnecessary transactions, each consuming energy and emitting CO₂ even on low impact networks.
            </p>
            <p className="text-lg font-medium text-[20px]">
              <span className="text-[#00ff00]">The result:</span> accumulated digital waste and increasing environmental damage.
            </p>
          </div>

          {/* Right side - Image */}
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image src="/img_junk_nft.jpg" alt="Digital trash pile" fill className="object-cover" />
          </div>
        </div>

        {/* On-chain Recycling Section */}
        <div className="mb-6">
          <div className="text-center my-20">
            <h2 className="text-5xl font-medium text-[#00ff00] mb-2">On-chain Recycling</h2>
            <p className="max-w-5xl mx-auto text-3xl text-[#fff]">
              Each recycled NFT earns points, which can be exchanged for $HEAD tokens, exclusive badges, or special products.
            </p>
          </div>

          <div className="relative w-full rounded-lg overflow-hidden mx-auto">
            <Image
              src="/img_recycler.jpg"
              alt="Futuristic recycling machine"
              width={1632}
              height={642}
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        </div>

        {/* Benefits Section */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-card text-card-foreground gap-6 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-0 p-6 shadow-2xl shadow-black/50 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-center items-center h-full">
              <div className="flex justify-center items-center rounded-lg overflow-hidden bg-gray-200n">
                <Image src="/icon_measurable_impact.png" alt="Hand holding Solana tokens" width={120} height={120} className="object-contain" />
              </div>
              <p className="text-[#00ff00] text-3xl font-medium text-center">
                Measurable Impact
              </p>
              <p className="text-gray-300 break-words text-center">
                On our platform, you can track the reduction of digital waste and carbon emissions in a clear and transparent way.
              </p>
          </div>
          <div className="bg-card text-card-foreground gap-6 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-0 p-6 shadow-2xl shadow-black/50 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-center items-center h-full">
              <div className="flex justify-center items-center rounded-lg overflow-hidden bg-gray-200n">
                <Image src="/icon_user_benefits.png" alt="Hand holding Solana tokens" width={120} height={120} className="object-contain" />
              </div>
              <p className="text-[#00ff00] text-3xl font-medium text-center">
                Benefits for Users
            </p>
            <p className="text-gray-300 break-words text-center">
              Earn points, exchange them for $HEAD tokens, unlock SOL tokens, and join a conscious Non Degen community.
            </p>
          </div>
          <div className="bg-card text-card-foreground gap-6 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-0 p-6 shadow-2xl shadow-black/50 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-center items-center h-full">
              <div className="flex justify-center items-center rounded-lg overflow-hidden bg-gray-200n">
                <Image src="/icon_benefits_for_the_world.png" alt="Hand holding Solana tokens" width={120} height={120} className="object-contain" />
              </div>
              <p className="text-[#00ff00] text-3xl font-medium text-center">
                Benefits for the World
            </p>
            <p className="text-gray-300 break-words text-center">
              Each NFT destroyed prevents an unnecessary transfer. Less CO₂, less digital waste, and more room for innovation.
            </p>
          </div>
        </div>

        {/* Multichain Section */}
        <div className="text-center space-y-6 mt-30">
          <h2 className="text-[#00ff00] font-semibold text-[26px]  mb-2">Currently on Solana, Soon Multichain</h2>
          <p className="text-[20px] text-gray-300">
            We will soon bring our platform to Ethereum, Polygon, and Base, extending sustainability across multiple networks.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 items-center justify-items-center w-full">
            {["solana", "ethereum", "polygon", "base"].map((name) => (
              <div key={name} className="w-full flex justify-center items-center">
                <Image
                  src={`/logo_${name}.png`}
                  alt={`${name} logo`}
                  width={120}
                  height={120}
                  className="object-contain w-3/5 h-auto max-h-14"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Solana Rescue Section */}
        <div className="space-y-6">
          <div className="text-center my-25">
            <h2 className="text-5xl font-medium text-[#00f292] mb-4">Here, you also unlock Solana</h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Our platform finds SOL locked in previous NFT transactions and instantly returns it to your wallet, hassle free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 w-full mx-auto items-stretch">
            {/* Left side - Image */}
            <div className="relative h-[590px] overflow-hidden">
              <Image src="/img_solana_hands.png" alt="Hand holding Solana tokens" fill className="object-cover" />
            </div>

            {/* Right side - Claim Box */}
            <div className="bg-[#01f092] text-black p-8 space-y-6 flex flex-col justify-center items-center">
              <div>
                <h3 className="text-[30px] font-medium mb-4 text-[#105116]">
                  Unlock the SOL stuck in your NFT transactions. Connect your wallet and reclaim it quickly and securely.
                </h3>
                 <h3 className="text-[30px] font-medium mb-4] text-[#1f1f1f]">
                  The NFTs you recycle on our platform release even more SOL for you to reclaim.
                </h3>
              </div>

              <Button className="w-[80%] h-[80px] bg-[#152b26] text-white hover:bg-gray-900 text-[30px] rounded-lg mt-20">
                  Unlock SOL
              </Button>
            </div>
          </div>
        </div>
      </div>
       
  )
}
