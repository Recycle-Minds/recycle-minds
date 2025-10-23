"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Layers3, Loader2, RefreshCw, Copy, Check } from "lucide-react"
import { useRecycling } from "@/hooks/use-recycling"
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

interface EmptyAccount {
  address: string
  mint: string
  amount: number
  rent: number
}

export function ClaimSolView() {
  const [activeSubTab, setActiveSubTab] = useState<"nfts" | "tokens">("nfts")
  const { cleanupClaim, cleanupClaimSelected } = useRecycling()
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [claiming, setClaiming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emptyAccounts, setEmptyAccounts] = useState<EmptyAccount[]>([])
  const [lastResult, setLastResult] = useState<{ signature: string | null; closed: number } | null>(null)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const fetchEmptyAccounts = async () => {
    if (!connected || !publicKey) return

    setLoading(true)
    try {
      const response = await fetch(`/api/empty-accounts?owner=${encodeURIComponent(publicKey.toString())}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`API error: ${data.error}`)
      }

      const empty: EmptyAccount[] = (data.emptyAccounts || []).map((acc: any) => ({
        address: acc.address,
        mint: acc.mint,
        amount: 0,
        rent: 0.00203928 // Typical rent for token account
      }))

      setEmptyAccounts([...empty])
    } catch (error) {
      console.error('Error fetching empty accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (connected && publicKey) {
      fetchEmptyAccounts()
    }
  }, [connected, publicKey, connection])

  const totalRent = emptyAccounts.reduce((sum, acc) => sum + acc.rent, 0)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddress(text)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!connected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to view accounts available for cleanup</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Claim your SOL</h2>
        <p className="text-gray-400">Clean up empty token accounts and recover SOL rent</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-xl p-6 shadow-lg shadow-black/30 border border-[#292929] mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Empty Token Accounts</h3>
            <p className="text-gray-400">Close empty accounts to recover rent</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{emptyAccounts.length}</div>
            <div className="text-sm text-gray-400">accounts</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Estimated SOL to recover:</span>
            <span className="text-xl font-bold text-white">{totalRent.toFixed(6)} SOL</span>
          </div>
        </div>
      </div>


      {/* Results */}
      {lastResult && (
        <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-xl p-4 shadow-lg shadow-black/30 border border-[#292929] mb-6">
          <h4 className="text-lg font-semibold text-white mb-2">Last Claim Result</h4>
          <p className="text-gray-400">
            {lastResult.signature ? (
              <>
                Successfully closed {lastResult.closed} accounts
                <br />
                <span className="text-xs text-gray-500">Tx: {lastResult.signature}</span>
              </>
            ) : (
              'No accounts found to close'
            )}
          </p>
        </div>
      )}

      {/* Empty Accounts List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-400" />
          <p className="text-gray-400">Loading empty accounts...</p>
        </div>
      ) : emptyAccounts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-gray-300 mb-2">No Empty Accounts Found</h3>
          <p className="text-gray-500">All your token accounts have balances or there are no accounts to clean up</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-xl p-6 shadow-lg shadow-black/30 border border-[#292929]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Empty Token Accounts ({emptyAccounts.length})</h3>
            <div className="flex items-center gap-3">
              <Button
                className="bg-teal-500 text-white hover:bg-teal-400 px-4 py-2 text-sm font-bold border-2 border-teal-500 transition-all duration-300 rounded-lg"
                disabled={emptyAccounts.length === 0 || claiming}
                onClick={async () => {
                  try {
                    setClaiming(true)
                    const res = await cleanupClaim(emptyAccounts.length)
                    setLastResult(res)
                    if (res.signature) {
                      await fetchEmptyAccounts() // Refresh the list
                    }
                  } finally {
                    setClaiming(false)
                  }
                }}
              >
                {claiming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  `Claim All (${emptyAccounts.length})`
                )}
              </Button>
              
              <Button
                className="bg-teal-500 text-white hover:bg-teal-400 px-4 py-2 text-sm font-bold border-2 border-teal-500 transition-all duration-300 rounded-lg"
                disabled={Object.keys(selected).filter(k => selected[k]).length === 0 || claiming}
                onClick={async () => {
                  try {
                    setClaiming(true)
                    const toClose = Object.keys(selected).filter(k => selected[k])
                    const res = await cleanupClaimSelected(toClose)
                    setLastResult(res)
                    if (res.signature) await fetchEmptyAccounts()
                  } finally {
                    setClaiming(false)
                  }
                }}
              >
                {claiming ? 'Claiming…' : `Claim Selected (${Object.keys(selected).filter(k => selected[k]).length})`}
              </Button>

              <Button
                variant="outline"
                className="border-[#292929] text-white hover:bg-gray-800 px-4 py-2 text-sm"
                onClick={fetchEmptyAccounts}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {emptyAccounts.map((account) => {
              const checked = !!selected[account.address]
              return (
                <label key={account.address} className={`flex items-center gap-3 p-3 rounded-xl border ${checked ? 'border-teal-500 bg-teal-500/5' : 'border-[#292929]'} cursor-pointer`}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-teal-500"
                    checked={checked}
                    onChange={() => setSelected(prev => ({ ...prev, [account.address]: !prev[account.address] }))}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-400">Account:</span>
                        <span className="text-sm font-mono text-gray-300">{account.address}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(account.address)
                          }}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          {copiedAddress === account.address ? (
                            <Check className="h-3 w-3 text-teal-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Mint:</span>
                        <span className="text-sm font-mono text-gray-300">{account.mint}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(account.mint)
                          }}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          {copiedAddress === account.mint ? (
                            <Check className="h-3 w-3 text-teal-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-teal-400">{account.rent.toFixed(6)} SOL</div>
                      <div className="text-xs text-gray-500">rent</div>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
