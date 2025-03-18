"use client"

import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccounts } from "@/components/account-context"
import { useMemo } from "react"

// Motivational quotes for traders
const motivationalQuotes = [
  "The stock market is filled with individuals who know the price of everything, but the value of nothing.",
  "The market can remain irrational longer than you can remain solvent.",
  "Risk comes from not knowing what you're doing.",
  "The most important quality for an investor is temperament, not intellect.",
  "In trading, the impossible happens about twice a year.",
  "The four most dangerous words in investing are: 'This time it's different.'",
  "The key to trading success is emotional discipline. Making money has nothing to do with intelligence.",
  "Successful trading is about finding the rules that work and then sticking to those rules.",
  "Trading doesn't just reveal your character, it also builds it if you stay in the game long enough.",
  "The goal of a successful trader is to make the best trades. Money is secondary.",
  "The elements of good trading are: cutting losses, cutting losses, and cutting losses.",
  "The desire to perform all the time is usually a barrier to performing over time.",
  "The market is a device for transferring money from the impatient to the patient.",
  "The only way to make money in the market is to go against the prevailing opinion.",
  "The market is not an IQ test; it's a game of discipline and patience.",
]

export function StatsCards() {
  const { selectedAccountId, calculateAccountStats, getAccountById } = useAccounts()

  // Select a random motivational quote
  const randomQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
    return motivationalQuotes[randomIndex]
  }, [])

  if (!selectedAccountId) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Select an Account</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-400">Please select an account to view stats</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = calculateAccountStats(selectedAccountId)
  const account = getAccountById(selectedAccountId)

  if (!account) return null

  const currentBalance = account.size + stats.totalProfit
  const percentChange = account.size > 0 ? (stats.totalProfit / account.size) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Total Profit/Loss</CardTitle>
          <DollarSign className="h-4 w-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {stats.totalProfit >= 0 ? "+" : ""}
            {stats.totalProfit.toFixed(2)}
          </div>
          <div className="flex items-center text-xs mt-1">
            <span className={`flex items-center ${percentChange >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {percentChange >= 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {Math.abs(percentChange).toFixed(2)}% from starting balance
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Win Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
          <div className="flex items-center text-xs text-gray-400 mt-1">Based on {stats.totalTrades} total trades</div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Current Balance</CardTitle>
          <TrendingDown className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">${currentBalance.toFixed(2)}</div>
          <div className="flex items-center text-xs text-gray-400 mt-1">Starting: ${account.size.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Total Trades</CardTitle>
          <TrendingUp className="h-4 w-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
          <div className="text-xs text-gray-400 mt-1 italic">"{randomQuote}"</div>
        </CardContent>
      </Card>
    </div>
  )
}

