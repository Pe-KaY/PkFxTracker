"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { useAccounts, type Trade } from "@/components/account-context"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Textarea } from "@/components/ui/textarea"

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

// Helper function to find pair value from label
const getPairValueFromLabel = (label: string) => {
  const pair = currencyPairs.find((p) => p.label === label)
  return pair ? pair.value : ""
}

interface TradeEditFormProps {
  trade: Trade
  onCancel: () => void
  onComplete: () => void
}

export function TradeEditForm({
  trade,
  onCancel,
  onComplete,
}: TradeEditFormProps) {
  const { toast } = useToast()
  const { updateTrade } = useAccounts()
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Ensure we're working with a Date object
  const tradeDate =
    trade.date instanceof Date ? trade.date : new Date(trade.date)

  const [date, setDate] = useState<Date | undefined>(tradeDate)
  const [pair, setPair] = useState(getPairValueFromLabel(trade.pair))
  const [direction, setDirection] = useState<"buy" | "sell">(trade.direction)
  const [risk, setRisk] = useState(trade.risk.toString())
  const [riskReward, setRiskReward] = useState(trade.riskReward)
  const [result, setResult] = useState<"win" | "loss">(trade.result)
  const [notes, setNotes] = useState(trade.notes)
  const [screenshot, setScreenshot] = useState<string | undefined>(
    trade.screenshot
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!pair) {
      toast({
        title: "Missing information",
        description: "Please select a currency pair",
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

    if (!riskReward || !riskReward.includes(":")) {
      toast({
        title: "Invalid risk:reward ratio",
        description: "Please enter a valid risk:reward ratio (e.g., 1:2)",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Find the pair label from the value
    const pairLabel = currencyPairs.find((p) => p.value === pair)?.label || pair

    try {
      updateTrade(trade.id, {
        pair: pairLabel,
        date: date,
        direction: direction,
        risk: Number.parseFloat(risk),
        riskReward: riskReward,
        result: result,
        notes: notes,
        screenshot: screenshot,
      })

      onComplete()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your trade",
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

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="pair" className="text-gray-300">
          Currency Pair
        </Label>
        <Select value={pair} onValueChange={setPair}>
          <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white focus:ring-cyan-500">
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
              {date ? format(date, "MMMM dd, yyyy") : <span>Pick a date</span>}
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
              className="bg-gray-800 border-gray-700 text-white focus-visible:ring-cyan-500 pr-8"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">%</span>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="riskReward" className="text-gray-300">
            Risk:Reward Ratio
          </Label>
          <div className="relative">
            <Input
              id="riskReward"
              value={riskReward}
              onChange={(e) => setRiskReward(e.target.value)}
              placeholder="1:2"
              className="bg-gray-800 border-gray-700 text-white focus-visible:ring-cyan-500"
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
          onValueChange={(value) => setResult(value as "win" | "loss")}
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
        </RadioGroup>
      </div>

      <div className="space-y-1">
        <Label htmlFor="screenshot" className="text-gray-300">
          Trade Screenshot
        </Label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="screenshot-upload"
            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer border-gray-700 bg-gray-800 hover:bg-gray-700"
          >
            {screenshot ? (
              <img
                src={screenshot || "/placeholder.svg"}
                alt="Trade screenshot"
                className="h-full w-auto max-w-full object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-3 text-gray-400"
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
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG or JPEG (MAX. 2MB)
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
          className="w-full min-h-[60px] rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
