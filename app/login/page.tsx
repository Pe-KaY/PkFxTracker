"use client"

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { LoadingAnimation } from "@/components/loading-animation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await signInWithEmailAndPassword(auth, email, password)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error: any) {
      console.error("Login error:", error)
      let errorMessage = "Failed to sign in. Please try again."

      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again."
      }

      setError(errorMessage)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingAnimation />
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/images/background.jpg")' }}
    >
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div
            className="w-20 h-20 rounded-full bg-[#1A1A1A] border-2 border-white flex items-center justify-center relative radiate-effect
            before:absolute before:inset-0 before:rounded-full before:border-2 before:border-white before:animate-pulse before:-z-10
            after:absolute after:inset-0 after:rounded-full after:border-2 after:border-white before:border-opacity-0 after:border-opacity-0 after:animate-pulse after:animation-delay-500 after:-z-10"
          >
            <span className="text-2xl font-bold tracking-wider relative text-white">
              PK
            </span>
          </div>
        </div>
        <div className="text-center mb-8">
          <h1
            className="text-5xl font-extrabold tracking-[0.2em] uppercase text-white"
            style={{
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: "0.15em",
            }}
          >
            PEKAY FX TRACKER
          </h1>
        </div>

        <div
          className="relative bg-black/40 p-8 rounded-xl backdrop-blur-md
          border border-white/20
          before:absolute before:inset-0 before:rounded-xl before:border before:border-white/20 before:animate-pulse before:-z-10"
        >
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {/* Email Input */}
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5 group-hover:text-white transition-colors duration-200" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3 rounded-lg 
                focus:outline-none focus:border-white/40 focus:bg-white/10 
                hover:border-white/20 hover:bg-white/[0.07]
                transition-all duration-200"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5 group-hover:text-white transition-colors duration-200" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3 rounded-lg 
                focus:outline-none focus:border-white/40 focus:bg-white/10 
                hover:border-white/20 hover:bg-white/[0.07]
                transition-all duration-200"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 
              text-white font-medium py-3 rounded-lg transition-all duration-200 cursor-pointer relative z-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                "Login"
              )}
            </button>

            {/* Links */}
            <div className="text-center text-sm relative z-10">
              <p className="text-white/60">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-white hover:text-white/80 transition-colors duration-200 cursor-pointer"
                >
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
