'use client'

import { motion } from 'framer-motion'
import { Wand2 } from 'lucide-react'

const STYLES = [
  { id: 'cute', label: '🌸 Cute', color: 'from-pink-400 to-rose-400' },
  { id: 'cyberpunk', label: '⚡ Cyberpunk', color: 'from-yellow-400 to-cyan-400' },
  { id: 'neon', label: '💜 Neon', color: 'from-purple-400 to-fuchsia-400' },
  { id: 'horror', label: '💀 Horror', color: 'from-red-500 to-gray-700' },
  { id: 'minimal', label: '◻️ Minimal', color: 'from-white/60 to-white/30' },
]

interface PromptInputProps {
  prompt: string
  selectedStyle: string
  onPromptChange: (v: string) => void
  onStyleChange: (v: string) => void
}

export default function PromptInput({
  prompt,
  selectedStyle,
  onPromptChange,
  onStyleChange,
}: PromptInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg space-y-4"
    >
      {/* Prompt input */}
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent-cyan/20 via-accent-purple/20 to-accent-pink/20 blur-sm" />
        <div className="relative glass-card p-1 rounded-2xl">
          <div className="flex items-center gap-3 px-4 py-3">
            <Wand2 size={16} className="text-accent-purple flex-shrink-0" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Describe how you want to fuse them..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
              maxLength={200}
            />
            {prompt && (
              <span className="text-xs text-white/25 font-mono flex-shrink-0">
                {prompt.length}/200
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Style selector */}
      <div>
        <p className="text-xs text-white/40 font-mono mb-2.5 uppercase tracking-widest">Style</p>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id === selectedStyle ? '' : style.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                selectedStyle === style.id
                  ? `bg-gradient-to-r ${style.color} text-white shadow-lg scale-105`
                  : 'glass-card text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
