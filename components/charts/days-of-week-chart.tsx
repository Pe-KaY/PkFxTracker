"use client"

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useMemo } from "react"
import { format } from "date-fns"
import type { Trade } from "@/components/account-context"

// Custom tooltip component with improved visibility
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length && payload[0]) {
    const data = payload[0].payload
    if (!data) return null

    const day = data.day || ""
    const profit = typeof data.profit === "number" ? data.profit : 0
    const trades = typeof data.trades === "number" ? data.trades : 0
    const winRate = typeof data.winRate === "number" ? data.winRate : 0
    const isProfit = profit >= 0

    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg">
        <p className="text-white font-medium mb-1">{day}</p>
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

interface DaysOfWeekChartProps {
  data?: Trade[]
  detailed?: boolean
}

export function DaysOfWeekChart({ data = [], detailed = false }: DaysOfWeekChartProps) {
  // Process the trade data to create chart data based on days of the week
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Initialize data for each day of the week
    const dayGroups: Record<string, { profit: number; trades: number; wins: number }> = {
      Monday: { profit: 0, trades: 0, wins: 0 },
      Tuesday: { profit: 0, trades: 0, wins: 0 },
      Wednesday: { profit: 0, trades: 0, wins: 0 },
      Thursday: { profit: 0, trades: 0, wins: 0 },
      Friday: { profit: 0, trades: 0, wins: 0 },
    }

    // Aggregate data by day of the week
    data.forEach((trade) => {
      const date = trade.date instanceof Date ? trade.date : new Date(trade.date)
      const dayOfWeek = format(date, "EEEE") // Get day name (Monday, Tuesday, etc.)

      if (dayGroups[dayOfWeek]) {
        dayGroups[dayOfWeek].profit += trade.profit
        dayGroups[dayOfWeek].trades += 1
        if (trade.result === "win") {
          dayGroups[dayOfWeek].wins += 1
        }
      }
    })

    // Convert to array and calculate win rate
    return Object.entries(dayGroups)
      .filter(([_, { trades }]) => trades > 0) // Only include days with trades
      .map(([day, { profit, trades, wins }]) => ({
        day,
        profit,
        trades,
        winRate: trades > 0 ? Math.round((wins / trades) * 100) : 0,
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
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
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

