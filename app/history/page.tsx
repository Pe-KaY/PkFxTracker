"use client"

import { useState, useEffect } from "react"
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
import { CalendarIcon, Filter } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
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

export default function HistoryPage() {
  const { toast } = useToast()
  const { selectedAccountId, getTradesByAccountId } = useAccounts()
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [filterDirection, setFilterDirection] = useState<string>("all")
  const [filterResult, setFilterResult] = useState<string>("all")
  const [filterPair, setFilterPair] = useState<string>("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [fromCalendarOpen, setFromCalendarOpen] = useState(false)
  const [toCalendarOpen, setToCalendarOpen] = useState(false)

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const allTrades = selectedAccountId
    ? getTradesByAccountId(selectedAccountId).sort((a, b) => {
        // Sort by date in descending order (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
    : []

  // Filter trades by date range if selected
  let filteredTrades = allTrades

  if (fromDate) {
    filteredTrades = filteredTrades.filter((trade) => {
      const tradeDate = new Date(trade.date)
      return tradeDate >= fromDate
    })
  }

  if (toDate) {
    filteredTrades = filteredTrades.filter((trade) => {
      const tradeDate = new Date(trade.date)
      return tradeDate <= toDate
    })
  }

  // Apply additional filters
  filteredTrades = filteredTrades.filter((trade) => {
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

  const trades = filteredTrades

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

  const handleClearDates = () => {
    setFromDate(undefined)
    setToDate(undefined)
    toast({
      title: "Dates Cleared",
      description: "Date filters have been removed",
    })
  }

  // Don't render until component is mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar
        activePage="history"
        showMobile={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setShowMobileMenu(!showMobileMenu)} />
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-950 to-gray-900">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
                  Trade History
                </h1>
                <p className="text-gray-400">
                  View and analyze your past trades
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2 whitespace-nowrap">
                    From:
                  </span>
                  <Popover
                    open={fromCalendarOpen}
                    onOpenChange={setFromCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[140px] justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-cyan-400 transition-colors duration-200",
                          !fromDate && "text-gray-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate ? (
                          format(fromDate, "MMM dd, y")
                        ) : (
                          <span>Start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div className="p-0 bg-gray-900 border border-gray-800 rounded-md">
                        <DatePicker
                          selected={fromDate}
                          onChange={(newDate) => {
                            if (newDate) {
                              setFromDate(newDate)
                              setFromCalendarOpen(false)
                            }
                          }}
                          maxDate={toDate || new Date()}
                          inline
                          calendarClassName="bg-gray-900 text-white border-0"
                          dayClassName={() => "text-white hover:bg-gray-800"}
                          wrapperClassName="bg-gray-900"
                          popperClassName="bg-gray-900"
                          monthClassName={() => "text-white"}
                          weekDayClassName={() => "text-gray-400"}
                          fixedHeight
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center">
                  <span className="text-gray-400 mr-2 whitespace-nowrap">
                    To:
                  </span>
                  <Popover
                    open={toCalendarOpen}
                    onOpenChange={setToCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[140px] justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-cyan-400 transition-colors duration-200",
                          !toDate && "text-gray-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? (
                          format(toDate, "MMM dd, y")
                        ) : (
                          <span>End date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div className="p-0 bg-gray-900 border border-gray-800 rounded-md">
                        <DatePicker
                          selected={toDate}
                          onChange={(newDate) => {
                            if (newDate) {
                              setToDate(newDate)
                              setToCalendarOpen(false)
                            }
                          }}
                          minDate={fromDate}
                          maxDate={new Date()}
                          inline
                          calendarClassName="bg-gray-900 text-white border-0"
                          dayClassName={() => "text-white hover:bg-gray-800"}
                          wrapperClassName="bg-gray-900"
                          popperClassName="bg-gray-900"
                          monthClassName={() => "text-white"}
                          weekDayClassName={() => "text-gray-400"}
                          fixedHeight
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {(fromDate || toDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-cyan-400"
                    onClick={handleClearDates}
                  >
                    Clear
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="bg-gray-900 border-gray-800 text-white hover:bg-gray-800 hover:text-cyan-400 transition-colors duration-200"
                  onClick={() => setShowFilterDialog(true)}
                >
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </div>
            </div>

            {/* Trade History Display */}
            {!selectedAccountId ? (
              <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">
                    Please select an account to view trading history
                  </p>
                </CardContent>
              </Card>
            ) : trades.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">
                    {allTrades.length === 0
                      ? "No trades found for this account"
                      : "No trades found for the selected period and filters"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    Trade History
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {trades.length} {trades.length === 1 ? "trade" : "trades"}{" "}
                    found
                    {(fromDate ||
                      toDate ||
                      filterDirection !== "all" ||
                      filterResult !== "all" ||
                      filterPair) &&
                      " (filtered)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trades.map((trade) => (
                      <div
                        key={trade.id}
                        className="p-4 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors duration-200"
                        onClick={() => {
                          setSelectedTradeId(trade.id)
                          toast({
                            title: "Trade Selected",
                            description: `Viewing details for ${trade.pair} trade`,
                          })
                        }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          <div>
                            <h3 className="text-lg font-medium text-white">
                              {trade.pair}
                            </h3>
                            <p className="text-sm text-white">
                              {format(new Date(trade.date), "MMMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 md:col-span-2">
                            <div className="grid grid-cols-4 gap-2">
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium text-center transition-colors duration-200 ${
                                  trade.direction === "buy"
                                    ? "bg-emerald-400/20 text-emerald-400"
                                    : "bg-red-400/20 text-red-400"
                                }`}
                              >
                                {trade.direction}
                              </div>
                              <div className="px-3 py-1 rounded-full bg-gray-700 text-xs font-medium text-center text-gray-300 transition-colors duration-200">
                                Risk: {trade.risk}%
                              </div>
                              <div className="px-3 py-1 rounded-full bg-gray-700 text-xs font-medium text-center text-gray-300 transition-colors duration-200">
                                R:R {trade.riskReward}
                              </div>
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium text-center transition-colors duration-200 ${
                                  trade.result === "win"
                                    ? "bg-emerald-400/20 text-emerald-400"
                                    : trade.result === "loss"
                                    ? "bg-red-400/20 text-red-400"
                                    : "bg-yellow-400/20 text-yellow-400"
                                }`}
                              >
                                {trade.result}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-lg font-medium text-right transition-colors duration-200 ${
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
                          </div>
                        </div>
                        {trade.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-sm text-gray-300">
                              {trade.notes}
                            </p>
                          </div>
                        )}
                        {trade.screenshot && (
                          <div className="mt-3">
                            <img
                              src={trade.screenshot || "/placeholder.svg"}
                              alt="Trade screenshot"
                              className="max-h-40 rounded-md object-contain"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
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
