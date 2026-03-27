'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Plus, X, Shuffle } from 'lucide-react'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

interface EmojiSelectorProps {
  selectedEmojis: string[]
  onEmojiChange: (emojis: string[]) => void
}

const RANDOM_EMOJIS = ['🐉','🌊','🔥','⚡','🌙','☀️','🦋','🍀','💎','🌸','🎭','🦊','🎸','🚀','🌈','💫','🎨','🦁','🐯','🦅']

export default function EmojiSelector({ selectedEmojis, onEmojiChange }: EmojiSelectorProps) {
  const [pickerFor, setPickerFor] = useState<number | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerFor(null)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const addEmoji = (emoji: string, index?: number) => {
    if (index !== undefined && index < selectedEmojis.length) {
      const next = [...selectedEmojis]
      next[index] = emoji
      onEmojiChange(next)
    } else if (selectedEmojis.length < 5) {
      onEmojiChange([...selectedEmojis, emoji])
    }
    setPickerFor(null)
  }

  const removeEmoji = (index: number) => {
    onEmojiChange(selectedEmojis.filter((_, i) => i !== index))
  }

  const randomize = () => {
    const count = Math.floor(Math.random() * 2) + 2 // 2 or 3
    const shuffled = [...RANDOM_EMOJIS].sort(() => 0.5 - Math.random())
    onEmojiChange(shuffled.slice(0, count))
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-lg">
        <h2 className="text-lg font-bold text-white/80">Select Emojis</h2>
        <button
          onClick={randomize}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 hover:text-white transition-all"
        >
          <Shuffle size={12} />
          Random
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Existing emoji slots */}
        {selectedEmojis.map((emoji, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: i * 0.05 }}
            className="relative group"
          >
            <button
              onClick={() => setPickerFor(i)}
              className="relative w-20 h-20 md:w-24 md:h-24 glass-card flex items-center justify-center text-4xl md:text-5xl hover:border-accent-purple/40 hover:glow-purple transition-all duration-300 hover:scale-105"
            >
              {emoji}
              {/* Slot number */}
              <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-accent-purple/80 text-white text-[10px] font-mono flex items-center justify-center">
                {i + 1}
              </span>
            </button>
            {/* Remove */}
            <button
              onClick={() => removeEmoji(i)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500"
            >
              <X size={10} />
            </button>
          </motion.div>
        ))}

        {/* Plus sign between emojis */}
        {selectedEmojis.length > 0 && selectedEmojis.length < 5 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl text-white/20 font-light select-none"
          >
            +
          </motion.span>
        )}

        {/* Add new emoji slot */}
        {selectedEmojis.length < 5 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPickerFor(selectedEmojis.length)}
            className="w-20 h-20 md:w-24 md:h-24 glass-card flex flex-col items-center justify-center gap-1 border-dashed border-white/20 hover:border-accent-cyan/40 transition-all duration-300 group"
          >
            <Plus size={20} className="text-white/30 group-hover:text-accent-cyan transition-colors" />
            {selectedEmojis.length === 0 && (
              <span className="text-[10px] text-white/30 font-mono">Select</span>
            )}
          </motion.button>
        )}
      </div>

      {/* Emoji count indicator */}
      {selectedEmojis.length > 0 && (
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                n <= selectedEmojis.length
                  ? 'bg-accent-purple scale-125'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      )}

      {/* Emoji Picker */}
      <AnimatePresence>
        {pickerFor !== null && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative z-50"
          >
            <EmojiPicker
              onEmojiClick={(emojiData) => addEmoji(emojiData.emoji, pickerFor)}
              theme={'dark' as any}
              searchPlaceholder="Search emojis..."
              width={320}
              height={380}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
