"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { format } from "date-fns"
import { useMemo } from "react"
import type { Trade } from "@/components/account-context"

// Custom tooltip component with improved visibility
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg">
        <p className="text-gray-300 font-medium mb-1">{label || ""}</p>
        {payload.map((entry: any, index: number) => {
          if (!entry || typeof entry.value === "undefined") return null

          const dataKey = entry.dataKey || ""
          const value = typeof entry.value === "number" ? entry.value : 0

          return (
            <p
              key={`item-${index}`}
              className="text-sm"
              style={{ color: dataKey === "profit" ? (value >= 0 ? "#10B981" : "#EF4444") : "#22D3EE" }}
            >
              {dataKey === "profit" ? "Daily Profit: " : "Cumulative Profit: "}
              <span className="font-medium">${value.toFixed(2)}</span>
            </p>
          )
        })}
      </div>
    )
  }
  return null
}

interface PerformanceChartProps {
  data?: Trade[]
  detailed?: boolean
}

export function PerformanceChart({ data = [], detailed = false }: PerformanceChartProps) {
  // Process the trade data to create chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Sort trades by date
    const sortedTrades = [...data].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date)
      const dateB = b.date instanceof Date ? b.date : new Date(b.date)
      return dateA.getTime() - dateB.getTime()
    })

    // Group trades by date
    const tradesByDate: Record<string, any> = {}

    sortedTrades.forEach((trade) => {
      const tradeDate = trade.date instanceof Date ? trade.date : new Date(trade.date)
      const dateStr = format(tradeDate, "MMM d")

      if (!tradesByDate[dateStr]) {
        tradesByDate[dateStr] = {
          date: dateStr,
          profit: 0,
          trades: 0,
        }
      }

      tradesByDate[dateStr].profit += trade.profit
      tradesByDate[dateStr].trades += 1
    })

    // Convert to array and calculate cumulative profit
    let cumulativeProfit = 0
    const result = Object.values(tradesByDate).map((item: any) => {
      cumulativeProfit += item.profit
      return {
        ...item,
        cumulativeProfit,
      }
    })

    return result
  }, [data, detailed])

  if (detailed) {
    return (
      <div className="w-full h-full grid grid-cols-1 gap-6">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No trade data available for the selected period
          </div>
        ) : (
          <>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
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
                  <Line
                    type="monotone"
                    dataKey="cumulativeProfit"
                    stroke="#22D3EE"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#22D3EE", stroke: "#0E7490", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#22D3EE", stroke: "#0E7490", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
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
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          No trade data available for the selected period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
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
            <Area
              type="monotone"
              dataKey="cumulativeProfit"
              stroke="#22D3EE"
              fillOpacity={1}
              fill="url(#colorProfit)"
              strokeWidth={2}
              dot={{ r: 0 }}
              activeDot={{ r: 6, fill: "#22D3EE", stroke: "#0E7490", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

