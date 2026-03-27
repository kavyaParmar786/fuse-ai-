'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Heart, Download, Share2, ArrowLeft, Check } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const WebGLBackground = dynamic(() => import('@/components/three/WebGLBackground'), { ssr: false })

interface Fusion {
  id: string
  imageUrl: string
  emojis: string[]
  prompt?: string
  style?: string
  likeCount: number
  liked: boolean
  createdAt: string
  user?: { name: string; image: string }
}

export default function FusionPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const [fusion, setFusion] = useState<Fusion | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/fusions/${id}`)
      .then((r) => r.json())
      .then((d) => { setFusion(d.fusion); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleLike = async () => {
    if (!session) { toast('Login to like!'); return }
    await fetch(`/api/fusions/${id}/like`, { method: 'POST' })
    setFusion((prev) => prev ? {
      ...prev,
      liked: !prev.liked,
      likeCount: prev.likeCount + (prev.liked ? -1 : 1),
    } : null)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    if (!fusion) return
    try {
      const res = await fetch(fusion.imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `emoji-fusion-${id}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded!')
    } catch {
      toast.error('Download failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/30 font-mono text-sm animate-pulse">Loading fusion...</div>
      </div>
    )
  }

  if (!fusion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🌌</div>
        <p className="text-white/40 font-mono">Fusion not found</p>
        <Link href="/explore" className="btn-primary text-sm px-6 py-3">Browse Explore</Link>
      </div>
    )
  }

  return (
    <>
      <WebGLBackground />
      <div className="noise-overlay" />
      <div className="page-wrapper">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">

          {/* Back */}
          <Link href="/explore" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={14} />
            Back to Explore
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-purple/5 pointer-events-none" />

            {/* Image */}
            <div className="relative aspect-square">
              <Image
                src={fusion.imageUrl}
                alt={fusion.emojis.join('')}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Info */}
            <div className="p-6 space-y-5">
              {/* Emojis + style */}
              <div>
                <div className="text-4xl mb-2">{fusion.emojis.join(' + ')}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {fusion.style && (
                    <span className="px-2.5 py-1 rounded-lg bg-accent-purple/20 text-accent-purple text-xs font-mono">
                      {fusion.style}
                    </span>
                  )}
                  <span className="text-xs text-white/30 font-mono">
                    {new Date(fusion.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Prompt */}
              {fusion.prompt && (
                <p className="text-sm text-white/50 italic border-l-2 border-accent-purple/40 pl-3">
                  "{fusion.prompt}"
                </p>
              )}

              {/* Creator */}
              {fusion.user && (
                <div className="flex items-center gap-2">
                  {fusion.user.image && (
                    <Image src={fusion.user.image} alt={fusion.user.name} width={24} height={24} className="rounded-full" />
                  )}
                  <span className="text-xs text-white/40">by {fusion.user.name}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    fusion.liked
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'glass-card hover:border-white/20 text-white/60 hover:text-red-400'
                  }`}
                >
                  <Heart size={15} fill={fusion.liked ? 'currentColor' : 'none'} />
                  {fusion.likeCount}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm text-white/60 hover:text-white transition-all"
                >
                  {copied ? <Check size={15} className="text-accent-cyan" /> : <Share2 size={15} />}
                  {copied ? 'Copied!' : 'Share'}
                </button>

                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 ml-auto"
                >
                  <Download size={15} />
                  Download
                </button>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-white/30 text-sm mb-3">Want to create your own?</p>
            <Link href="/" className="btn-primary text-sm px-8 py-3">
              Start Fusing ✨
            </Link>
          </motion.div>

        </div>
      </div>
    </>
  )
}
