import { useCallback, useEffect, useRef } from "react"

export function useSound(soundUrl: string, volume = 1) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element
    const audio = new Audio(soundUrl)
    audio.volume = Math.min(Math.max(volume, 0), 1)
    audioRef.current = audio

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [soundUrl, volume])

  const play = useCallback(() => {
    if (audioRef.current) {
      // Reset the audio to start
      audioRef.current.currentTime = 0

      // Play the sound
      audioRef.current.play().catch((error) => {
        console.error("Error playing sound:", error)
      })
    }
  }, [])

  return play
}
