"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { TradeForm } from "@/components/trade-form"
import { TradeHistory } from "@/components/trade-history"
import { StatsCards } from "@/components/stats-cards"
import { useAccounts } from "@/components/account-context"
import { Button } from "@/components/ui/button"
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
import { useToast } from "@/hooks/use-toast"
import { DollarSign, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"

export default function DashboardPage() {
  const { toast } = useToast()
  const { selectedAccountId, accounts, addAccount } = useAccounts()
  const router = useRouter()
  const [newAccountName, setNewAccountName] = useState("")
  const [newAccountSize, setNewAccountSize] = useState("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login")
      } else {
        setMounted(true)
      }
    })

    return () => {
      setMounted(false)
      unsubscribe()
    }
  }, [router])

  const handleAddAccount = () => {
    if (!newAccountName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter an account name",
        variant: "destructive",
      })
      return
    }

    if (
      !newAccountSize ||
      isNaN(Number.parseFloat(newAccountSize)) ||
      Number.parseFloat(newAccountSize) <= 0
    ) {
      toast({
        title: "Invalid account size",
        description: "Please enter a valid account size",
        variant: "destructive",
      })
      return
    }

    addAccount({
      name: newAccountName,
      size: Number.parseFloat(newAccountSize),
      currency: "USD",
    })

    setNewAccountName("")
    setNewAccountSize("")

    toast({
      title: "Account added",
      description: "Your new trading account has been added",
    })
  }

  // Return empty div while mounting to maintain layout
  if (!mounted) {
    return (
      <div className="flex h-screen bg-black text-white overflow-hidden">
        <Sidebar
          activePage="dashboard"
          showMobile={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setShowMobileMenu(!showMobileMenu)} />
          <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-950 to-gray-900">
            <div className="max-w-7xl mx-auto space-y-6">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
                Trading Dashboard
              </h1>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar
        activePage="dashboard"
        showMobile={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setShowMobileMenu(!showMobileMenu)} />
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-950 to-gray-900">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
              Trading Dashboard
            </h1>

            {accounts.length === 0 ? (
              <div className="flex justify-center items-center">
                <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 max-w-md w-full">
                  <CardHeader>
                    <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      Welcome to pe-Kay FX Tracker
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Let's get started by creating your first trading account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="account-name" className="text-gray-300">
                        Account Name
                      </Label>
                      <Input
                        id="account-name"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        placeholder="Main Trading Account"
                        className="bg-gray-800 border-gray-700 text-white focus-visible:ring-cyan-500 transition-colors duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account-size" className="text-gray-300">
                        Account Size
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="account-size"
                          value={newAccountSize}
                          onChange={(e) => setNewAccountSize(e.target.value)}
                          placeholder="10000"
                          className="bg-gray-800 border-gray-700 text-white focus-visible:ring-cyan-500 pl-9 transition-colors duration-200"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleAddAccount}
                      className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Account
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <>
                <StatsCards />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedAccountId ? (
                    <>
                      <TradeForm />
                      <TradeHistory />
                    </>
                  ) : (
                    <div className="lg:col-span-2 p-6 bg-gray-900 border border-gray-800 rounded-lg text-center transition-all duration-300">
                      <h2 className="text-xl font-bold text-white mb-2">
                        No Account Selected
                      </h2>
                      <p className="text-gray-400">
                        Please select an account from the sidebar to view your
                        dashboard
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
