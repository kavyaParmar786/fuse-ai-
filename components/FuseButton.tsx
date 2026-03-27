'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface FuseButtonProps {
  onClick: () => void
  loading: boolean
  disabled: boolean
  emojis: string[]
}

export default function FuseButton({ onClick, loading, disabled, emojis }: FuseButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col items-center gap-4"
    >
      {/* Emoji merge preview above button */}
      {emojis.length >= 2 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1 text-2xl"
        >
          {emojis.map((e, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="hover:animate-bounce inline-block">{e}</span>
              {i < emojis.length - 1 && (
                <span className="text-base text-white/20">+</span>
              )}
            </span>
          ))}
          <span className="text-base text-white/20 mx-1">→</span>
          <span className="text-2xl">❓</span>
        </motion.div>
      )}

      {/* Main button */}
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="relative group overflow-hidden px-10 py-4 rounded-2xl text-base font-black tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
        style={{
          background: disabled
            ? 'rgba(255,255,255,0.05)'
            : 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 50%, #ec4899 100%)',
          boxShadow: !disabled
            ? '0 0 30px rgba(0,245,255,0.3), 0 0 60px rgba(139,92,246,0.2)'
            : 'none',
        }}
      >
        {/* Shimmer */}
        {!disabled && !loading && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              {/* Orbit loader */}
              <div className="relative w-5 h-5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-white"
                    style={{ top: '50%', left: '50%', marginTop: -3, marginLeft: -3 }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: i * 0.27,
                    }}
                    initial={{ translateX: 10 * Math.cos(i * 2.094), translateY: 10 * Math.sin(i * 2.094) }}
                  />
                ))}
              </div>
              <span>Fusing...</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Sparkles size={18} />
              Fuse
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Sub hint */}
      {!disabled && !loading && (
        <p className="text-xs text-white/25 font-mono">
          {emojis.length} emoji{emojis.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </motion.div>
  )
}
