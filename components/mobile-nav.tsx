"use client"

import { useAccounts } from "@/components/account-context"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart3,
  Clock,
  DollarSign,
  Home,
  Settings,
  TrendingUp,
  X,
  Menu,
} from "lucide-react"
import Link from "next/link"

interface MobileNavProps {
  isOpen?: boolean
  onClose?: () => void
  onMenuClick: () => void
}

export function MobileNav({ isOpen, onClose, onMenuClick }: MobileNavProps) {
  const { accounts, selectedAccountId, selectAccount } = useAccounts()

  if (isOpen !== undefined && !isOpen) return null

  if (isOpen === undefined) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-gray-400 hover:text-white"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle menu</span>
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden">
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-gray-950 border-r border-gray-800 shadow-xl animate-in slide-in-from-left">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              pe-Kay FX Tracker
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-4 py-4">
            <Select
              value={selectedAccountId || undefined}
              onValueChange={selectAccount}
            >
              <SelectTrigger className="w-full bg-gray-900 border-gray-800 text-white">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-white">
                {accounts.map((account) => (
                  <SelectItem
                    key={account.id}
                    value={account.id}
                    className="focus:bg-gray-800 focus:text-cyan-400"
                  >
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-auto">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-900 transition-colors"
              onClick={onClose}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/trades"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-900 transition-colors"
              onClick={onClose}
            >
              <TrendingUp className="h-5 w-5" />
              <span>Trades</span>
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-900 transition-colors"
              onClick={onClose}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-900 transition-colors"
              onClick={onClose}
            >
              <Clock className="h-5 w-5" />
              <span>History</span>
            </Link>
            <Link
              href="/accounts"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-900 transition-colors"
              onClick={onClose}
            >
              <DollarSign className="h-5 w-5" />
              <span>Accounts</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-900 transition-colors"
              onClick={onClose}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                T
              </div>
              <div>
                <p className="text-sm font-medium">Trader</p>
                <p className="text-xs text-gray-500">Pro Account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
