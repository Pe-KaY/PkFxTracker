"use client"

import { useState } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const { toast } = useToast()
  const { resetAllAccounts, resetTotalWithdrawn, getTotalWithdrawnProfit } =
    useAccounts()
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isResetWithdrawnDialogOpen, setIsResetWithdrawnDialogOpen] =
    useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleResetAll = () => {
    resetAllAccounts()
    setIsResetDialogOpen(false)
    toast({
      title: "All data reset",
      description: "All accounts and trades have been removed",
    })
  }

  const handleResetWithdrawn = () => {
    resetTotalWithdrawn()
    setIsResetWithdrawnDialogOpen(false)
    toast({
      title: "Total withdrawn reset",
      description: "All withdrawn profits have been reset to zero",
      variant: "destructive",
    })
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar activePage="settings" showMobile={showMobileMenu} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setShowMobileMenu(!showMobileMenu)} />
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-950 to-gray-900">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
              Settings
            </h1>

            <Card className="bg-gray-900 border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <CardHeader>
                <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  Data Management
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your trading data and application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border border-yellow-800 bg-yellow-950/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-yellow-400">
                        Reset Total Withdrawn
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">
                        This will reset the total withdrawn profits to zero for
                        all accounts. The current total withdrawn amount is{" "}
                        {formatCurrency(getTotalWithdrawnProfit())}.
                      </p>
                      <AlertDialog
                        open={isResetWithdrawnDialogOpen}
                        onOpenChange={setIsResetWithdrawnDialogOpen}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="mt-4 border-yellow-800 hover:border-yellow-700 hover:bg-yellow-950/50"
                          >
                            Reset Total Withdrawn
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-yellow-400">
                              Reset total withdrawn profits?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              This will set all withdrawn profits back to zero.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleResetWithdrawn}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              Reset Withdrawn
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-red-800 bg-red-950/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-red-400">
                        Reset All Data
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">
                        This will permanently delete all your accounts and
                        trading history. This action cannot be undone.
                      </p>
                      <AlertDialog
                        open={isResetDialogOpen}
                        onOpenChange={setIsResetDialogOpen}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="mt-4 bg-red-600 hover:bg-red-700"
                          >
                            Reset All Data
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-400">
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              This action cannot be undone. This will
                              permanently delete all your accounts and trading
                              history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleResetAll}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reset All Data
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
