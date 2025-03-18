"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useMemo } from "react"
import type { Trade } from "@/components/account-context"

// Sample data for when no trades are provided
const sampleData = [
  { name: "Winning Trades", value: 68, color: "#10B981" },
  { name: "Losing Trades", value: 32, color: "#EF4444" },
]

// Custom tooltip component with improved visibility
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length && payload[0]) {
    const entry = payload[0]
    const name = entry.name || ""
    const value = typeof entry.value === "number" ? entry.value : 0
    const color = entry.payload && entry.payload.color ? entry.payload.color : "#ffffff"

    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg">
        <p className="text-sm font-medium" style={{ color }}>
          {name}: {value}%
        </p>
      </div>
    )
  }
  return null
}

interface WinRateChartProps {
  data?: Trade[]
}

export function WinRateChart({ data = [] }: WinRateChartProps) {
  // Process the trade data to create chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Count wins and losses
    let wins = 0
    let losses = 0
    let breakeven = 0

    data.forEach((trade) => {
      if (trade.result === "win") {
        wins++
      } else if (trade.result === "loss") {
        losses++
      } else if (trade.result === "breakeven") {
        breakeven++
      }
    })

    const total = wins + losses + breakeven

    if (total === 0) return []

    // Calculate percentages
    const winPercentage = Math.round((wins / total) * 100)
    const lossPercentage = Math.round((losses / total) * 100)
    const breakevenPercentage = 100 - winPercentage - lossPercentage

    return [
      { name: "Winning Trades", value: winPercentage, color: "#10B981" },
      { name: "Losing Trades", value: lossPercentage, color: "#EF4444" },
      { name: "Break Even", value: breakevenPercentage, color: "#FBBF24" },
    ].filter((item) => item.value > 0)
  }, [data])

  return (
    <div className="w-full h-full">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          No trade data available for the selected period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => {
                if (typeof name !== "string" || typeof percent !== "number") return ""
                return `${name} ${(percent * 100).toFixed(0)}%`
              }}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

