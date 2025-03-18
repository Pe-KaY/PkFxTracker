"use client"

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useMemo } from "react"
import type { Trade } from "@/components/account-context"

// Custom tooltip component with improved visibility
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length && payload[0]) {
    const data = payload[0].payload
    if (!data) return null

    const duration = data.duration || ""
    const avgProfit = typeof payload[0].value === "number" ? payload[0].value : 0
    const count = typeof data.count === "number" ? data.count : 0

    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg">
        <p className="text-white font-medium mb-1">{duration}</p>
        <p className="text-sm text-gray-300">
          Avg. Profit: <span className="text-cyan-400 font-medium">${avgProfit.toFixed(2)}</span>
        </p>
        <p className="text-sm text-gray-300">
          Number of Trades: <span className="text-purple-400 font-medium">{count}</span>
        </p>
      </div>
    )
  }
  return null
}

interface TradeDurationChartProps {
  data?: Trade[]
}

export function TradeDurationChart({ data = [] }: TradeDurationChartProps) {
  // Process the trade data to create chart data based on duration
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Group trades by duration
    const durationGroups: Record<string, { totalProfit: number; count: number }> = {}

    // Aggregate data by duration
    data.forEach((trade) => {
      const duration = trade.duration || "< 1 hour"
      if (!durationGroups[duration]) {
        durationGroups[duration] = {
          totalProfit: 0,
          count: 0,
        }
      }

      durationGroups[duration].totalProfit += trade.profit
      durationGroups[duration].count += 1
    })

    // Convert to array and calculate average profit
    return Object.entries(durationGroups).map(([duration, { totalProfit, count }]) => ({
      duration,
      avgProfit: count > 0 ? totalProfit / count : 0,
      count,
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
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="duration" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="avgProfit"
              stroke="#A855F7"
              strokeWidth={2}
              dot={{ fill: "#A855F7", stroke: "#6B21A8", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#A855F7", stroke: "#6B21A8", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

