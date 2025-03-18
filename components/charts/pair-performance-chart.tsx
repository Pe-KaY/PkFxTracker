"use client"

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useMemo } from "react"
import type { Trade } from "@/components/account-context"

// Custom tooltip component with improved visibility
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length && payload[0]) {
    const data = payload[0].payload
    if (!data) return null

    const pair = data.pair || ""
    const profit = typeof data.profit === "number" ? data.profit : 0
    const trades = typeof data.trades === "number" ? data.trades : 0
    const winRate = typeof data.winRate === "number" ? data.winRate : 0
    const isProfit = profit >= 0

    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg">
        <p className="text-white font-medium mb-1">{pair}</p>
        <p className="text-sm">
          Profit:{" "}
          <span className={isProfit ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
            ${profit.toFixed(2)}
          </span>
        </p>
        <p className="text-sm text-gray-300">
          Trades: <span className="text-purple-400 font-medium">{trades}</span>
        </p>
        <p className="text-sm text-gray-300">
          Win Rate: <span className="text-cyan-400 font-medium">{winRate}%</span>
        </p>
      </div>
    )
  }
  return null
}

interface PairPerformanceChartProps {
  data?: Trade[]
  detailed?: boolean
}

export function PairPerformanceChart({ data = [], detailed = false }: PairPerformanceChartProps) {
  // Process the trade data to create chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Group trades by pair
    const pairStats: Record<string, any> = {}

    data.forEach((trade) => {
      const pair = trade.pair

      if (!pairStats[pair]) {
        pairStats[pair] = {
          pair,
          profit: 0,
          trades: 0,
          wins: 0,
        }
      }

      pairStats[pair].profit += trade.profit
      pairStats[pair].trades += 1
      if (trade.result === "win") {
        pairStats[pair].wins += 1
      }
    })

    // Convert to array and calculate win rates
    const result = Object.values(pairStats).map((item: any) => ({
      ...item,
      winRate: item.trades > 0 ? Math.round((item.wins / item.trades) * 100) : 0,
    }))

    // Sort by profit (for detailed view) or by absolute profit (for overview)
    return detailed
      ? result.sort((a: any, b: any) => b.profit - a.profit)
      : result.sort((a: any, b: any) => Math.abs(b.profit) - Math.abs(a.profit)).slice(0, 6)
  }, [data, detailed])

  return (
    <div className="w-full h-full">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          No trade data available for the selected period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="pair" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(55, 65, 81, 0.3)" }} // Dark gray with opacity
            />
            <Bar dataKey="profit">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={typeof entry.profit === "number" && entry.profit >= 0 ? "#22D3EE" : "#EF4444"}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

