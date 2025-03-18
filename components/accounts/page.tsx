"use client"

import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAccounts } from "@/lib/hooks/use-accounts"
import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { subDays } from "date-fns"
import { Trash } from "lucide-react"

const data = [
  { date: subDays(new Date(), 2).toISOString().substring(0, 10), value: 400 },
  { date: subDays(new Date(), 1).toISOString().substring(0, 10), value: 300 },
  { date: new Date().toISOString().substring(0, 10), value: 200 },
]

export default function AccountsPage() {
  const [accountName, setAccountName] = useState("")
  const { toast } = useToast()
  const { accounts, addAccount, selectAccount, calculateAccountStats, removeAccount } = useAccounts()

  const handleAddAccount = () => {
    addAccount(accountName)
    setAccountName("")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Account</CardTitle>
            <CardDescription>Add a new trading account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="account">Account Name</Label>
              <Input
                type="text"
                id="account"
                placeholder="My Trading Account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddAccount}>Add Account</Button>
          </CardFooter>
        </Card>

        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle>{account.name}</CardTitle>
              <CardDescription>Balance: ${calculateAccountStats(account.id).balance}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={() => selectAccount(account.id)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 hover:text-cyan-400"
              >
                Select Account
              </Button>
              <Button
                onClick={() => {
                  removeAccount(account.id)
                  toast({
                    title: "Account removed",
                    description: "The account and all its trades have been removed",
                  })
                }}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

