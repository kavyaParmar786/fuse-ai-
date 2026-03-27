'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Download, Heart, Share2, RefreshCw, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface FusionResult {
  id: string
  imageUrl: string
  emojis: string[]
  prompt?: string
  style?: string
  liked?: boolean
}

interface OutputGalleryProps {
  result: FusionResult
  onLike: (id: string) => void
  onReset: () => void
}

export default function OutputGallery({ result, onLike, onReset }: OutputGalleryProps) {
  const [copied, setCopied] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleShare = () => {
    const url = `${window.location.origin}/fusion/${result.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(result.imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `emoji-fusion-${result.id}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded!')
    } catch {
      toast.error('Download failed')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg"
    >
      {/* Result card */}
      <div className="glass-card overflow-hidden relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-purple/5 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold gradient-text">Fusion Result</span>
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            </div>
            <p className="text-xs text-white/30 font-mono mt-0.5">
              {result.emojis.join(' + ')}
              {result.style && ` · ${result.style}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onLike(result.id)}
              className={`p-2 rounded-xl transition-all ${
                result.liked
                  ? 'bg-red-500/20 text-red-400'
                  : 'hover:bg-white/5 text-white/40 hover:text-red-400'
              }`}
            >
              <Heart size={16} fill={result.liked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              {copied ? <Check size={16} className="text-accent-cyan" /> : <Share2 size={16} />}
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative mx-5 mb-5 rounded-2xl overflow-hidden bg-white/3 aspect-square">
          {!imageLoaded && (
            <div className="absolute inset-0 shimmer rounded-2xl" />
          )}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={imageLoaded ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Image
              src={result.imageUrl}
              alt="Fused emoji"
              fill
              className="object-cover"
              onLoad={() => setImageLoaded(true)}
              unoptimized
            />
          </motion.div>

          {/* Subtle reflection */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 pointer-events-none rounded-2xl" />
        </div>

        {/* Download row */}
        <div className="flex items-center gap-2 px-5 pb-5">
          <button
            onClick={handleDownload}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-sm"
          >
            <Download size={15} />
            Download PNG
          </button>
          <button
            onClick={onReset}
            className="p-3 glass-card hover:border-white/20 transition-all"
          >
            <RefreshCw size={16} className="text-white/50 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Prompt used */}
      {result.prompt && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-white/25 font-mono mt-4 px-4"
        >
          "{result.prompt}"
        </motion.p>
      )}
    </motion.div>
  )
}
