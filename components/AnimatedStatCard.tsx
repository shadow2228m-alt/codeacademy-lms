'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion'

interface AnimatedStatCardProps {
  label: string
  value: number | string
  color: string
  suffix?: string
  icon?: string
  delay?: number
}

export default function AnimatedStatCard({
  label,
  value,
  color,
  suffix = '',
  icon,
  delay = 0,
}: AnimatedStatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [displayValue, setDisplayValue] = useState(0)
  const isNumeric = typeof value === 'number'

  // 3D تilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })
  const glowX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%'])
  const glowY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  // Count-up animation
  useEffect(() => {
    if (!isNumeric) return
    const target = value as number
    const controls = animate(0, target, {
      duration: 1.6,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: v => setDisplayValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [value, delay, isNumeric])

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 cursor-default overflow-hidden group"
    >
      {/* متوهج يتبع الفأرة */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{
          background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(0,234,255,0.07) 0%, transparent 70%)`,
        }}
      />

      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className="text-zinc-400 text-sm">{label}</div>
      <div className={`text-3xl font-black mt-2 ${color} tabular-nums`} style={{ transform: 'translateZ(20px)' }}>
        {isNumeric ? displayValue.toLocaleString('ar-EG') : value}
        {suffix && <span className="text-lg ml-1">{suffix}</span>}
      </div>
    </motion.div>
  )
}
