"use client"

import { useState } from "react"

const faqs = [
{
    question: "What is the Digital Recycler?",
    answer:
      "The Digital Recycler is a platform that transforms forgotten or useless NFTs into real impact. Instead of burning them, users can recycle their NFTs to earn points and sustainable rewards — helping build a more conscious Web3.",
  },
  {
    question: "What does it mean to recycle an NFT?",
    answer:
      "Recycling an NFT means permanently removing it from the blockchain, converting that “digital waste” into points and benefits within the platform. The process is transparent, secure, and fully recorded on-chain.",
  },
  {
    question: "What’s the difference between burning and recycling NFTs?",
    answer:
      "Burning simply destroys the NFT. Recycling gives it new meaning — users receive rewards, engage in a circular economy, and help reduce digital impact.",
  },
  {
    question: "What is the Non-Degen concept?",
    answer:
      "Non-Degen represents a new Web3 culture rooted in responsibility and purpose. The Digital Recycler promotes conscious blockchain use, emphasizing quality, sustainability, and positive impact.",
  },
  {
    question: "Is the Digital Recycler available only on Solana?",
    answer:
      "For now, yes. The first version was built on the Solana blockchain, where users can also recover locked SOL from old transactions. Soon, the platform will become multichain, integrating networks like Ethereum, Polygon, and Base.",
  },
  {
    question: "How does the locked SOL recovery work?",
    answer:
      "During the recycling process, the platform automatically detects SOL locked in previous transactions and instantly returns it to the user’s wallet.",
  },
  {
    question: "What rewards can I earn by recycling?",
    answer:
      "Users receive points and $HEAD tokens, which can be redeemed for benefits, phygital products, collectibles, and sustainable rewards.",
  },
  {
    question: "Is the Digital Recycler safe to use?",
    answer:
      "Yes. The protocol is built with a focus on security and transparency, ensuring all operations take place directly on-chain with no intermediaries.",
  },
  {
    question: "Does recycling have any cost?",
    answer:
      "Only the standard network transaction fee (gas fee) applies. The Digital Recycler charges no additional fees for recycling.",
  },
  {
    question: "What is the $HEAD token?",
    answer:
      "$HEAD is the utility token of the Recycle Minds ecosystem. It powers the Digital Recycler’s circular economy and will be used for rewards, products, and future phygital integrations.",
  },
  {
    question: "What is Recycle Minds?",
    answer:
      "Recycle Minds is the startup behind the Digital Recycler. Its mission is to merge technology, sustainability, and innovation to redefine how we interact with the Web3 universe.",
  },
  {
    question: "How can I get started?",
    answer:
      "Simply connect your wallet to the platform, select the NFTs you want to recycle, and track your rewards. Anyone can participate and help regenerate the digital ecosystem.",
  },
]

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">FAQ – Digital Recycler</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-[#2a2a2a] rounded-2xl border border-[#3a3a3a] overflow-hidden"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex justify-between items-center px-6 py-4 text-left font-medium text-lg hover:bg-[#333] transition-colors"
            >
              <span>{faq.question}</span>

              {/* seta svg girando */}
              <svg
                className={`w-5 h-5 transform transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* conteúdo do acordeão */}
            <div
              className={`px-6 transition-all duration-300 overflow-hidden text-gray-300 ${
                openIndex === index ? "max-h-80 py-2" : "max-h-0"
              }`}
            >
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
