"use client"

import Link from "next/link"
import {
  BarChart3,
  Clock,
  DollarSign,
  Home,
  Settings,
  TrendingUp,
  X,
  Wallet,
  Calculator,
} from "lucide-react"
import { useAccounts } from "@/components/account-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"

interface SidebarProps {
  activePage?: string
  showMobile?: boolean
  onClose?: () => void
}

export function Sidebar({
  activePage = "dashboard",
  showMobile = false,
  onClose,
}: SidebarProps) {
  const { accounts, selectedAccountId, selectAccount } = useAccounts()
  const [userEmail, setUserEmail] = useState("")
  const [userInitial, setUserInitial] = useState("T")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setUserEmail(user.email)
        setUserInitial(user.email[0].toUpperCase())
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <aside
      className={cn(
        "w-64 border-r border-gray-800 bg-gray-950 flex-shrink-0 flex-col z-50",
        "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        showMobile ? "translate-x-0 flex" : "-translate-x-full md:flex hidden"
      )}
    >
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          pe-Kay FX Tracker
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close menu</span>
        </Button>
      </div>

      <div className="px-4 mb-4">
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
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 w-full min-h-[40px] ${
            activePage === "dashboard"
              ? "bg-gray-900 text-cyan-400 border border-gray-800 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              : "text-gray-400 hover:text-cyan-400 hover:bg-gray-900"
          }`}
          onClick={onClose}
        >
          <Home className="h-5 w-5 shrink-0" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/trades"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 w-full min-h-[40px] ${
            activePage === "trades"
              ? "bg-gray-900 text-cyan-400 border border-gray-800 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              : "text-gray-400 hover:text-cyan-400 hover:bg-gray-900"
          }`}
          onClick={onClose}
        >
          <TrendingUp className="h-5 w-5 shrink-0" />
          <span>Trades</span>
        </Link>
        <Link
          href="/analytics"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 w-full min-h-[40px] ${
            activePage === "analytics"
              ? "bg-gray-900 text-cyan-400 border border-gray-800 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              : "text-gray-400 hover:text-cyan-400 hover:bg-gray-900"
          }`}
          onClick={onClose}
        >
          <BarChart3 className="h-5 w-5 shrink-0" />
          <span>Analytics</span>
        </Link>
        <Link
          href="/history"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 w-full min-h-[40px] ${
            activePage === "history"
              ? "bg-gray-900 text-cyan-400 border border-gray-800 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              : "text-gray-400 hover:text-cyan-400 hover:bg-gray-900"
          }`}
          onClick={onClose}
        >
          <Clock className="h-5 w-5 shrink-0" />
          <span>History</span>
        </Link>
        <Link
          href="/accounts"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 w-full min-h-[40px] ${
            activePage === "accounts"
              ? "bg-gray-900 text-cyan-400 border border-gray-800 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              : "text-gray-400 hover:text-cyan-400 hover:bg-gray-900"
          }`}
          onClick={onClose}
        >
          <DollarSign className="h-5 w-5 shrink-0" />
          <span>Accounts</span>
        </Link>
        <Link
          href="/profit-withdrawal"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 w-full min-h-[40px] ${
            activePage === "profit-withdrawal"
              ? "bg-gray-900 text-cyan-400 border border-gray-800 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              : "text-gray-400 hover:text-cyan-400 hover:bg-gray-900"
          }`}
          onClick={onClose}
        >
          <Wallet className="h-5 w-5 shrink-0" />
          <span>Profit Withdrawal</span>
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 w-full min-h-[40px] ${
            activePage === "settings"
              ? "bg-gray-900 text-cyan-400 border border-gray-800 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              : "text-gray-400 hover:text-cyan-400 hover:bg-gray-900"
          }`}
          onClick={onClose}
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span>Settings</span>
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
            {userInitial}
          </div>
          <div>
            <p className="text-sm font-medium text-white truncate">
              {userEmail}
            </p>
            <p className="text-xs text-gray-500">Pro Account</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
