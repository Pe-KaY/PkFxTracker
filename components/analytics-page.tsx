"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Download } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { PerformanceChart } from "@/components/charts/performance-chart"
import { WinRateChart } from "@/components/charts/win-rate-chart"
import { PairPerformanceChart } from "@/components/charts/pair-performance-chart"
import { TradeDurationChart } from "@/components/charts/trade-duration-chart"
import { RiskRewardChart } from "@/components/charts/risk-reward-chart"
import { SessionAnalysisChart } from "@/components/charts/session-analysis-chart"

export function AnalyticsPage() {
  const [date, setDate] = useState<Date>()

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar activePage="analytics" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-950 to-gray-900">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
                  Analytics
                </h1>
                <p className="text-gray-400">Analyze your trading performance and patterns</p>
              </div>
              <div className="flex items-center gap-3">
                <Select defaultValue="30days">
                  <SelectTrigger className="w-[180px] bg-gray-900 border-gray-800 text-white">
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal bg-gray-900 border-gray-800 text-white",
                        !date && "text-gray-400",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Custom date range</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-800">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="bg-gray-900 text-white"
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" className="bg-gray-900 border-gray-800 text-white">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-gray-900 border border-gray-800">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-cyan-400"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-cyan-400"
                >
                  Performance
                </TabsTrigger>
                <TabsTrigger
                  value="pairs"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-cyan-400"
                >
                  Currency Pairs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Profit/Loss Over Time
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Your trading performance over the selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <PerformanceChart />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Win/Loss Ratio
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Distribution of winning and losing trades
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <WinRateChart />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Currency Pair Performance
                      </CardTitle>
                      <CardDescription className="text-gray-400">Profit/loss by currency pair</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <PairPerformanceChart />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Trade Duration Analysis
                      </CardTitle>
                      <CardDescription className="text-gray-400">Performance by trade holding time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <TradeDurationChart />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Risk/Reward Ratio
                      </CardTitle>
                      <CardDescription className="text-gray-400">Analysis of your risk management</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <RiskRewardChart />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Trading Session Analysis
                      </CardTitle>
                      <CardDescription className="text-gray-400">Performance by time of day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <SessionAnalysisChart />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      Detailed Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[500px]">
                      <PerformanceChart detailed />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pairs" className="space-y-6">
                <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      Currency Pair Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[500px]">
                      <PairPerformanceChart detailed />
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

