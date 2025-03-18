"use client"

import { useState } from "react"
import { useAccounts } from "@/components/account-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { useSound } from "@/hooks/useSound"
import confetti from "canvas-confetti"
import {
  ArrowUpRight,
  TrendingUp,
  Wallet,
  History,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"

export default function ProfitWithdrawalPage() {
  const { toast } = useToast()
  const {
    getProfitableAccounts,
    calculateAccountStats,
    getTotalWithdrawnProfit,
    withdrawProfitAndReset,
    withdrawAndRemoveAccount,
    accounts,
  } = useAccounts()

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const profitableAccounts = getProfitableAccounts()
  const totalWithdrawnProfit = getTotalWithdrawnProfit()

  // Get accounts that have had profits withdrawn
  const accountsWithWithdrawnProfits = accounts.filter(
    (account) => account.totalWithdrawn && account.totalWithdrawn > 0
  )

  // Count of accounts with withdrawn profits
  const withdrawnProfitsCount = accountsWithWithdrawnProfits.length

  // Initialize sound effect
  const playCashSound = useSound("/sounds/cash.mp3", 0.5)

  const triggerConfetti = () => {
    // Fire multiple confetti bursts
    const count = 3
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0.5,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#26E8A0", "#34D399", "#10B981", "#059669", "#047857"],
    }

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    })
    fire(0.2, {
      spread: 60,
    })
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    })
  }

  const handleWithdraw = async (accountId: string) => {
    setSelectedAccountId(accountId)
    try {
      const withdrawnAmount = await withdrawProfitAndReset(accountId)
      if (withdrawnAmount > 0) {
        // Trigger confetti effect
        triggerConfetti()
        // Play cash sound
        playCashSound()

        toast({
          title: "🎉 Congratulations on Your Payout! 🎉",
          description: (
            <div className="space-y-3">
              <div className="text-2xl font-bold text-emerald-400">
                {formatCurrency(withdrawnAmount)}
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-lg text-white">
                  Congratulations on your successful payout! 💰
                </p>
                <p className="text-gray-300">
                  Your profits have been withdrawn and your account has been
                  reset.
                </p>
                <p className="text-emerald-400 font-medium">
                  Keep up the amazing trading! 📈
                </p>
              </div>
            </div>
          ),
          duration: 8000,
        })
      }
    } catch (error) {
      toast({
        title: "Error withdrawing profit",
        description:
          "An error occurred while withdrawing profit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSelectedAccountId(null)
    }
  }

  const handleWithdrawAndRemove = (accountId: string) => {
    const withdrawnAmount = withdrawAndRemoveAccount(accountId)
    setIsDialogOpen(false)
    toast({
      title: "Account Removed",
      description: `Successfully withdrew ${formatCurrency(
        withdrawnAmount
      )} and removed the account.`,
    })
  }

  // Calculate total profit percentage across all accounts
  const calculateTotalProfitPercentage = () => {
    const totalAccountSize = accounts.reduce(
      (sum, account) => sum + account.size,
      0
    )
    const totalProfit = accounts.reduce(
      (sum, account) => sum + (account.totalWithdrawn || 0),
      0
    )
    return totalAccountSize > 0
      ? ((totalProfit / totalAccountSize) * 100).toFixed(1)
      : "0"
  }

  // Calculate highest single withdrawal
  const calculateHighestWithdrawal = () => {
    return accounts.reduce(
      (max, account) => Math.max(max, account.totalWithdrawn || 0),
      0
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
            Profit Withdrawal
          </h2>
          <p className="text-muted-foreground">
            Manage your profits and account withdrawals
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Withdrawn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {totalWithdrawnProfit > 0
                      ? formatCurrency(totalWithdrawnProfit)
                      : "None"}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {withdrawnProfitsCount > 0
                      ? `From ${withdrawnProfitsCount} ${
                          withdrawnProfitsCount === 1 ? "account" : "accounts"
                        }`
                      : "No withdrawals yet"}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-emerald-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Profit %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {calculateTotalProfitPercentage()}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Overall return</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Highest Withdrawal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {calculateHighestWithdrawal() > 0
                      ? formatCurrency(calculateHighestWithdrawal())
                      : "None"}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {calculateHighestWithdrawal() > 0
                      ? "Single withdrawal"
                      : "No withdrawals yet"}
                  </p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-cyan-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Profitable Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {profitableAccounts.length}
                    <span className="text-sm text-gray-400 ml-1">
                      / {accounts.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ready for withdrawal
                  </p>
                </div>
                <History className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Profitable Accounts Section */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Profitable Accounts
            </h3>
            <span className="text-sm text-gray-400">
              {profitableAccounts.length} accounts available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profitableAccounts.map((account) => {
              const stats = calculateAccountStats(account.id)
              return (
                <Card
                  key={account.id}
                  className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] group transition-all duration-300"
                >
                  <CardHeader className="text-center relative">
                    <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      {account.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Account Size: {formatCurrency(account.size)}
                    </CardDescription>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ChevronRight className="h-4 w-4 text-cyan-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-emerald-400">
                          {formatCurrency(stats.totalProfit)}
                        </p>
                        <p className="text-sm text-gray-400">Current Profit</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                        <div>
                          <p className="text-sm text-gray-400">Win Rate</p>
                          <p className="text-lg font-semibold text-white">
                            {stats.winRate.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total Trades</p>
                          <p className="text-lg font-semibold text-white">
                            {stats.totalTrades}
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-800">
                        <p className="text-sm text-gray-400">
                          Previously Withdrawn
                        </p>
                        <p className="text-lg font-semibold text-emerald-400">
                          {account.totalWithdrawn && account.totalWithdrawn > 0
                            ? formatCurrency(account.totalWithdrawn)
                            : "None"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button
                      onClick={() => handleWithdraw(account.id)}
                      disabled={selectedAccountId === account.id}
                      className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 group-hover:scale-105"
                    >
                      {selectedAccountId === account.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Withdrawing...
                        </>
                      ) : (
                        "Withdraw Profit"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}

            {profitableAccounts.length === 0 && (
              <Card className="col-span-full bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                <CardHeader className="text-center">
                  <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    No Profitable Accounts
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    There are currently no accounts with profits available for
                    withdrawal.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>

          {/* Accounts with Withdrawn Profits Section */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Accounts with Withdrawn Profits
            </h3>
            <span className="text-sm text-gray-400">
              {accountsWithWithdrawnProfits.length} accounts
            </span>
          </div>

          {accountsWithWithdrawnProfits.length > 0 ? (
            <div className="space-y-4">
              {accountsWithWithdrawnProfits.map((account) => (
                <Card
                  key={account.id}
                  className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                          {account.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          Account Size: {formatCurrency(account.size)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-400">
                          {formatCurrency(account.totalWithdrawn || 0)}
                        </p>
                        <p className="text-sm text-gray-400">Total Withdrawn</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
                      <div>
                        <p className="text-sm text-gray-400">Last Withdrawal</p>
                        <p className="text-base font-medium text-white">
                          {account.lastSynced
                            ? format(
                                account.lastSynced instanceof Date
                                  ? account.lastSynced
                                  : new Date(account.lastSynced),
                                "MMM dd, yyyy"
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">% of Account</p>
                        <p className="text-base font-medium text-white">
                          {(
                            ((account.totalWithdrawn || 0) / account.size) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Current Balance</p>
                        <p className="text-base font-medium text-white">
                          {formatCurrency(account.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <CardHeader className="text-center">
                <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  No Withdrawn Profits
                </CardTitle>
                <CardDescription className="text-gray-400">
                  No accounts have withdrawn profits yet.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
