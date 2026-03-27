'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Heart, TrendingUp, Clock, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const WebGLBackground = dynamic(() => import('@/components/three/WebGLBackground'), { ssr: false })

interface PublicFusion {
  id: string
  imageUrl: string
  emojis: string[]
  style?: string
  prompt?: string
  likeCount: number
  liked: boolean
  createdAt: string
  user: { name: string; image: string }
}

const FILTERS = [
  { id: 'trending', label: 'Trending', icon: <TrendingUp size={13} /> },
  { id: 'recent', label: 'Recent', icon: <Clock size={13} /> },
]

export default function Explore() {
  const { data: session } = useSession()
  const [filter, setFilter] = useState('trending')
  const [fusions, setFusions] = useState<PublicFusion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchExplore() }, [filter])

  const fetchExplore = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/fusions/explore?filter=${filter}`)
      const data = await res.json()
      setFusions(data.fusions || [])
    } catch {
      toast.error('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (id: string) => {
    if (!session) { toast('Login to like!'); return }
    await fetch(`/api/fusions/${id}/like`, { method: 'POST' })
    setFusions((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, liked: !f.liked, likeCount: f.likeCount + (f.liked ? -1 : 1) }
          : f
      )
    )
  }

  const filtered = fusions.filter(
    (f) =>
      !search ||
      f.emojis.some((e) => e.includes(search)) ||
      f.prompt?.toLowerCase().includes(search.toLowerCase()) ||
      f.style?.toLowerCase().includes(search.toLowerCase())
  )

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
            <h1 className="text-3xl font-black gradient-text mb-2">Explore</h1>
            <p className="text-white/40 text-sm">Discover amazing emoji fusions from the community</p>
          </motion.div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
            {/* Filter pills */}
            <div className="flex gap-1.5 bg-white/3 p-1 rounded-xl">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filter === f.id
                      ? 'bg-accent-purple/80 text-white'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search emoji or style..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20 placeholder:text-white/25 transition-colors"
              />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square glass-card shimmer rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-white/40 font-mono text-sm">No fusions found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((fusion, i) => (
                <motion.div
                  key={fusion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card overflow-hidden group hover:border-white/15 transition-all duration-300"
                >
                  <Link href={`/fusion/${fusion.id}`} className="block relative aspect-square">
                    <Image
                      src={fusion.imageUrl}
                      alt={fusion.emojis.join('')}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </Link>

                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {fusion.user?.image && (
                        <Image
                          src={fusion.user.image}
                          alt={fusion.user.name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      )}
                      <span className="text-sm">{fusion.emojis.join('')}</span>
                    </div>
                    <button
                      onClick={() => handleLike(fusion.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        fusion.liked ? 'text-red-400' : 'text-white/30 hover:text-red-400'
                      }`}
                    >
                      <Heart size={13} fill={fusion.liked ? 'currentColor' : 'none'} />
                      {fusion.likeCount}
                    </button>
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
