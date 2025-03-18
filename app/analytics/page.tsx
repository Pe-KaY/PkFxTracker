"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Download, PlusCircle } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, subDays, startOfYear } from "date-fns"
import { PerformanceChart } from "@/components/charts/performance-chart"
import { WinRateChart } from "@/components/charts/win-rate-chart"
import { PairPerformanceChart } from "@/components/charts/pair-performance-chart"
import { TradeDurationChart } from "@/components/charts/trade-duration-chart"
import { RiskRewardChart } from "@/components/charts/risk-reward-chart"
import { DaysOfWeekChart } from "@/components/charts/days-of-week-chart"
import { useToast } from "@/hooks/use-toast"
import { useAccounts } from "@/components/account-context"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

// Dynamically import html2canvas and jsPDF with no SSR
const html2canvas = dynamic(() => import("html2canvas"), { ssr: false })
const jsPDF = dynamic(() => import("jspdf"), { ssr: false })

export default function AnalyticsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { selectedAccountId, getTradesByAccountId, accounts, getAccountById } =
    useAccounts()
  const [date, setDate] = useState<Date | undefined>()
  const [period, setPeriod] = useState("30days")
  const [filteredTrades, setFilteredTrades] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const analyticsRef = useRef<HTMLDivElement>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Get all trades for the selected account - memoize this to prevent infinite loops
  const allTrades = useMemo(() => {
    return selectedAccountId ? getTradesByAccountId(selectedAccountId) : []
  }, [selectedAccountId, getTradesByAccountId])

  // Filter trades based on selected period
  useEffect(() => {
    if (!selectedAccountId) {
      setFilteredTrades([])
      return
    }

    let startDate: Date | null = null

    switch (period) {
      case "7days":
        startDate = subDays(new Date(), 7)
        break
      case "30days":
        startDate = subDays(new Date(), 30)
        break
      case "90days":
        startDate = subDays(new Date(), 90)
        break
      case "year":
        startDate = startOfYear(new Date())
        break
      case "all":
        startDate = null
        break
      default:
        if (period) {
          startDate = subDays(new Date(), 30)
        }
    }

    // If a specific date is selected, use that instead
    if (date) {
      startDate = date
    }

    // Filter trades based on date
    const filtered = startDate
      ? allTrades.filter((trade) => {
          const tradeDate =
            trade.date instanceof Date ? trade.date : new Date(trade.date)
          return tradeDate >= startDate!
        })
      : allTrades

    setFilteredTrades(filtered)
  }, [selectedAccountId, period, date, allTrades])

  const handleDownload = async () => {
    if (!analyticsRef.current || !mounted) return

    setIsDownloading(true)
    toast({
      title: "Analytics Export",
      description: "Your analytics data is being prepared for download",
    })

    try {
      // Dynamically import the required libraries
      const html2canvasModule = await import("html2canvas")
      const jsPDFModule = await import("jspdf")

      const html2canvasFunc = html2canvasModule.default
      const jsPDFClass = jsPDFModule.default

      // Get account name for the PDF title
      const accountName = selectedAccountId
        ? getAccountById(selectedAccountId)?.name || "Account"
        : "All Accounts"

      // Create a PDF document
      const pdf = new jsPDFClass("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()

      // Add title
      pdf.setFontSize(20)
      pdf.setTextColor(100, 100, 255)
      pdf.text(`${accountName} Analytics Report`, pageWidth / 2, 15, {
        align: "center",
      })

      // Add date
      pdf.setFontSize(12)
      pdf.setTextColor(100, 100, 100)
      pdf.text(
        `Generated on ${format(new Date(), "MMMM dd, yyyy")}`,
        pageWidth / 2,
        22,
        { align: "center" }
      )

      // Add period info
      let periodText = ""
      switch (period) {
        case "7days":
          periodText = "Last 7 days"
          break
        case "30days":
          periodText = "Last 30 days"
          break
        case "90days":
          periodText = "Last 90 days"
          break
        case "year":
          periodText = "This year"
          break
        case "all":
          periodText = "All time"
          break
        default:
          periodText = date
            ? `Custom date: ${format(date, "MMMM dd, yyyy")}`
            : "Custom period"
      }
      pdf.text(`Period: ${periodText}`, pageWidth / 2, 29, { align: "center" })

      // Add separator line
      pdf.setDrawColor(200, 200, 200)
      pdf.line(20, 35, pageWidth - 20, 35)

      // Capture each chart section
      const chartContainers =
        analyticsRef.current.querySelectorAll(".chart-container")
      let yPosition = 40

      for (let i = 0; i < chartContainers.length; i++) {
        const container = chartContainers[i] as HTMLElement
        const title =
          container.querySelector(".chart-title")?.textContent ||
          `Chart ${i + 1}`

        // Capture the chart
        const canvas = await html2canvasFunc(container, {
          scale: 2,
          backgroundColor: "#111111",
          logging: false,
        })

        // If we're going to exceed page height, add a new page
        if (yPosition > 230) {
          pdf.addPage()
          yPosition = 20
        }

        // Add chart title
        pdf.setFontSize(14)
        pdf.setTextColor(150, 150, 255)
        pdf.text(title, 20, yPosition)
        yPosition += 7

        // Add the chart image
        const imgData = canvas.toDataURL("image/png")
        const imgWidth = pageWidth - 40
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        pdf.addImage(imgData, "PNG", 20, yPosition, imgWidth, imgHeight)
        yPosition += imgHeight + 15
      }

      // Save the PDF
      pdf.save(
        `${accountName.replace(/\s+/g, "_")}_Analytics_${format(
          new Date(),
          "yyyy-MM-dd"
        )}.pdf`
      )

      toast({
        title: "Export Complete",
        description: "Your analytics data has been exported successfully",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Export Failed",
        description:
          "There was an error exporting your analytics data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
    // Reset custom date when period changes
    setDate(undefined)

    toast({
      title: "Period Changed",
      description: `Analytics data updated for ${
        value === "7days"
          ? "last 7 days"
          : value === "30days"
          ? "last 30 days"
          : value === "90days"
          ? "last 90 days"
          : value === "year"
          ? "this year"
          : "all time"
      }`,
    })
  }

  // Don't render until component is mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // If no accounts exist, show a message
  if (accounts.length === 0) {
    return (
      <div className="flex h-screen bg-black text-white overflow-hidden">
        <Sidebar
          activePage="analytics"
          showMobile={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setShowMobileMenu(!showMobileMenu)} />
          <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-950 to-gray-900">
            <div className="max-w-7xl mx-auto space-y-6">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
                Analytics
              </h1>

              <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 mb-6 text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    No Accounts Found
                  </h2>
                  <p className="text-gray-400 mb-6 max-w-md">
                    You need to create at least one trading account before you
                    can view analytics.
                  </p>
                  <Button
                    onClick={() => router.push("/accounts")}
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar
        activePage="analytics"
        showMobile={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setShowMobileMenu(!showMobileMenu)} />
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-950 to-gray-900">
          <div className="max-w-7xl mx-auto space-y-6" ref={analyticsRef}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
                  Analytics
                </h1>
                <p className="text-gray-400">
                  Analyze your trading performance and patterns
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={period} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-[180px] bg-gray-900 border-gray-800 text-white transition-colors duration-200">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800 text-white">
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-cyan-400 transition-colors duration-200",
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
                            toast({
                              title: "Date Selected",
                              description: format(newDate, "MMMM dd, yyyy"),
                            })
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
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-gray-900 border-gray-800 text-white transition-colors duration-200"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Tabs
              defaultValue="overview"
              className="space-y-6"
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value)
                toast({
                  title: "Tab Changed",
                  description: `Viewing ${
                    value.charAt(0).toUpperCase() + value.slice(1)
                  } analytics`,
                })
              }}
            >
              <TabsList className="bg-gray-900 border border-gray-800 transition-colors duration-200">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-cyan-400 transition-colors duration-200"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-cyan-400 transition-colors duration-200"
                >
                  Performance
                </TabsTrigger>
                <TabsTrigger
                  value="pairs"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-cyan-400 transition-colors duration-200"
                >
                  Currency Pairs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 chart-container">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 chart-title">
                        Profit/Loss Over Time
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Your trading performance over the selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <PerformanceChart data={filteredTrades} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 chart-container">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 chart-title">
                        Win/Loss Ratio
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Distribution of winning and losing trades
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <WinRateChart data={filteredTrades} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 chart-container">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 chart-title">
                        Currency Pair Performance
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Profit/loss by currency pair
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <PairPerformanceChart data={filteredTrades} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 chart-container">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 chart-title">
                        Trade Duration Analysis
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Performance by trade holding time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <TradeDurationChart data={filteredTrades} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 chart-container">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 chart-title">
                        Risk/Reward Ratio
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Analysis of your risk management
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <RiskRewardChart data={filteredTrades} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 chart-container">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 chart-title">
                        Days of the Week Analysis
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Performance by day of the week
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <DaysOfWeekChart data={filteredTrades} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 chart-container">
                  <CardHeader>
                    <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 chart-title">
                      Detailed Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[500px]">
                      <PerformanceChart data={filteredTrades} detailed />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pairs" className="space-y-6">
                <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 chart-container">
                  <CardHeader>
                    <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 chart-title">
                      Currency Pair Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[500px]">
                      <PairPerformanceChart data={filteredTrades} detailed />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
