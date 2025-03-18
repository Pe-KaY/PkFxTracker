"use client"

import { useState, useMemo } from "react"
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAccounts } from "@/components/account-context"
import { format } from "date-fns"
import { TradeDetailsDialog } from "@/components/trade-details-dialog"
// Fix the import for useRouter
import { useRouter } from "next/navigation"

export function TradeHistory() {
  const router = useRouter()
  const { selectedAccountId, getTradesByAccountId } = useAccounts()
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null)

  const trades = useMemo(() => {
    return selectedAccountId
      ? getTradesByAccountId(selectedAccountId).slice(0, 5)
      : []
  }, [selectedAccountId, getTradesByAccountId])

  return (
    <>
      <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                Recent Trades
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your last 5 trades
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-cyan-400"
              onClick={() => router.push("/trades")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No trades recorded yet
            </div>
          ) : (
            <div className="space-y-4">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer hover:bg-gray-750 hover:border-gray-600 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                  onClick={() => setSelectedTradeId(trade.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        trade.direction === "buy"
                          ? "bg-emerald-400/20 text-emerald-400"
                          : trade.direction === "sell"
                          ? "bg-red-400/20 text-red-400"
                          : "bg-yellow-400/20 text-yellow-400"
                      }`}
                    >
                      {trade.direction === "buy" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : trade.direction === "sell" ? (
                        <ArrowDown className="h-4 w-4" />
                      ) : (
                        "BE"
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{trade.pair}</p>
                      <p className="text-xs text-white">
                        {format(trade.date, "MMM dd, yyyy")} | Risk:{" "}
                        {trade.risk}% | R:R {trade.riskReward}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        trade.result === "win"
                          ? "text-emerald-400"
                          : trade.result === "loss"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {trade.profit > 0 ? "+" : trade.profit < 0 ? "" : "±"}
                      {trade.profit.toFixed(2)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-gray-800 border-gray-700 text-white"
                    >
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem
                        className="hover:bg-gray-700 hover:text-cyan-400 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTradeId(trade.id)
                        }}
                      >
                        View details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTradeId && (
        <TradeDetailsDialog
          tradeId={selectedTradeId}
          isOpen={!!selectedTradeId}
          onOpenChange={(open) => {
            if (!open) setSelectedTradeId(null)
          }}
        />
      )}
    </>
  )
}
