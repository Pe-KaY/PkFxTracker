"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAccounts } from "@/components/account-context"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { DollarSign, Filter, Plus, Trash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

export default function AccountsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const {
    accounts,
    addAccount,
    selectAccount,
    calculateAccountStats,
    removeAccount,
  } = useAccounts()

  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [newAccountName, setNewAccountName] = useState("")
  const [newAccountSize, setNewAccountSize] = useState("")
  const [newAccountCurrency, setNewAccountCurrency] = useState("USD")
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [mounted, setMounted] = useState(false)

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

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
      currency: newAccountCurrency,
    })

    setIsAddingAccount(false)
    setNewAccountName("")
    setNewAccountSize("")

    toast({
      title: "Account added",
      description: "Your new trading account has been added",
    })
  }

  const handleSelectAccount = (accountId: string) => {
    selectAccount(accountId)
    toast({
      title: "Account selected",
      description: "You are now working with this account",
    })
  }

  const handleDeleteAccount = (accountId: string) => {
    removeAccount(accountId)
    setAccountToDelete(null)
    toast({
      title: "Account deleted",
      description: "The account and all its trades have been removed",
    })
  }

  // Calculate accounts in profit, loss, and breakeven
  const accountsInProfit = accounts.filter((account) => {
    const stats = calculateAccountStats(account.id)
    return stats.totalProfit > 0
  }).length

  const accountsInLoss = accounts.filter((account) => {
    const stats = calculateAccountStats(account.id)
    return stats.totalProfit < 0
  }).length

  const accountsInBreakeven = accounts.filter((account) => {
    const stats = calculateAccountStats(account.id)
    return stats.totalProfit === 0
  }).length

  // Filter accounts based on profit/loss/breakeven
  const filteredAccounts = accounts.filter((account) => {
    const stats = calculateAccountStats(account.id)

    if (filterType === "profit") {
      return stats.totalProfit > 0
    } else if (filterType === "loss") {
      return stats.totalProfit < 0
    } else if (filterType === "breakeven") {
      return stats.totalProfit === 0
    }

    return true // "all" filter
  })

  const totalProfitFromProfitableAccounts = accounts.reduce(
    (total, account) => {
      const stats = calculateAccountStats(account.id)
      return stats.totalProfit > 0 ? total + stats.totalProfit : total
    },
    0
  )

  // Don't render until component is mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // If no accounts exist, show a message and prompt to create one
  if (accounts.length === 0) {
    return (
      <div className="flex h-screen bg-black text-white overflow-hidden">
        <Sidebar
          activePage="accounts"
          showMobile={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setShowMobileMenu(!showMobileMenu)} />
          <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-950 to-gray-900">
            <div className="max-w-7xl mx-auto space-y-6">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
                Trading Accounts
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    No Accounts Found
                  </h2>
                  <p className="text-gray-400 mb-6 max-w-md">
                    You haven't created any trading accounts yet. Create your
                    first account to start tracking your trades.
                  </p>
                  <Button
                    onClick={() => setIsAddingAccount(true)}
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create Account
                  </Button>
                </CardContent>
              </Card>

              {isAddingAccount && (
                <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      Add New Account
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Enter your trading account details
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
                  <CardFooter className="flex justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingAccount(false)
                        toast({
                          title: "Cancelled",
                          description: "Account creation cancelled",
                        })
                      }}
                      className="flex-1 bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white transition-colors duration-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddAccount}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
                    >
                      Add Account
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar
        activePage="accounts"
        showMobile={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setShowMobileMenu(!showMobileMenu)} />
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-950 to-gray-900">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
                  Trading Accounts
                </h1>
                <p className="text-gray-400">Manage your trading accounts</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-gray-900 border-gray-800 text-white">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter accounts" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800 text-white">
                    <SelectItem value="all">All Accounts</SelectItem>
                    <SelectItem value="profit">Accounts in Profit</SelectItem>
                    <SelectItem value="loss">Accounts in Loss</SelectItem>
                    <SelectItem value="breakeven">
                      Accounts in Breakeven
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    setIsAddingAccount(true)
                    toast({
                      title: "Add Account",
                      description:
                        "Fill in the details to create a new trading account",
                    })
                  }}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Account
                </Button>
              </div>
            </div>

            {/* Account Summary Card */}
            <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  Account Summary
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Overview of your trading accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Total Accounts</p>
                    <p className="text-2xl font-bold text-white">
                      {accounts.length}
                    </p>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>
                        In Profit:{" "}
                        <span className="text-emerald-400">
                          {accountsInProfit}
                        </span>
                      </span>
                      <span>
                        In Loss:{" "}
                        <span className="text-red-400">{accountsInLoss}</span>
                      </span>
                      <span>
                        Breakeven:{" "}
                        <span className="text-yellow-400">
                          {accountsInBreakeven}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">
                      Total Profit (Profitable Accounts)
                    </p>
                    <p className="text-2xl font-bold text-emerald-400">
                      +${totalProfitFromProfitableAccounts.toFixed(2)}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      From {accountsInProfit} profitable{" "}
                      {accountsInProfit === 1 ? "account" : "accounts"}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Current Filter</p>
                    <p className="text-xl font-bold text-white capitalize">
                      {filterType === "all"
                        ? "All Accounts"
                        : filterType === "profit"
                        ? "Accounts in Profit"
                        : filterType === "loss"
                        ? "Accounts in Loss"
                        : "Accounts in Breakeven"}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      Showing {filteredAccounts.length} of {accounts.length}{" "}
                      accounts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {filteredAccounts.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">
                    No accounts match your current filter. Try changing the
                    filter or create a new account.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAccounts.map((account) => {
                  const stats = calculateAccountStats(account.id)
                  const currentBalance = account.size + stats.totalProfit

                  return (
                    <Card
                      key={account.id}
                      className={`bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 ${
                        stats.totalProfit > 0
                          ? "border-l-4 border-l-emerald-500"
                          : stats.totalProfit < 0
                          ? "border-l-4 border-l-red-500"
                          : "border-l-4 border-l-yellow-500"
                      }`}
                    >
                      <CardHeader>
                        <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                          {account.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Created on {format(account.createdAt, "MMM dd, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">
                            Starting Balance:
                          </span>
                          <span className="font-medium text-white">
                            ${account.size.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">
                            Current Balance:
                          </span>
                          <span className="font-medium text-white">
                            ${currentBalance.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">
                            Total Profit/Loss:
                          </span>
                          <span
                            className={`font-medium ${
                              stats.totalProfit > 0
                                ? "text-emerald-400"
                                : stats.totalProfit < 0
                                ? "text-red-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {stats.totalProfit > 0
                              ? "+"
                              : stats.totalProfit < 0
                              ? ""
                              : "±"}
                            {stats.totalProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Win Rate:</span>
                          <span className="font-medium text-white">
                            {stats.winRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Trades:</span>
                          <span className="font-medium text-white">
                            {stats.totalTrades}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button
                          onClick={() => handleSelectAccount(account.id)}
                          className="flex-1 bg-gray-800 text-white hover:bg-gray-700 hover:text-cyan-400 transition-colors duration-200"
                        >
                          Select Account
                        </Button>
                        <Button
                          onClick={() => setAccountToDelete(account.id)}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700 transition-colors duration-200"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}

                {isAddingAccount && (
                  <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Add New Account
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Enter your trading account details
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
                    <CardFooter className="flex justify-between gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingAccount(false)
                          toast({
                            title: "Cancelled",
                            description: "Account creation cancelled",
                          })
                        }}
                        className="flex-1 bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white transition-colors duration-200"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddAccount}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
                      >
                        Add Account
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog
        open={!!accountToDelete}
        onOpenChange={(open) => !open && setAccountToDelete(null)}
      >
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete this account? This will also
              remove all trades associated with this account. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white transition-colors duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                accountToDelete && handleDeleteAccount(accountToDelete)
              }
              className="bg-red-600 hover:bg-red-700 transition-colors duration-200"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
