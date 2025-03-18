"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AccountProvider } from "@/components/account-context"
import { Toaster } from "@/components/ui/toaster"
import { LoadingAnimation } from "@/components/loading-animation"
import { useEffect, useState } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <html lang="en" className="dark">
      <head>
        <title>NeonFX - Forex Trading Dashboard</title>
        <meta
          name="description"
          content="Track and record your forex trades with a sleek, dark-themed dashboard"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AccountProvider>
            {loading && <LoadingAnimation />}
            <div
              className={
                loading
                  ? "opacity-0"
                  : "opacity-100 transition-opacity duration-500"
              }
            >
              {children}
            </div>
            <Toaster />
          </AccountProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
