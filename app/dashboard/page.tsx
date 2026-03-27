'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Heart, Clock, Grid3X3, Sparkles, Download } from 'lucide-react'
import Navbar from '@/components/Navbar'
import toast from 'react-hot-toast'

const WebGLBackground = dynamic(() => import('@/components/three/WebGLBackground'), { ssr: false })

const TABS = [
  { id: 'fusions', label: 'My Fusions', icon: <Grid3X3 size={14} /> },
  { id: 'liked', label: 'Liked', icon: <Heart size={14} /> },
  { id: 'history', label: 'History', icon: <Clock size={14} /> },
]

interface Fusion {
  id: string
  imageUrl: string
  emojis: string[]
  style?: string
  prompt?: string
  liked: boolean
  createdAt: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState('fusions')
  const [fusions, setFusions] = useState<Fusion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/?login=true')
  }, [status])

  useEffect(() => {
    if (session) fetchFusions()
  }, [session, tab])

  const fetchFusions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/fusions?tab=${tab}`)
      const data = await res.json()
      setFusions(data.fusions || [])
    } catch {
      toast.error('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (id: string) => {
    await fetch(`/api/fusions/${id}/like`, { method: 'POST' })
    setFusions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, liked: !f.liked } : f))
    )
  }

  const handleDownload = async (fusion: Fusion) => {
    try {
      const response = await fetch(fusion.imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fusion-${fusion.id}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 font-mono text-sm animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <WebGLBackground />
      <div className="noise-overlay" />
      <div className="page-wrapper">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 pt-28 pb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-2">
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-accent-purple/40"
                />
              )}
              <div>
                <h1 className="text-2xl font-black gradient-text">My Dashboard</h1>
                <p className="text-sm text-white/40">{session?.user?.name}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mt-6">
              {[
                { label: 'Fusions', value: fusions.length },
                { label: 'Liked', value: fusions.filter(f => f.liked).length },
              ].map((stat) => (
                <div key={stat.label} className="glass-card px-5 py-3 text-center">
                  <div className="text-2xl font-black gradient-text">{stat.value}</div>
                  <div className="text-xs text-white/40 font-mono">{stat.label}</div>
                </div>
              ))}
              <Link
                href="/"
                className="glass-card px-5 py-3 flex items-center gap-2 text-sm font-semibold text-accent-cyan hover:border-accent-cyan/40 transition-all"
              >
                <Sparkles size={14} />
                New Fusion
              </Link>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-white/3 p-1 rounded-2xl max-w-xs">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t.id
                    ? 'bg-accent-purple/80 text-white shadow-lg'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square glass-card shimmer rounded-2xl" />
              ))}
            </div>
          ) : fusions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-5xl mb-4">🌌</div>
              <p className="text-white/40 font-mono text-sm">
                {tab === 'fusions' ? 'No fusions yet. Go create one!' :
                 tab === 'liked' ? 'No liked fusions yet.' :
                 'No history yet.'}
              </p>
              {tab === 'fusions' && (
                <Link href="/" className="btn-primary inline-block mt-4 text-sm px-6 py-3">
                  Create First Fusion
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fusions.map((fusion, i) => (
                <motion.div
                  key={fusion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card overflow-hidden group hover:border-white/15 transition-all duration-300"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={fusion.imageUrl}
                      alt={fusion.emojis.join('')}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                    {/* Hover actions */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      <button
                        onClick={() => handleLike(fusion.id)}
                        className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
                          fusion.liked ? 'bg-red-500/70 text-white' : 'bg-black/40 text-white/70 hover:text-red-400'
                        }`}
                      >
                        <Heart size={14} fill={fusion.liked ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => handleDownload(fusion)}
                        className="p-2 rounded-lg bg-black/40 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
                      >
                        <Download size={14} />
                      </button>
                      <Link
                        href={`/fusion/${fusion.id}`}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-accent-purple/70 backdrop-blur-sm text-white text-xs font-semibold text-center hover:bg-accent-purple transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="text-sm">{fusion.emojis.join(' ')}</p>
                    <p className="text-xs text-white/30 font-mono mt-0.5">
                      {new Date(fusion.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
