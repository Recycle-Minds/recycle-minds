export function RecyclingHistoryTable() {
  const historyData = [
    {
      collection: "Collection Name",
      network: "Solana",
      date: "10/02/2025",
      nftCount: 2,
      points: 15,
    },
    {
      collection: "Collection Name",
      network: "Polygon",
      date: "10/02/2025",
      nftCount: 23,
      points: 50,
    },
    {
      collection: "Collection Name",
      network: "Ethereum",
      date: "10/02/2025",
      nftCount: 100,
      points: 250,
    },
    {
      collection: "Collection Name",
      network: "Base",
      date: "10/02/2025",
      nftCount: 18,
      points: 28,
    },
  ]

  const getNetworkIcon = (network: string) => {
    switch (network) {
      case "Solana":
        return (
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <div className="w-4 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded" />
              <div className="w-4 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded" />
              <div className="w-4 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded" />
            </div>
            <span className="text-white">{network}</span>
          </div>
        )
      case "Polygon":
        return (
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M13.5 6.5L10 4.5L6.5 6.5V10.5L10 12.5L13.5 10.5V6.5Z"
                stroke="#8247e5"
                strokeWidth="1.5"
                fill="none"
              />
              <path d="M10 4.5V12.5M6.5 6.5L13.5 10.5M13.5 6.5L6.5 10.5" stroke="#8247e5" strokeWidth="1.5" />
            </svg>
            <span className="text-white">{network}</span>
          </div>
        )
      case "Ethereum":
        return (
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3L10 11L15 8.5L10 3Z" fill="#8c8c8c" />
              <path d="M10 3L5 8.5L10 11L10 3Z" fill="#393939" />
              <path d="M10 12L10 17L15 9.5L10 12Z" fill="#8c8c8c" />
              <path d="M10 17L10 12L5 9.5L10 17Z" fill="#393939" />
            </svg>
            <span className="text-white">{network}</span>
          </div>
        )
      case "Base":
        return (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <span className="text-white">{network}</span>
          </div>
        )
      default:
        return <span className="text-white">{network}</span>
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-[#00ff00] text-center mb-6">HISTORY</h2>

      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-4 px-6 text-[#00ff00] font-semibold">Collection</th>
              <th className="text-left py-4 px-6 text-[#00ff00] font-semibold">Network</th>
              <th className="text-left py-4 px-6 text-[#00ff00] font-semibold">Date</th>
              <th className="text-left py-4 px-6 text-[#00ff00] font-semibold">Number of NFTs</th>
              <th className="text-left py-4 px-6 text-[#00ff00] font-semibold">Points Earned</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((item, index) => (
              <tr key={index} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-900/50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white" />
                    <span className="text-white">{item.collection}</span>
                  </div>
                </td>
                <td className="py-4 px-6">{getNetworkIcon(item.network)}</td>
                <td className="py-4 px-6 text-white">{item.date}</td>
                <td className="py-4 px-6 text-white">{item.nftCount}</td>
                <td className="py-4 px-6 text-white">{item.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
