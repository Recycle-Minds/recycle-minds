import Image from "next/image"

export function RewardsStore() {
  return (
    <div className="space-y-16">
      <div className="bg-[#1f1f1f] text-white px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Rewards Store</h2>
          <p className="text-gray-400">Keep earning points! Exciting rewards are coming soon</p>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-10xl mx-auto">
          {/* Card 1 */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-full h-100 bg-gradient-to-br from-[#0f0f0f] to-[#191919] rounded-xl shadow-2xl shadow-black/50 hover:scale-[1.02] transition-transform duration-300 p-6">
              <Image
                src="/head_coin.png"
                alt="$HEAD Token"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <h3 className="text-white text-lg font-semibold mt-4 text-center">
              $HEAD Token
            </h3>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-full h-100 bg-gradient-to-br from-[#0f0f0f] to-[#191919] rounded-xl shadow-2xl shadow-black/50 hover:scale-[1.02] transition-transform duration-300 p-6">
              <Image
                src="/recycler_ticket.png"
                alt="Raffle Tickets"
                width={250}
                height={250}
                className="object-contain"
              />
            </div>
            <h3 className="text-white text-lg font-semibold mt-4 text-center">
              Raffle Tickets
            </h3>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-full h-100 bg-gradient-to-br from-[#0f0f0f] to-[#191919] rounded-xl shadow-2xl shadow-black/50 hover:scale-[1.02] transition-transform duration-300 p-6">
              <Image
                src="/products_icon.png"
                alt="Points + $HEAD = Exclusive Products"
                width={250}
                height={250}
                className="object-contain"
              />
            </div>
            <h3 className="text-white text-lg font-semibold mt-4 text-center">
              Points + $HEAD = Exclusive Products
            </h3>
          </div>
        </div>


      </div>

    </div>
  )
}
