"use client"

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { Trade } from "@/components/account-context"

// Sample data for when no trades are provided
const sampleData = [
  { session: "Asian", profit: 180, trades: 15, winRate: 60 },
  { session: "London", profit: 450, trades: 30, winRate: 73 },
  { session: "New York", profit: 320, trades: 25, winRate: 68 },
  { session: "Sydney", profit: -80, trades: 10, winRate: 40 },
  { session: "Overlap", profit: 380, trades: 20, winRate: 75 },
]

const detailedData = [
  { time: "00:00-03:00", session: "Asian", profit: 80, trades: 8, winRate: 62 },
  { time: "03:00-06:00", session: "Asian", profit: 100, trades: 7, winRate: 57 },
  { time: "06:00-09:00", session: "London", profit: 180, trades: 12, winRate: 75 },
  { time: "09:00-12:00", session: "London/NY", profit: 250, trades: 15, winRate: 80 },
  { time: "12:00-15:00", session: "New York", profit: 150, trades: 10, winRate: 70 },
  { time: "15:00-18:00", session: "New York", profit: 170, trades: 15, winRate: 67 },
  { time: "18:00-21:00", session: "Sydney", profit: -30, trades: 5, winRate: 40 },
  { time: "21:00-00:00", session: "Sydney/Asian", profit: -50, trades: 5, winRate: 40 },
]

// Custom tooltip component with improved visibility
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length && payload[0]) {
    const data = payload[0].payload
    if (!data) return null

    const displayName = data.time || data.session || ""
    const sessionInfo = data.time ? ` (${data.session || ""})` : ""
    const profit = typeof data.profit === "number" ? data.profit : 0
    const trades = typeof data.trades === "number" ? data.trades : 0
    const winRate = typeof data.winRate === "number" ? data.winRate : 0
    const isProfit = profit >= 0

    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg">
        <p className="text-white font-medium mb-1">
          {displayName}
          {sessionInfo}
        </p>
        <p className="text-sm">
          Profit:{" "}
          <span className={isProfit ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>${profit}</span>
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

interface SessionAnalysisChartProps {
  data?: Trade[]
  detailed?: boolean
}

export function SessionAnalysisChart({ data = [], detailed = false }: SessionAnalysisChartProps) {
  // For a real implementation, we would process the trade data to determine sessions
  // Since we don't have session data in our trades, we'll use the sample data
  const chartData = detailed ? detailedData : sampleData

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey={detailed ? "time" : "session"}
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
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
    </div>
  )
}

