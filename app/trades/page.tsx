"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAccounts } from "@/components/account-context"
import { format } from "date-fns"
import { ArrowDown, ArrowUp, Filter, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TradeForm } from "@/components/trade-form"
import { TradeDetailsDialog } from "@/components/trade-details-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function TradesPage() {
  const { toast } = useToast()
  const { selectedAccountId, getTradesByAccountId } = useAccounts()
  const [showForm, setShowForm] = useState(false)
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [filterDirection, setFilterDirection] = useState<string>("all")
  const [filterResult, setFilterResult] = useState<string>("all")
  const [filterPair, setFilterPair] = useState<string>("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const allTrades = selectedAccountId
    ? getTradesByAccountId(selectedAccountId)
    : []

  // Calculate trade statistics
  const tradeStats = useMemo(() => {
    const wins = allTrades.filter((trade) => trade.result === "win").length
    const losses = allTrades.filter((trade) => trade.result === "loss").length
    const breakEvens = allTrades.filter(
      (trade) => trade.result === "breakeven"
    ).length

    return { wins, losses, breakEvens }
  }, [allTrades])

  // Apply filters - fixed to correctly filter by result
  const trades = allTrades.filter((trade) => {
    if (filterDirection !== "all" && trade.direction !== filterDirection)
      return false
    if (filterResult !== "all" && trade.result !== filterResult) return false
    if (
      filterPair &&
      !trade.pair.toLowerCase().includes(filterPair.toLowerCase())
    )
      return false
    return true
  })

  const handleApplyFilters = () => {
    setShowFilterDialog(false)
    toast({
      title: "Filters Applied",
      description: "Your trades have been filtered based on your criteria",
    })
  }

  const handleResetFilters = () => {
    setFilterDirection("all")
    setFilterResult("all")
    setFilterPair("")
    setShowFilterDialog(false)
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared",
    })
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar
        activePage="trades"
        showMobile={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setShowMobileMenu(!showMobileMenu)} />
        <div className="flex-1 flex flex-col overflow-auto bg-gradient-to-br from-gray-950 to-gray-900">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
                  Trades
                </h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="bg-gray-900 border-gray-800 text-white hover:bg-gray-800 hover:text-cyan-400"
                    onClick={() => setShowFilterDialog(true)}
                  >
                    <Filter className="mr-2 h-4 w-4" /> Filter
                  </Button>
                  <Button
                    onClick={() => {
                      setShowForm(!showForm)
                      toast({
                        title: showForm ? "Form Hidden" : "Form Shown",
                        description: showForm
                          ? "Trade form has been hidden"
                          : "You can now record a new trade",
                      })
                    }}
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                  >
                    {showForm ? "Hide Form" : "New Trade"}
                  </Button>
                </div>
              </div>

              {showForm && (
                <div className="mb-6">
                  <TradeForm />
                </div>
              )}

              {selectedAccountId && allTrades.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <span className="text-emerald-400 text-2xl font-bold">
                        {tradeStats.wins}
                      </span>
                      <span className="text-gray-400 text-sm">Wins</span>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <span className="text-red-400 text-2xl font-bold">
                        {tradeStats.losses}
                      </span>
                      <span className="text-gray-400 text-sm">Losses</span>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <span className="text-yellow-400 text-2xl font-bold">
                        {tradeStats.breakEvens}
                      </span>
                      <span className="text-gray-400 text-sm">Break Evens</span>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-visible">
            <div className="h-full overflow-auto px-6 pb-6">
              <div className="max-w-7xl mx-auto">
                {!selectedAccountId ? (
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-400">
                        Please select an account to view trades
                      </p>
                    </CardContent>
                  </Card>
                ) : trades.length === 0 ? (
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-400">
                        {allTrades.length === 0
                          ? "No trades recorded for this account yet"
                          : "No trades match your filter criteria"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardHeader>
                      <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Trade History
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {trades.length}{" "}
                        {trades.length === 1 ? "trade" : "trades"}
                        {(filterDirection !== "all" ||
                          filterResult !== "all" ||
                          filterPair) &&
                          " (filtered)"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                Date
                              </th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                Pair
                              </th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                Direction
                              </th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                Risk
                              </th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                R:R
                              </th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                Result
                              </th>
                              <th className="text-right py-3 px-4 text-gray-400 font-medium">
                                Profit/Loss
                              </th>
                              <th className="text-right py-3 px-4 text-gray-400 font-medium">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {trades.map((trade) => (
                              <tr
                                key={trade.id}
                                className="border-b border-gray-800 hover:bg-gray-800 hover:shadow-inner cursor-pointer transition-all duration-200"
                                onClick={() => {
                                  setSelectedTradeId(trade.id)
                                  toast({
                                    title: "Trade Selected",
                                    description: `Viewing details for ${trade.pair} trade`,
                                  })
                                }}
                              >
                                <td className="py-3 px-4 text-sm text-white">
                                  {format(new Date(trade.date), "MMM dd, yyyy")}
                                </td>
                                <td className="py-3 px-4 text-sm text-white">
                                  {trade.pair}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  <span
                                    className={`flex items-center gap-1 ${
                                      trade.direction === "buy"
                                        ? "text-emerald-400"
                                        : trade.direction === "sell"
                                        ? "text-red-400"
                                        : "text-yellow-400"
                                    }`}
                                  >
                                    {trade.direction === "buy" ? (
                                      <ArrowUp className="h-3 w-3" />
                                    ) : trade.direction === "sell" ? (
                                      <ArrowDown className="h-3 w-3" />
                                    ) : (
                                      "BE"
                                    )}
                                    {trade.direction}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-white">
                                  {trade.risk}%
                                </td>
                                <td className="py-3 px-4 text-sm text-white">
                                  {trade.riskReward}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  <span
                                    className={`${
                                      trade.result === "win"
                                        ? "text-emerald-400"
                                        : trade.result === "loss"
                                        ? "text-red-400"
                                        : "text-yellow-400"
                                    }`}
                                  >
                                    {trade.result}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-right">
                                  <span
                                    className={`${
                                      trade.profit > 0
                                        ? "text-emerald-400"
                                        : trade.profit < 0
                                        ? "text-red-400"
                                        : "text-yellow-400"
                                    }`}
                                  >
                                    {trade.profit > 0
                                      ? "+"
                                      : trade.profit < 0
                                      ? ""
                                      : "±"}
                                    {trade.profit.toFixed(2)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-white"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">
                                          Open menu
                                        </span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="bg-gray-800 border-gray-700 text-white"
                                    >
                                      <DropdownMenuLabel>
                                        Actions
                                      </DropdownMenuLabel>
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
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedTradeId && (
        <TradeDetailsDialog
          tradeId={selectedTradeId}
          isOpen={!!selectedTradeId}
          onOpenChange={(open) => {
            if (!open) setSelectedTradeId(null)
          }}
        />
      )}

      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Filter Trades
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Apply filters to find specific trades
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="direction" className="text-gray-300">
                Direction
              </Label>
              <Select
                value={filterDirection}
                onValueChange={setFilterDirection}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white transition-colors duration-200">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result" className="text-gray-300">
                Result
              </Label>
              <Select value={filterResult} onValueChange={setFilterResult}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white transition-colors duration-200">
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="breakeven">Break Even</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pair" className="text-gray-300">
                Currency Pair
              </Label>
              <Input
                id="pair"
                value={filterPair}
                onChange={(e) => setFilterPair(e.target.value)}
                placeholder="Search by pair (e.g., EUR/USD)"
                className="bg-gray-800 border-gray-700 text-white focus-visible:ring-cyan-500 transition-colors duration-200"
              />
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 transition-colors duration-200"
            >
              Reset Filters
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
            >
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
