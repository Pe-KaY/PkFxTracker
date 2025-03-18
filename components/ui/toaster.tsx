"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"

// Array of neon colors
const neonColors = [
  "rgba(239, 68, 68, 0.7)", // red
  "rgba(34, 211, 238, 0.7)", // cyan
  "rgba(16, 185, 129, 0.7)", // emerald
  "rgba(168, 85, 247, 0.7)", // purple
  "rgba(251, 191, 36, 0.7)", // amber
  "rgba(236, 72, 153, 0.7)", // pink
  "rgba(59, 130, 246, 0.7)", // blue
]

export function Toaster() {
  const { toasts } = useToast()
  const [toastColors, setToastColors] = useState<Record<string, string>>({})

  // Assign a random color to each new toast
  useEffect(() => {
    toasts.forEach((toast) => {
      if (!toastColors[toast.id]) {
        setToastColors((prev) => ({
          ...prev,
          [toast.id]: neonColors[Math.floor(Math.random() * neonColors.length)],
        }))
      }
    })
  }, [toasts, toastColors])

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast
          key={id}
          {...props}
          className="bg-gray-900 border-gray-800 text-white animate-in slide-in-from-bottom-full duration-700 shadow-2xl p-6"
          style={{
            boxShadow: `0 0 30px 8px ${
              toastColors[id] || "rgba(34, 211, 238, 0.7)"
            }`,
            borderColor: toastColors[id] || "rgba(34, 211, 238, 0.7)",
            borderWidth: "2px",
          }}
        >
          <div className="grid gap-3">
            {title && (
              <ToastTitle className="text-xl font-bold text-white">
                {title}
              </ToastTitle>
            )}
            {description && (
              <ToastDescription className="text-gray-200 opacity-100">
                {description}
              </ToastDescription>
            )}
          </div>
          {action}
          <ToastClose className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors duration-200" />
        </Toast>
      ))}
      <ToastViewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-6 sm:max-w-[500px]" />
    </ToastProvider>
  )
}
