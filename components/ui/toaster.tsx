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
          className="bg-gray-900 border-gray-800 text-white animate-in slide-in-from-bottom-full duration-700 shadow-2xl p-3 sm:p-4 w-[calc(100%-20px)] sm:w-auto mx-2 sm:mx-0 max-w-[420px] sm:max-w-[380px]"
          style={{
            boxShadow: `0 0 20px 4px ${
              toastColors[id] || "rgba(34, 211, 238, 0.7)"
            }`,
            borderColor: toastColors[id] || "rgba(34, 211, 238, 0.7)",
            borderWidth: "1px",
          }}
        >
          <div className="grid gap-1">
            {title && (
              <ToastTitle className="text-sm sm:text-base font-semibold text-white">
                {title}
              </ToastTitle>
            )}
            {description && (
              <ToastDescription className="text-xs sm:text-sm text-gray-200 opacity-90">
                {description}
              </ToastDescription>
            )}
          </div>
          {action}
          <ToastClose className="absolute right-1 top-1 sm:right-2 sm:top-2 opacity-70 hover:opacity-100 transition-opacity" />
        </Toast>
      ))}
      <ToastViewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-2 sm:p-4 sm:bottom-4 sm:right-4 sm:w-auto sm:max-w-[420px]" />
    </ToastProvider>
  )
}
