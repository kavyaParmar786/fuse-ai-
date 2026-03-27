'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Heart, Download, Share2, Check, ArrowLeft, Sparkles } from 'lucide-react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'

const WebGLBackground = dynamic(() => import('@/components/three/WebGLBackground'), { ssr: false })

interface Fusion {
  id: string
  imageUrl: string
  emojis: string[]
  prompt?: string
  style?: string
  likeCount: number
  createdAt: string
  user: { name: string; image: string | null }
}

export default function FusionDetailClient({ fusion }: { fusion: Fusion }) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(fusion.likeCount)
  const [copied, setCopied] = useState(false)

  const handleLike = async () => {
    if (!session) { toast('Login to like!'); return }
    await fetch(`/api/fusions/${fusion.id}/like`, { method: 'POST' })
    const next = !liked
    setLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    try {
      const r = await fetch(fusion.imageUrl)
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `emoji-fusion-${fusion.id}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  return (
    <>
      <WebGLBackground />
      <div className="noise-overlay" />
      <div className="page-wrapper">
        <Navbar />

        <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">
          {/* Back */}
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Explore
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-square">
              <Image
                src={fusion.imageUrl}
                alt={fusion.emojis.join('')}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              {/* Emojis + style */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl mb-1">{fusion.emojis.join(' + ')}</p>
                  {fusion.style && (
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-accent-purple/20 text-accent-purple capitalize">
                      {fusion.style}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                      liked
                        ? 'bg-red-500/20 text-red-400'
                        : 'glass-card hover:border-white/20 text-white/50 hover:text-red-400'
                    }`}
                  >
                    <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
                    {likeCount}
                  </button>
                </div>
              </div>

              {/* Prompt */}
              {fusion.prompt && (
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-xs text-white/30 font-mono mb-1">PROMPT</p>
                  <p className="text-sm text-white/70">"{fusion.prompt}"</p>
                </div>
              )}

              {/* Creator */}
              <div className="flex items-center gap-2 pt-1">
                {fusion.user.image && (
                  <Image
                    src={fusion.user.image}
                    alt={fusion.user.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm text-white/40">by {fusion.user.name}</span>
                <span className="text-white/20">·</span>
                <span className="text-xs text-white/30 font-mono">
                  {new Date(fusion.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-sm"
                >
                  <Download size={15} />
                  Download
                </button>
                <button
                  onClick={handleShare}
                  className="glass-card px-4 py-3 hover:border-white/20 transition-all flex items-center gap-2 text-sm"
                >
                  {copied ? <Check size={15} className="text-accent-cyan" /> : <Share2 size={15} />}
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>

              {/* CTA */}
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-accent-purple/30 text-accent-purple text-sm font-semibold hover:bg-accent-purple/10 transition-all"
              >
                <Sparkles size={14} />
                Create your own fusion
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
