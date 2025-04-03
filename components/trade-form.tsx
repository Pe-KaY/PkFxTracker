"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAccounts } from "@/components/account-context"
import { useToast } from "@/hooks/use-toast"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useSound } from "@/hooks/useSound"
import confetti from "canvas-confetti"

const currencyPairs = [
  // Major Forex Pairs
  { label: "EUR/USD", value: "eurusd" },
  { label: "GBP/USD", value: "gbpusd" },
  { label: "USD/JPY", value: "usdjpy" },
  { label: "USD/CHF", value: "usdchf" },
  { label: "AUD/USD", value: "audusd" },
  { label: "USD/CAD", value: "usdcad" },
  { label: "NZD/USD", value: "nzdusd" },

  // Minor Forex Pairs
  { label: "EUR/GBP", value: "eurgbp" },
  { label: "EUR/JPY", value: "eurjpy" },
  { label: "GBP/JPY", value: "gbpjpy" },

  // Commodities
  { label: "XAU/USD (Gold)", value: "xauusd" },
  { label: "XAG/USD (Silver)", value: "xagusd" },
  { label: "XTI/USD (Crude Oil)", value: "xtiusd" },
  { label: "XNG/USD (Natural Gas)", value: "xngusd" },

  // Cryptocurrencies
  { label: "BTC/USD (Bitcoin)", value: "btcusd" },
  { label: "ETH/USD (Ethereum)", value: "ethusd" },
  { label: "XRP/USD (Ripple)", value: "xrpusd" },
  { label: "LTC/USD (Litecoin)", value: "ltcusd" },

  // Indices
  { label: "US30 (Dow Jones)", value: "us30" },
  { label: "NAS100 (Nasdaq)", value: "nas100" },
  { label: "SPX500 (S&P 500)", value: "spx500" },
  { label: "UK100 (FTSE 100)", value: "uk100" },
  { label: "GER40 (DAX)", value: "ger40" },
  { label: "JPN225 (Nikkei)", value: "jpn225" },
]

const durationOptions = [
  { label: "< 1 hour", value: "lt1h" },
  { label: "1-4 hours", value: "1-4h" },
  { label: "4-12 hours", value: "4-12h" },
  { label: "12-24 hours", value: "12-24h" },
  { label: "1-3 days", value: "1-3d" },
  { label: "3-7 days", value: "3-7d" },
  { label: "> 7 days", value: "gt7d" },
]

export function TradeForm() {
  const { toast } = useToast()
  const { selectedAccountId, addTrade } = useAccounts()
  const playCashSound = useSound("/sounds/Register.mp3", 1.0)

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [pair, setPair] = useState("")
  const [direction, setDirection] = useState<"buy" | "sell">("buy")
  const [risk, setRisk] = useState("")
  const [riskRewardRatio, setRiskRewardRatio] = useState("")
  const [result, setResult] = useState<"win" | "loss" | "breakeven">("win")
  const [duration, setDuration] = useState("")
  const [notes, setNotes] = useState("")
  const [screenshot, setScreenshot] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [customPair, setCustomPair] = useState("")
  const [mounted, setMounted] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [profitLossType, setProfitLossType] = useState<"calculated" | "manual">(
    "manual"
  )
  const [manualProfitLoss, setManualProfitLoss] = useState<string>("")

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleSubmit = () => {
    if (!selectedAccountId) {
      toast({
        title: "No account selected",
        description: "Please select an account to record this trade",
        variant: "destructive",
      })
      return
    }

    // Check if we're using a custom pair or a selected one
    const selectedPair = customPair || pair

    if (!selectedPair) {
      toast({
        title: "Missing information",
        description: "Please select or enter a currency pair",
        variant: "destructive",
      })
      return
    }

    if (!date) {
      toast({
        title: "Missing information",
        description: "Please select a date",
        variant: "destructive",
      })
      return
    }

    if (!risk || isNaN(Number.parseFloat(risk))) {
      toast({
        title: "Invalid risk",
        description: "Please enter a valid risk percentage",
        variant: "destructive",
      })
      return
    }

    if (!riskRewardRatio || isNaN(Number.parseFloat(riskRewardRatio))) {
      toast({
        title: "Invalid risk:reward ratio",
        description: "Please enter a valid risk:reward ratio number",
        variant: "destructive",
      })
      return
    }

    if (!duration) {
      toast({
        title: "Missing information",
        description: "Please select a trade duration",
        variant: "destructive",
      })
      return
    }

    if (result !== "breakeven") {
      if (!manualProfitLoss || isNaN(Number(manualProfitLoss))) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid profit/loss amount",
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)

    // Find the pair label from the value or use custom pair
    const pairLabel =
      customPair || currencyPairs.find((p) => p.value === pair)?.label || pair

    // Find the duration label from the value
    const durationLabel =
      durationOptions.find((d) => d.value === duration)?.label || duration

    try {
      const tradeId = `trade${Date.now()}`
      addTrade({
        id: tradeId,
        accountId: selectedAccountId,
        pair: pairLabel,
        date: date,
        direction: direction,
        risk: Number.parseFloat(risk),
        riskReward: `1:${riskRewardRatio}`,
        result: result,
        duration: durationLabel,
        profitLossType,
        manualProfitLoss:
          result === "win"
            ? Number(manualProfitLoss)
            : -Number(manualProfitLoss),
        profit: 0, // This will be calculated in the context based on profitLossType
        notes: notes,
        screenshot: screenshot,
      })

      // Play cash register sound if it's a winning trade
      if (result === "win") {
        playCashSound()
      }

      // Reset form
      setPair("")
      setCustomPair("")
      setDate(new Date())
      setDirection("buy")
      setRisk("")
      setRiskRewardRatio("")
      setResult("win")
      setDuration("")
      setNotes("")
      setScreenshot(undefined)
      setProfitLossType("manual")
      setManualProfitLoss("")

      toast({
        title: "Trade recorded",
        description: "Your trade has been successfully recorded",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error recording your trade",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshot(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Don't render until component is mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] max-w-xl mx-auto transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Record New Trade
        </CardTitle>
        <CardDescription className="text-gray-400">
          Enter the details of your Trade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="pair" className="text-gray-300">
            Currency Pair
          </Label>
          <Select
            value={pair}
            onValueChange={(value) => {
              setPair(value)
              setCustomPair("") // Clear custom pair when selecting from dropdown
            }}
          >
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white focus:ring-cyan-500 transition-colors duration-200">
              <SelectValue placeholder="Select currency pair" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-80">
              <div className="p-2 text-xs font-semibold text-gray-400 border-b border-gray-700">
                Forex Pairs
              </div>
              {currencyPairs.slice(0, 10).map((pair) => (
                <SelectItem
                  key={pair.value}
                  value={pair.value}
                  className="focus:bg-gray-700 focus:text-cyan-400"
                >
                  {pair.label}
                </SelectItem>
              ))}

              <div className="p-2 text-xs font-semibold text-gray-400 border-b border-gray-700 mt-1">
                Commodities
              </div>
              {currencyPairs.slice(10, 14).map((pair) => (
                <SelectItem
                  key={pair.value}
                  value={pair.value}
                  className="focus:bg-gray-700 focus:text-cyan-400"
                >
                  {pair.label}
                </SelectItem>
              ))}

              <div className="p-2 text-xs font-semibold text-gray-400 border-b border-gray-700 mt-1">
                Cryptocurrencies
              </div>
              {currencyPairs.slice(14, 18).map((pair) => (
                <SelectItem
                  key={pair.value}
                  value={pair.value}
                  className="focus:bg-gray-700 focus:text-cyan-400"
                >
                  {pair.label}
                </SelectItem>
              ))}

              <div className="p-2 text-xs font-semibold text-gray-400 border-b border-gray-700 mt-1">
                Indices
              </div>
              {currencyPairs.slice(18).map((pair) => (
                <SelectItem
                  key={pair.value}
                  value={pair.value}
                  className="focus:bg-gray-700 focus:text-cyan-400"
                >
                  {pair.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom pair input */}
          <div className="mt-2">
            <Label htmlFor="custom-pair" className="text-gray-300 text-sm">
              Or enter custom pair
            </Label>
            <Input
              id="custom-pair"
              value={customPair}
              onChange={(e) => {
                setCustomPair(e.target.value)
                setPair("") // Clear selected pair when entering custom
              }}
              placeholder="e.g., EUR/CAD"
              className="bg-gray-800 border-gray-700 text-white focus-visible:ring-cyan-500 mt-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">Date</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-cyan-400 transition-colors duration-200",
                  !date && "text-gray-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "MMMM dd, yyyy")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <div className="p-0 bg-gray-900 border border-gray-800 rounded-md">
                <DatePicker
                  selected={date}
                  onChange={(newDate) => {
                    if (newDate) {
                      setDate(newDate)
                      setCalendarOpen(false)
                    }
                  }}
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

        <div className="space-y-1">
          <Label htmlFor="direction" className="text-gray-300">
            Direction
          </Label>
          <RadioGroup
            value={direction}
            onValueChange={(value) => setDirection(value as "buy" | "sell")}
            className="flex space-x-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="buy"
                id="buy"
                className="text-emerald-400 border-emerald-400 focus:ring-emerald-400"
              />
              <Label htmlFor="buy" className="text-emerald-400">
                Buy
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="sell"
                id="sell"
                className="text-red-400 border-red-400 focus:ring-red-400"
              />
              <Label htmlFor="sell" className="text-red-400">
                Sell
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="risk" className="text-gray-300">
              Percentage Risk
            </Label>
            <div className="relative">
              <Input
                id="risk"
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                placeholder="1.5"
                className="bg-gray-800 border-gray-700 text-white focus-visible:ring-cyan-500 pr-8 transition-colors duration-200"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">%</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="riskReward" className="text-gray-300">
              Risk:Reward Ratio
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-gray-400">1:</div>
              <Input
                id="riskReward"
                value={riskRewardRatio}
                onChange={(e) => {
                  // Only allow numbers and decimal points
                  const value = e.target.value.replace(/[^0-9.]/g, "")
                  setRiskRewardRatio(value)
                }}
                placeholder="2"
                className="bg-gray-800 border-gray-700 text-white focus-visible:ring-cyan-500 pl-8 transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="result" className="text-gray-300">
            Result
          </Label>
          <RadioGroup
            value={result}
            onValueChange={(value) => {
              setResult(value as "win" | "loss" | "breakeven")
              // Reset manual input when changing to breakeven
              if (value === "breakeven") {
                setManualProfitLoss("")
              }
            }}
            className="flex space-x-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="win"
                id="win"
                className="text-emerald-400 border-emerald-400 focus:ring-emerald-400"
              />
              <Label htmlFor="win" className="text-emerald-400">
                Win
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="loss"
                id="loss"
                className="text-red-400 border-red-400 focus:ring-red-400"
              />
              <Label htmlFor="loss" className="text-red-400">
                Loss
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="breakeven"
                id="breakeven"
                className="text-yellow-400 border-yellow-400 focus:ring-yellow-400"
              />
              <Label htmlFor="breakeven" className="text-yellow-400">
                Break Even
              </Label>
            </div>
          </RadioGroup>
        </div>

        {result !== "breakeven" && (
          <div className="space-y-1">
            <Label className="text-gray-300">Profit/Loss Amount</Label>
            <div className="mt-2">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <Input
                  value={manualProfitLoss}
                  onChange={(e) => {
                    // Remove $ and any non-numeric characters except decimal point
                    const value = e.target.value.replace(/[^\d.]/g, "")
                    // Ensure only one decimal point
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setManualProfitLoss(value)
                    }
                  }}
                  className="bg-gray-800 border-gray-700 text-white focus-visible:ring-cyan-500 pl-8"
                  placeholder="Enter amount"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Enter the amount you {result === "win" ? "won" : "lost"}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="duration" className="text-gray-300">
            Trade Duration
          </Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white focus:ring-cyan-500 transition-colors duration-200">
              <SelectValue placeholder="Select trade duration" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {durationOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="focus:bg-gray-700 focus:text-cyan-400"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="screenshot" className="text-gray-300">
            Trade Screenshot
          </Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="screenshot-upload"
              className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
            >
              {screenshot ? (
                <img
                  src={screenshot || "/placeholder.svg"}
                  alt="Trade screenshot"
                  className="h-full w-auto max-w-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-3 pb-3">
                  <svg
                    className="w-6 h-6 mb-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                </div>
              )}
              <input
                id="screenshot-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="notes" className="text-gray-300">
            Trade Notes
          </Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your trade notes here..."
            className="w-full min-h-[60px] rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 transition-colors duration-200"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white transition-all duration-300"
        >
          {isSubmitting ? "Saving..." : "Save Trade"}
        </Button>
      </CardFooter>
    </Card>
  )
}
