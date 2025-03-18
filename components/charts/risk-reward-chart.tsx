"use client"

import { Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, ComposedChart } from "recharts"
import { useMemo } from "react"
import type { Trade } from "@/components/account-context"

// Sample data for when no trades are provided
const sampleData = [
  { ratio: "1:1", totalTrades: 42, winRate: 68, avgProfit: 45, successRate: 68 },
  { ratio: "1:1.5", totalTrades: 38, winRate: 63, avgProfit: 58, successRate: 63 },
  { ratio: "1:2", totalTrades: 56, winRate: 59, avgProfit: 72, successRate: 59 },
  { ratio: "1:2.5", totalTrades: 35, winRate: 54, avgProfit: 85, successRate: 54 },
  { ratio: "1:3", totalTrades: 28, winRate: 50, avgProfit: 96, successRate: 50 },
  { ratio: "1:4", totalTrades: 18, winRate: 44, avgProfit: 112, successRate: 44 },
  { ratio: "1:5", totalTrades: 12, winRate: 42, avgProfit: 130, successRate: 42 },
]

// Custom tooltip component with improved visibility
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length && payload[0]) {
    const data = payload[0].payload
    if (!data) return null

    const ratio = data.ratio || ""
    const winRate = typeof data.winRate === "number" ? data.winRate : 0
    const avgProfit = typeof data.avgProfit === "number" ? data.avgProfit : 0
    const totalTrades = typeof data.totalTrades === "number" ? data.totalTrades : 0

    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg">
        <p className="text-white font-medium mb-2">Risk:Reward {ratio}</p>
        <p className="text-sm text-gray-300 mb-1">
          Total Trades: <span className="text-purple-400 font-medium">{totalTrades}</span>
        </p>
        <p className="text-sm text-gray-300 mb-1">
          Win Rate: <span className="text-cyan-400 font-medium">{winRate}%</span>
        </p>
        <p className="text-sm text-gray-300 mb-1">
          Avg. Profit: <span className="text-emerald-400 font-medium">${avgProfit}</span>
        </p>
      </div>
    )
  }
  return null
}

interface RiskRewardChartProps {
  data?: Trade[]
}

export function RiskRewardChart({ data = [] }: RiskRewardChartProps) {
  // Process the trade data to create chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Group trades by risk:reward ratio
    const ratioStats: Record<string, any> = {}

    data.forEach((trade) => {
      const ratio = trade.riskReward

      if (!ratioStats[ratio]) {
        ratioStats[ratio] = {
          ratio,
          totalTrades: 0,
          wins: 0,
          totalProfit: 0,
        }
      }

      ratioStats[ratio].totalTrades += 1
      if (trade.result === "win") {
        ratioStats[ratio].wins += 1
      }
      ratioStats[ratio].totalProfit += trade.profit
    })

    // Calculate win rates and average profits
    return Object.values(ratioStats).map((item: any) => ({
      ...item,
      winRate: item.totalTrades > 0 ? Math.round((item.wins / item.totalTrades) * 100) : 0,
      avgProfit: item.totalTrades > 0 ? Math.round(item.totalProfit / item.totalTrades) : 0,
      successRate: item.winRate, // For compatibility with the chart
    }))
  }, [data])

  return (
    <div className="w-full h-full">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          No trade data available for the selected period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="ratio" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              yAxisId="left"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, "dataMax + 20"]}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: "#E5E7EB" }}
              formatter={(value) => <span className="text-gray-300">{value}</span>}
            />
            <Bar yAxisId="left" dataKey="winRate" name="Win Rate" fill="#22D3EE" radius={[4, 4, 0, 0]} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgProfit"
              name="Avg. Profit"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: "#10B981", stroke: "#059669", strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

