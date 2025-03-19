"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { User } from "firebase/auth"
import { DashboardPage } from "@/components/dashboard-page"
import { LoadingAnimation } from "@/components/loading-animation"

export default function Dashboard() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
      } else {
        router.replace("/login")
      }
      setAuthChecked(true)
    })

    return () => unsubscribe()
  }, [router])

  if (!authChecked || !user) {
    return <LoadingAnimation />
  }

  return <DashboardPage />
}
