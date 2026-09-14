"use client"

import { useEffect, useState } from "react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const LABELS: Record<keyof TimeLeft, string> = {
  days: "দিন",
  hours: "ঘণ্টা",
  minutes: "মিনিট",
  seconds: "সেকেন্ড",
}

export function CountdownSection({ endsAt, headline }: { endsAt: string; headline: string }) {
  const target = new Date(endsAt).getTime()
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTimeLeft(getTimeLeft(target))
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-14 text-center">
        <h2 className="text-balance text-2xl font-bold sm:text-3xl">{headline}</h2>
        <div className="grid grid-cols-4 gap-3 sm:gap-5">
          {(Object.keys(LABELS) as (keyof TimeLeft)[]).map((unit) => (
            <div
              key={unit}
              className="flex min-w-17 flex-col items-center rounded-2xl bg-primary-foreground/10 px-3 py-4 backdrop-blur-sm sm:min-w-24 sm:px-6"
            >
              <span className="text-3xl font-bold tabular-nums sm:text-5xl">
                {String(timeLeft ? timeLeft[unit] : 0).padStart(2, "0")}
              </span>
              <span className="mt-1 text-xs font-medium opacity-80 sm:text-sm">{LABELS[unit]}</span>
            </div>
          ))}
        </div>
        <a
          href="#order"
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary-foreground px-8 text-base font-semibold text-primary shadow-lg transition-transform hover:scale-[1.03]"
        >
          অফার শেষ হওয়ার আগেই অর্ডার করুন
        </a>
      </div>
    </section>
  )
}
