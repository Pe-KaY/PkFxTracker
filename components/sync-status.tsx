"use client"

import { useAccounts } from "@/components/account-context"
import { Wifi, WifiOff, Loader2 } from "lucide-react"

export function SyncStatus() {
  const { isOnline, isSyncing } = useAccounts()

  return (
    <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full">
      {isOnline ? (
        isSyncing ? (
          <>
            <Wifi className="h-5 w-5 text-yellow-400 animate-pulse" />
            <span className="text-sm font-medium text-yellow-400">
              Syncing...
            </span>
            <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
          </>
        ) : (
          <>
            <Wifi className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-green-400">Online</span>
          </>
        )
      ) : (
        <>
          <WifiOff className="h-5 w-5 text-red-400" />
          <span className="text-sm font-medium text-red-400">Offline</span>
        </>
      )}
    </div>
  )
}
