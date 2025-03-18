"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to accounts page
        router.replace("/accounts")
      } else {
        // No user is signed in, redirect to login page
        router.replace("/login")
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [router])

  return null
}
