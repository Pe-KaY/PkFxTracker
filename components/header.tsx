"use client"

import { useAccounts } from "@/components/account-context"
import { MobileNav } from "@/components/mobile-nav"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { SyncStatus } from "@/components/sync-status"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, LogOut } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { deleteCookie } from "cookies-next"
import { onAuthStateChanged } from "firebase/auth"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { selectedAccountId, getAccountById } = useAccounts()
  const account = selectedAccountId ? getAccountById(selectedAccountId) : null
  const { toast } = useToast()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [userInitial, setUserInitial] = useState("T")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setUserInitial(user.email[0].toUpperCase())
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    if (isSigningOut) return // Prevent multiple clicks

    setIsSigningOut(true)
    try {
      await signOut(auth)
      // Clear the session cookie
      deleteCookie("session")
      // Force a hard refresh to the login page
      window.location.replace("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      })
      setIsSigningOut(false)
    }
  }

  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950 flex items-center px-6">
      <div className="flex items-center gap-4 w-full">
        {onMenuClick && <MobileNav onMenuClick={onMenuClick} />}

        {account && (
          <div className="flex-1">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              {account.name}
            </h2>
            <p className="text-sm text-gray-300">
              <span className="text-cyan-400 font-medium">Account Size:</span>{" "}
              <span className="text-white font-medium">
                ${account.size.toLocaleString()}
              </span>
            </p>
          </div>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <SyncStatus />
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isSigningOut}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-90 transition-opacity">
                {userInitial}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-gray-700 text-white"
            >
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                className="hover:bg-gray-700 hover:text-cyan-400 cursor-pointer gap-2"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                {isSigningOut ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
