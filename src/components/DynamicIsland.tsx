import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task } from '../store/useTaskStore'
import { Bell, Clock, ChevronRight } from 'lucide-react'
import dayjs from 'dayjs'

interface DynamicIslandProps {
  topTask: Task | null
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ topTask }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [overflowDistance, setOverflowDistance] = useState(0)

  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = textRef.current
    const parent = el?.parentElement
    if (!el || !parent) return

    const checkOverflow = () => {
      const innerW = el.scrollWidth
      const outerW = parent.clientWidth
      if (innerW > outerW && isHovered) {
        setOverflowDistance(innerW - outerW + 16)
      } else {
        setOverflowDistance(0)
      }
    }

    checkOverflow()
    const ro = new ResizeObserver(checkOverflow)
    ro.observe(el)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [topTask, isHovered])

  useEffect(() => {
    if (!topTask || topTask.isCompleted) return

    const updateCountdown = () => {
      const now = dayjs()
      const target = dayjs(topTask.deadline)
      const diff = target.diff(now, 'second')

      if (diff <= 0) {
        setTimeLeft('已逾期')
      } else {
        const h = Math.floor(diff / 3600)
        const m = Math.floor((diff % 3600) / 60)
        const s = diff % 60
        setTimeLeft(`${h > 0 ? h + '时 ' : ''}${m}分 ${s}秒`)
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [topTask])

  // Click outside or timeout to auto-collapse could be added here, but manual is fine.

  if (!topTask) {
    return (
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex justify-center">
        <motion.div
          layout
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1, width: 60, height: 16 }}
          className="bg-black rounded-full shadow-lg"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </div>
    )
  }

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex justify-center no-drag">
      <motion.div
        layout
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-black text-white overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4)] cursor-pointer"
        style={{
          borderRadius: isExpanded ? 24 : (isHovered ? 28 : 32),
        }}
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          width: isExpanded ? 280 : (isHovered ? 190 : 160),
          height: isExpanded ? 110 : (isHovered ? 34 : 28)
        }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex items-center justify-between w-full h-full px-3 gap-2"
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-1">
                <Bell className="w-3 h-3 text-[#5AC8FA] shrink-0" fill="currentColor" />
                <div className="flex-1 min-w-0 overflow-hidden relative flex items-center h-full">
                  <motion.span 
                    ref={textRef}
                    className={`text-[11px] font-medium leading-none pt-px whitespace-nowrap block ${
                      isHovered && overflowDistance > 0 ? 'w-max' : 'truncate'
                    }`}
                    animate={{ x: isHovered && overflowDistance > 0 ? -overflowDistance : 0 }}
                    transition={
                      isHovered && overflowDistance > 0
                        ? { duration: overflowDistance * 0.03, ease: "linear", repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }
                        : { type: "spring", bounce: 0 }
                    }
                  >
                    {topTask.title}
                  </motion.span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 bg-white/10 px-1.5 py-0.5 rounded-full">
                <span className="text-[9px] font-bold text-[#5AC8FA] font-mono leading-none">{timeLeft}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1 } }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex flex-col w-full h-full p-4 relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] flex items-center justify-center shadow-[0_0_12px_rgba(0,122,255,0.4)]">
                    <Bell className="w-4 h-4 text-white" fill="currentColor" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">最高优先级</span>
                    <span className="text-[14px] font-bold text-white truncate max-w-[140px]">{topTask.title}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold bg-[#1C1C1E] px-2 py-1 rounded-md text-[#5AC8FA]">
                  <Clock className="w-3 h-3" />
                  {timeLeft}
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="flex justify-between items-center text-[10px] mb-1.5 font-medium px-1">
                  <span className="text-gray-400">流转进度</span>
                  <span className="text-white">{topTask.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#5AC8FA] to-[#007AFF]"
                    initial={{ width: 0 }}
                    animate={{ width: `${topTask.progress}%` }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.2 }}
                  />
                </div>
              </div>
              
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
