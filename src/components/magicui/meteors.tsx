'use client'

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

interface MeteorsProps {
  number?: number
  minDelay?: number
  maxDelay?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
  className?: string
}

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) => {
  const [meteorArray, setMeteorArray] = useState<JSX.Element[]>([])

  const meteors = useMemo(() => {
    const meteorElements: JSX.Element[] = []
    
    for (let i = 0; i < number; i++) {
      const delay = Math.random() * (maxDelay - minDelay) + minDelay
      const duration = Math.random() * (maxDuration - minDuration) + minDuration
      const left = Math.random() * 100
      const top = Math.random() * 100
      
      meteorElements.push(
        <span
          key={i}
          className={cn(
            "absolute animate-meteor-effect h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={{
            top: `${top}%`,
            left: `${left}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            transform: `rotate(${angle}deg)`,
          }}
        />
      )
    }
    
    return meteorElements
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle, className])

  useEffect(() => {
    setMeteorArray(meteors)
  }, [meteors])

  return (
    <>
      {meteorArray}
      <style jsx global>{`
        @keyframes meteor-effect {
          0% {
            transform: rotate(215deg) translateX(0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: rotate(215deg) translateX(-500px);
            opacity: 0;
          }
        }
        
        .animate-meteor-effect {
          animation: meteor-effect linear infinite;
        }
      `}</style>
    </>
  )
} 