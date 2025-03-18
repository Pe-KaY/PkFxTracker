"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccounts } from "@/components/account-context"
import { PerformanceChart } from "@/components/charts/performance-chart"
import { WinRateChart } from "@/components/charts/win-rate-chart"
import { PairPerformanceChart } from "@/components/charts/pair-performance-chart"
import { RiskRewardChart } from "@/components/charts/risk-reward-chart"

export default function PerformancePage() {
  const { selectedAccountId } = useAccounts()

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar activePage="performance" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-950 to-gray-900">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
              Performance
            </h1>

            {!selectedAccountId ? (
              <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">Please select an account to view performance metrics</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Profit/Loss Over Time
                      </CardTitle>
                      <CardDescription className="text-gray-400">Your trading performance over time</CardDescription>
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
                        Risk/Reward Analysis
                      </CardTitle>
                      <CardDescription className="text-gray-400">Performance by risk:reward ratio</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <RiskRewardChart />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

