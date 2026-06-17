'use client'

import { User } from 'lucide-react'

export function PersonalBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-sky-500 to-blue-600 shadow-xl shadow-primary/20">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex items-center justify-between px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Mikail KOCAK
          </h2>
          <p className="text-sm sm:text-base text-white/80 mt-1 font-medium">
            July 23, 1979
          </p>
        </div>

        <div className="flex-shrink-0 ml-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/40 flex items-center justify-center shadow-lg backdrop-blur-sm">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white/90" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  )
}
