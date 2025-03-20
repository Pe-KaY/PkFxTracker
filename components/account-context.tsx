"use client"

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react"
import { auth, db } from "@/lib/firebase"
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export type Account = {
  id: string
  name: string
  size: number
  currency: string
  createdAt: Date
  totalWithdrawn?: number // Track total withdrawn amount for each account
  userId?: string
  lastSynced?: Date
  lastWithdrawalDate?: Date
}

export type Trade = {
  id: string
  accountId: string
  pair: string
  date: Date
  direction: "buy" | "sell"
  risk: number
  riskReward: string
  result: "win" | "loss" | "breakeven"
  duration?: string
  profit: number
  notes: string
  screenshot?: string
  userId?: string
  lastSynced?: Date
  profitLossType: "calculated" | "manual"
  manualProfitLoss?: number
}

type AccountContextType = {
  accounts: Account[]
  selectedAccountId: string | null
  trades: Trade[]
  addAccount: (account: Omit<Account, "id" | "createdAt">) => Promise<void>
  selectAccount: (id: string) => void
  addTrade: (trade: Omit<Trade, "id"> & { id?: string }) => Promise<void>
  getAccountById: (id: string) => Account | undefined
  getTradesByAccountId: (accountId: string) => Trade[]
  calculateAccountStats: (accountId: string) => {
    totalProfit: number
    winRate: number
    totalTrades: number
    openTrades: number
    balance: number
    totalWithdrawn: number
  }
  removeAccount: (id: string) => Promise<void>
  resetAllAccounts: () => void
  getTradeById: (id: string) => Trade | undefined
  updateTrade: (
    id: string,
    trade: Partial<Omit<Trade, "id" | "accountId">>
  ) => Promise<void>
  deleteTrade: (id: string) => Promise<void>
  getTotalAccountsInProfit: () => number
  getTotalAccountsInLoss: () => number
  getTotalProfitFromProfitableAccounts: () => number
  getTotalLossFromUnprofitableAccounts: () => number
  withdrawProfitAndReset: (accountId: string) => Promise<number>
  withdrawAndRemoveAccount: (accountId: string) => Promise<number>
  getTotalWithdrawnProfit: () => number
  getProfitableAccounts: () => Account[]
  resetTotalWithdrawn: () => Promise<void>
  isOnline: boolean
  isSyncing: boolean
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

// Sample data
const defaultAccounts: Account[] = [
  {
    id: "acc1",
    name: "Main Trading Account",
    size: 10000,
    currency: "USD",
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "acc2",
    name: "Demo Account",
    size: 5000,
    currency: "USD",
    createdAt: new Date("2025-02-15"),
  },
]

const defaultTrades: Trade[] = [
  {
    id: "trade1",
    accountId: "acc1",
    pair: "XAU/USD (Gold)",
    date: new Date("2025-03-12"),
    direction: "buy",
    risk: 1.5,
    riskReward: "1:2",
    result: "win",
    duration: "1-4 hours",
    profit: 300,
    notes: "Strong breakout above resistance",
    profitLossType: "calculated",
  },
  {
    id: "trade2",
    accountId: "acc1",
    pair: "BTC/USD (Bitcoin)",
    date: new Date("2025-03-11"),
    direction: "sell",
    risk: 2,
    riskReward: "1:1.5",
    result: "loss",
    duration: "4-12 hours",
    profit: -200,
    notes: "Failed support level",
    profitLossType: "calculated",
  },
  {
    id: "trade3",
    accountId: "acc1",
    pair: "NAS100 (Nasdaq)",
    date: new Date("2025-03-10"),
    direction: "buy",
    risk: 1,
    riskReward: "1:3",
    result: "win",
    duration: "12-24 hours",
    profit: 300,
    notes: "Bullish engulfing pattern",
    profitLossType: "calculated",
  },
  {
    id: "trade4",
    accountId: "acc1",
    pair: "EUR/USD",
    date: new Date("2025-03-09"),
    direction: "sell",
    risk: 1.5,
    riskReward: "1:2",
    result: "win",
    duration: "1-3 days",
    profit: 300,
    notes: "Bearish trend continuation",
    profitLossType: "calculated",
  },
  {
    id: "trade5",
    accountId: "acc1",
    pair: "US30 (Dow Jones)",
    date: new Date("2025-03-08"),
    direction: "buy",
    risk: 2,
    riskReward: "1:1",
    result: "loss",
    duration: "< 1 hour",
    profit: -200,
    notes: "False breakout",
    profitLossType: "calculated",
  },
  {
    id: "trade6",
    accountId: "acc2",
    pair: "GBP/USD",
    date: new Date("2025-03-07"),
    direction: "buy",
    risk: 1,
    riskReward: "1:2",
    result: "win",
    duration: "3-7 days",
    profit: 100,
    notes: "Demo account test trade",
    profitLossType: "calculated",
  },
]

// Function to save data to localStorage
const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

// Function to load data from localStorage
const loadFromLocalStorage = (key: string, defaultValue: any) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)

        // Convert date strings back to Date objects
        if (key === "trades") {
          parsed.forEach((trade: any) => {
            trade.date = new Date(trade.date)
          })
        } else if (key === "accounts") {
          parsed.forEach((account: any) => {
            account.createdAt = new Date(account.createdAt)
          })
        }

        return parsed
      } catch (error) {
        console.error(`Error parsing ${key} from localStorage:`, error)
        return defaultValue
      }
    }
  }
  return defaultValue
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(() =>
    loadFromLocalStorage("accounts", [])
  )
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    () => loadFromLocalStorage("selectedAccountId", null)
  )
  const [trades, setTrades] = useState<Trade[]>(() =>
    loadFromLocalStorage("trades", [])
  )
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Effect to sync with Firestore when user is authenticated
  useEffect(() => {
    console.log("Setting up Firestore sync...")

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user")

      if (user) {
        setIsSyncing(true)
        try {
          console.log("Setting up Firestore listeners for user:", user.uid)

          // Set up real-time listeners for accounts and trades
          const accountsQuery = query(
            collection(db, "accounts"),
            where("userId", "==", user.uid)
          )
          const tradesQuery = query(
            collection(db, "trades"),
            where("userId", "==", user.uid)
          )

          // Listen for account changes
          const unsubAccounts = onSnapshot(
            accountsQuery,
            (snapshot) => {
              console.log(
                "Accounts snapshot received:",
                snapshot.size,
                "documents"
              )
              const remoteAccounts = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                lastSynced: doc.data().lastSynced?.toDate() || new Date(),
              })) as Account[]

              console.log("Remote accounts:", remoteAccounts)
              const mergedAccounts = mergeData(accounts, remoteAccounts, "id")
              setAccounts(mergedAccounts)
              saveToLocalStorage("accounts", mergedAccounts)
            },
            (error) => {
              console.error("Error in accounts listener:", error)
              setIsOnline(false)
            }
          )

          // Listen for trade changes
          const unsubTrades = onSnapshot(
            tradesQuery,
            (snapshot) => {
              console.log(
                "Trades snapshot received:",
                snapshot.size,
                "documents"
              )
              const remoteTrades = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
                date: doc.data().date?.toDate() || new Date(),
                lastSynced: doc.data().lastSynced?.toDate() || new Date(),
              })) as Trade[]

              console.log("Remote trades:", remoteTrades)
              const mergedTrades = mergeData(trades, remoteTrades, "id")
              setTrades(mergedTrades)
              saveToLocalStorage("trades", mergedTrades)
            },
            (error) => {
              console.error("Error in trades listener:", error)
              setIsOnline(false)
            }
          )

          return () => {
            console.log("Cleaning up Firestore listeners")
            unsubAccounts()
            unsubTrades()
          }
        } catch (error) {
          console.error("Error setting up Firestore sync:", error)
          setIsOnline(false)
        } finally {
          setIsSyncing(false)
        }
      } else {
        console.log("No user logged in, clearing local data")
        // User is signed out, clear data
        setAccounts([])
        setTrades([])
        setSelectedAccountId(null)
        saveToLocalStorage("accounts", [])
        saveToLocalStorage("trades", [])
        saveToLocalStorage("selectedAccountId", null)
      }
    })

    return () => {
      console.log("Cleaning up auth listener")
      unsubscribe()
    }
  }, [])

  // Helper function to merge local and remote data
  const mergeData = <T extends { id: string; lastSynced?: Date }>(
    localData: T[],
    remoteData: T[],
    idField: keyof T
  ): T[] => {
    const merged = new Map<string, T>()

    // Add all remote data first
    remoteData.forEach((item) => {
      merged.set(item.id, item)
    })

    // Merge local data, preferring newer items based on lastSynced
    localData.forEach((item) => {
      const existingItem = merged.get(item.id)
      if (
        !existingItem ||
        (item.lastSynced &&
          existingItem.lastSynced &&
          item.lastSynced > existingItem.lastSynced)
      ) {
        merged.set(item.id, item)
      }
    })

    return Array.from(merged.values())
  }

  // Helper function to sync to Firestore
  const syncToFirestore = async (
    collectionName: string,
    data: any,
    userId: string
  ) => {
    if (!isOnline || !userId) {
      console.log(
        "Not syncing to Firestore:",
        !isOnline ? "Offline" : "No user ID"
      )
      return
    }

    setIsSyncing(true)
    try {
      console.log(`Syncing ${collectionName} to Firestore:`, data)
      const docRef = doc(db, collectionName, data.id)
      const dataToSync = {
        ...data,
        userId,
        lastSynced: serverTimestamp(),
      }

      // Convert Date objects to Firestore Timestamps
      if (data.date) {
        dataToSync.date = Timestamp.fromDate(data.date)
      }
      if (data.createdAt) {
        dataToSync.createdAt = Timestamp.fromDate(data.createdAt)
      }

      await setDoc(docRef, dataToSync)
      console.log(
        `Successfully synced ${collectionName} to Firestore:`,
        data.id
      )
    } catch (error) {
      console.error(`Error syncing ${collectionName} to Firestore:`, error)
      setIsOnline(false)
    } finally {
      setIsSyncing(false)
    }
  }

  const addAccount = async (account: Omit<Account, "id" | "createdAt">) => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const newAccount: Account = {
      ...account,
      id: `acc${Date.now()}`,
      createdAt: new Date(),
      userId,
      lastSynced: new Date(),
    }

    setAccounts((prev) => [...prev, newAccount])
    if (!selectedAccountId) {
      setSelectedAccountId(newAccount.id)
    }

    // Save to localStorage
    saveToLocalStorage("accounts", [...accounts, newAccount])

    // Sync to Firestore
    await syncToFirestore("accounts", newAccount, userId)
  }

  const selectAccount = (id: string) => {
    setSelectedAccountId(id)
  }

  const calculateProfit = (
    accountId: string,
    risk: number,
    riskReward: string,
    result: "win" | "loss" | "breakeven",
    profitLossType: "calculated" | "manual",
    manualProfitLoss?: number
  ) => {
    // If manual profit/loss is provided, use that instead
    if (profitLossType === "manual" && manualProfitLoss !== undefined) {
      return manualProfitLoss
    }

    // Otherwise use the calculated method
    const account = accounts.find((acc) => acc.id === accountId)
    if (!account) return 0

    // Always return 0 for breakeven trades
    if (result === "breakeven") return 0

    // Parse risk:reward ratio (e.g., "1:2" -> { risk: 1, reward: 2 })
    const [riskPart, rewardPart] = riskReward.split(":").map(Number)
    const rewardValue = isNaN(rewardPart) ? 1 : rewardPart // Default to 1 if parsing fails

    // Calculate profit/loss amount based on starting balance
    let profitAmount = 0
    if (result === "win") {
      // Win: risk% * account size * reward ratio
      profitAmount = (risk / 100) * account.size * rewardValue
    } else if (result === "loss") {
      // Loss: risk% * account size (negative)
      profitAmount = -((risk / 100) * account.size)
    }
    // Breakeven case is already handled above (returns 0)

    return profitAmount
  }

  const addTrade = async (trade: Omit<Trade, "id"> & { id?: string }) => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      console.log("No user ID found, cannot add trade")
      return
    }

    const tradeDate =
      trade.date instanceof Date ? trade.date : new Date(trade.date)
    const profitAmount =
      trade.profitLossType === "manual" && trade.manualProfitLoss !== undefined
        ? trade.manualProfitLoss
        : calculateProfit(
            trade.accountId,
            trade.risk,
            trade.riskReward,
            trade.result,
            trade.profitLossType,
            trade.manualProfitLoss
          )

    const tradeId = trade.id || `trade${Date.now()}`
    const newTrade: Trade = {
      ...trade,
      id: tradeId,
      date: tradeDate,
      profit: profitAmount,
      userId,
      lastSynced: new Date(),
    }

    console.log("Adding new trade:", newTrade)

    try {
      // Update local state first
      const updatedTrades = [newTrade, ...trades]
      setTrades(updatedTrades)
      // Save to localStorage with the updated array
      saveToLocalStorage("trades", updatedTrades)

      // Then sync to Firestore
      setIsSyncing(true)
      const docRef = doc(db, "trades", tradeId)

      // Clean up undefined fields for Firestore
      const dataToSync = Object.entries({
        ...newTrade,
        date: Timestamp.fromDate(tradeDate),
        lastSynced: serverTimestamp(),
      }).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, any>)

      await setDoc(docRef, dataToSync)
      console.log("Successfully synced trade to Firestore:", tradeId)
    } catch (error) {
      console.error("Error adding trade:", error)
      setIsOnline(false)
    } finally {
      setIsSyncing(false)
    }
  }

  const getAccountById = (id: string) => {
    return accounts.find((account) => account.id === id)
  }

  const getTradesByAccountId = (accountId: string) => {
    return trades
      .filter((trade) => trade.accountId === accountId)
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date)
        const dateB = b.date instanceof Date ? b.date : new Date(b.date)
        return dateB.getTime() - dateA.getTime()
      })
  }

  const calculateAccountStats = (accountId: string) => {
    const accountTrades = getTradesByAccountId(accountId)
    const account = getAccountById(accountId)
    if (!account)
      return {
        totalProfit: 0,
        winRate: 0,
        totalTrades: 0,
        openTrades: 0,
        balance: 0,
        totalWithdrawn: 0,
      }

    // Calculate total profit from current trades
    const totalProfit = accountTrades.reduce(
      (sum, trade) => sum + trade.profit,
      0
    )

    // Calculate win rate
    const winningTrades = accountTrades.filter(
      (trade) => trade.result === "win"
    )
    const winRate =
      accountTrades.length > 0
        ? (winningTrades.length / accountTrades.length) * 100
        : 0

    // Include previously withdrawn amount in stats
    const totalWithdrawn = account.totalWithdrawn || 0

    // If account has a lastWithdrawalDate and no new trades since then,
    // we should not show any profit
    const hasNewTradesSinceWithdrawal = account.lastWithdrawalDate
      ? accountTrades.some((trade) => trade.date > account.lastWithdrawalDate!)
      : true

    // Calculate current balance (starting balance + current trades profit)
    const balance =
      account.size + (hasNewTradesSinceWithdrawal ? totalProfit : 0)

    return {
      // Only show profit if there are new trades since last withdrawal
      totalProfit: hasNewTradesSinceWithdrawal ? totalProfit : 0,
      winRate,
      totalTrades: accountTrades.length,
      openTrades: 0,
      balance,
      totalWithdrawn,
    }
  }

  const removeAccount = async (id: string) => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    // Remove from local state
    setAccounts(accounts.filter((account) => account.id !== id))
    setTrades(trades.filter((trade) => trade.accountId !== id))

    // Update selectedAccountId if needed
    if (selectedAccountId === id) {
      const remainingAccounts = accounts.filter((account) => account.id !== id)
      setSelectedAccountId(
        remainingAccounts.length > 0 ? remainingAccounts[0].id : null
      )
    }

    // Save to localStorage
    saveToLocalStorage(
      "accounts",
      accounts.filter((account) => account.id !== id)
    )
    saveToLocalStorage(
      "trades",
      trades.filter((trade) => trade.accountId !== id)
    )

    // Remove from Firestore
    if (isOnline) {
      try {
        await deleteDoc(doc(db, "accounts", id))
        // Delete associated trades
        const tradesQuery = query(
          collection(db, "trades"),
          where("accountId", "==", id),
          where("userId", "==", userId)
        )
        const tradesSnapshot = await getDocs(tradesQuery)
        tradesSnapshot.docs.forEach(async (doc) => {
          await deleteDoc(doc.ref)
        })
      } catch (error) {
        console.error("Error removing account from Firestore:", error)
        setIsOnline(false)
      }
    }
  }

  const resetAllAccounts = async () => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    try {
      setIsSyncing(true)

      // Delete all trades from Firestore first
      const tradesQuery = query(
        collection(db, "trades"),
        where("userId", "==", userId)
      )
      const tradesSnapshot = await getDocs(tradesQuery)
      for (const doc of tradesSnapshot.docs) {
        await deleteDoc(doc.ref)
      }

      // Delete all accounts from Firestore
      const accountsQuery = query(
        collection(db, "accounts"),
        where("userId", "==", userId)
      )
      const accountsSnapshot = await getDocs(accountsQuery)
      for (const doc of accountsSnapshot.docs) {
        await deleteDoc(doc.ref)
      }

      // Clear local state
      setAccounts([])
      setTrades([])
      setSelectedAccountId(null)

      // Clear localStorage
      saveToLocalStorage("accounts", [])
      saveToLocalStorage("trades", [])
      saveToLocalStorage("selectedAccountId", null)
    } catch (error) {
      console.error("Error resetting all data:", error)
      setIsOnline(false)

      // Still clear local state even if Firestore sync fails
      setAccounts([])
      setTrades([])
      setSelectedAccountId(null)
      saveToLocalStorage("accounts", [])
      saveToLocalStorage("trades", [])
      saveToLocalStorage("selectedAccountId", null)
    } finally {
      setIsSyncing(false)
    }
  }

  const getTradeById = (id: string) => {
    return trades.find((trade) => trade.id === id)
  }

  const updateTrade = async (
    id: string,
    updatedTradeData: Partial<Omit<Trade, "id" | "accountId">>
  ) => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const existingTrade = trades.find((trade) => trade.id === id)
    if (!existingTrade) return

    // Calculate new profit if risk, riskReward, or result has changed
    let newProfit = existingTrade.profit
    if (
      updatedTradeData.risk !== undefined ||
      updatedTradeData.riskReward !== undefined ||
      updatedTradeData.result !== undefined
    ) {
      newProfit = calculateProfit(
        existingTrade.accountId,
        updatedTradeData.risk ?? existingTrade.risk,
        updatedTradeData.riskReward ?? existingTrade.riskReward,
        updatedTradeData.result ?? existingTrade.result,
        existingTrade.profitLossType,
        updatedTradeData.manualProfitLoss
      )
    }

    // Create updated trade object
    const updatedTrade = {
      ...existingTrade,
      ...updatedTradeData,
      profit: newProfit,
      lastSynced: new Date(),
    }

    // Update local state
    setTrades(trades.map((trade) => (trade.id === id ? updatedTrade : trade)))
    saveToLocalStorage(
      "trades",
      trades.map((trade) => (trade.id === id ? updatedTrade : trade))
    )

    // Sync to Firestore
    await syncToFirestore("trades", updatedTrade, userId)
  }

  const deleteTrade = async (id: string) => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    try {
      setIsSyncing(true)
      // Delete from Firestore first
      if (isOnline) {
        await deleteDoc(doc(db, "trades", id))
      }

      // Then update local state
      const updatedTrades = trades.filter((trade) => trade.id !== id)
      setTrades(updatedTrades)
      saveToLocalStorage("trades", updatedTrades)
    } catch (error) {
      console.error("Error deleting trade from Firestore:", error)
      setIsOnline(false)
      // Still update local state even if Firestore sync fails
      const updatedTrades = trades.filter((trade) => trade.id !== id)
      setTrades(updatedTrades)
      saveToLocalStorage("trades", updatedTrades)
    } finally {
      setIsSyncing(false)
    }
  }

  const getTotalAccountsInProfit = () => {
    return accounts.filter((account) => {
      const stats = calculateAccountStats(account.id)
      // Only consider current trades profit
      return stats.totalProfit > 0
    }).length
  }

  const getTotalAccountsInLoss = () => {
    return accounts.filter((account) => {
      const stats = calculateAccountStats(account.id)
      return stats.totalProfit < 0
    }).length
  }

  const getTotalProfitFromProfitableAccounts = () => {
    return accounts.reduce((total, account) => {
      const stats = calculateAccountStats(account.id)
      // Include all current profits
      return stats.totalProfit > 0 ? total + stats.totalProfit : total
    }, 0)
  }

  const getTotalLossFromUnprofitableAccounts = () => {
    return accounts.reduce((total, account) => {
      const stats = calculateAccountStats(account.id)
      return stats.totalProfit < 0 ? total + stats.totalProfit : total
    }, 0)
  }

  const getProfitableAccounts = () => {
    return accounts.filter((account) => {
      const stats = calculateAccountStats(account.id)
      // Only include accounts that:
      // 1. Have current profits
      // 2. Have active trades
      // 3. Have new trades since last withdrawal (handled in calculateAccountStats)
      return (
        stats.totalProfit > 0 && getTradesByAccountId(account.id).length > 0
      )
    })
  }

  const withdrawProfitAndReset = async (accountId: string) => {
    const userId = auth.currentUser?.uid
    if (!userId) return 0

    const account = accounts.find((acc) => acc.id === accountId)
    if (!account) return 0

    const stats = calculateAccountStats(accountId)
    if (stats.totalProfit <= 0) return 0

    try {
      setIsSyncing(true)
      // Update account's withdrawn amount and reset trades
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === accountId) {
          return {
            ...acc,
            totalWithdrawn: (acc.totalWithdrawn || 0) + stats.totalProfit,
            lastWithdrawalDate: new Date(), // Add withdrawal date
            lastSynced: new Date(),
          }
        }
        return acc
      })

      // Remove all trades for this account
      const updatedTrades = trades.filter(
        (trade) => trade.accountId !== accountId
      )

      // Update local state
      setAccounts(updatedAccounts)
      setTrades(updatedTrades)
      saveToLocalStorage("accounts", updatedAccounts)
      saveToLocalStorage("trades", updatedTrades)

      // Sync account update to Firestore
      const updatedAccount = updatedAccounts.find((acc) => acc.id === accountId)
      if (updatedAccount) {
        await syncToFirestore("accounts", updatedAccount, userId)
      }

      // Delete trades from Firestore
      const tradesQuery = query(
        collection(db, "trades"),
        where("accountId", "==", accountId),
        where("userId", "==", userId)
      )
      const tradesSnapshot = await getDocs(tradesQuery)
      for (const doc of tradesSnapshot.docs) {
        await deleteDoc(doc.ref)
      }

      return stats.totalProfit
    } catch (error) {
      console.error("Error withdrawing profit:", error)
      setIsOnline(false)
      return 0
    } finally {
      setIsSyncing(false)
    }
  }

  const withdrawAndRemoveAccount = async (accountId: string) => {
    const userId = auth.currentUser?.uid
    if (!userId) return 0

    const account = accounts.find((acc) => acc.id === accountId)
    if (!account) return 0

    const stats = calculateAccountStats(accountId)
    if (stats.totalProfit <= 0) return 0

    try {
      setIsSyncing(true)
      // Update the remaining accounts
      const updatedAccounts = accounts.filter((acc) => acc.id !== accountId)
      const updatedTrades = trades.filter(
        (trade) => trade.accountId !== accountId
      )

      // Update local state
      setAccounts(updatedAccounts)
      setTrades(updatedTrades)
      if (selectedAccountId === accountId) {
        setSelectedAccountId(
          updatedAccounts.length > 0 ? updatedAccounts[0].id : null
        )
      }

      // Save to localStorage
      saveToLocalStorage("accounts", updatedAccounts)
      saveToLocalStorage("trades", updatedTrades)
      saveToLocalStorage("selectedAccountId", selectedAccountId)

      // Delete account from Firestore
      await deleteDoc(doc(db, "accounts", accountId))

      // Delete associated trades from Firestore
      const tradesQuery = query(
        collection(db, "trades"),
        where("accountId", "==", accountId),
        where("userId", "==", userId)
      )
      const tradesSnapshot = await getDocs(tradesQuery)
      for (const doc of tradesSnapshot.docs) {
        await deleteDoc(doc.ref)
      }

      return stats.totalProfit
    } catch (error) {
      console.error("Error withdrawing and removing account:", error)
      setIsOnline(false)
      return 0
    } finally {
      setIsSyncing(false)
    }
  }

  const getTotalWithdrawnProfit = () => {
    return accounts.reduce(
      (total, account) => total + (account.totalWithdrawn || 0),
      0
    )
  }

  const resetTotalWithdrawn = async () => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    try {
      setIsSyncing(true)
      const updatedAccounts = accounts.map((account) => ({
        ...account,
        totalWithdrawn: 0,
        lastSynced: new Date(),
      }))

      // Update local state
      setAccounts(updatedAccounts)
      saveToLocalStorage("accounts", updatedAccounts)

      // Sync all accounts to Firestore
      for (const account of updatedAccounts) {
        await syncToFirestore("accounts", account, userId)
      }
    } catch (error) {
      console.error("Error resetting total withdrawn:", error)
      setIsOnline(false)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <AccountContext.Provider
      value={{
        accounts,
        selectedAccountId,
        trades,
        addAccount,
        selectAccount,
        addTrade,
        getAccountById,
        getTradesByAccountId,
        calculateAccountStats,
        removeAccount,
        resetAllAccounts,
        getTradeById,
        updateTrade,
        deleteTrade,
        getTotalAccountsInProfit,
        getTotalAccountsInLoss,
        getTotalProfitFromProfitableAccounts,
        getTotalLossFromUnprofitableAccounts,
        withdrawProfitAndReset,
        withdrawAndRemoveAccount,
        getTotalWithdrawnProfit,
        getProfitableAccounts,
        resetTotalWithdrawn,
        isOnline,
        isSyncing,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccounts() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountProvider")
  }
  return context
}
