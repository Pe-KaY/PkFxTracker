"use client"

import ProfitWithdrawalPage from "@/components/profit-withdrawal"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useState } from "react"

export default function Page() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar
        activePage="profit-withdrawal"
        showMobile={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setShowMobileMenu(!showMobileMenu)} />
        <div className="flex-1 flex flex-col overflow-auto bg-gradient-to-br from-gray-950 to-gray-900">
          <ProfitWithdrawalPage />
        </div>
      </div>
    </div>
  )
}
