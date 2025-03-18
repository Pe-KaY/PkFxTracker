import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Sound effect player with volume control
export function playSound(soundName: string, volume: number = 1) {
  const audio = new Audio(`/sounds/${soundName}`)
  audio.volume = Math.min(Math.max(volume, 0), 1) // Ensure volume is between 0 and 1

  // Play the sound and handle any errors
  audio.play().catch((error) => {
    console.error("Error playing sound:", error)
  })
}
