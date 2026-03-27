'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import Navbar from '@/components/Navbar'
import EmojiSelector from '@/components/EmojiSelector'
import PromptInput from '@/components/PromptInput'
import FuseButton from '@/components/FuseButton'
import OutputGallery from '@/components/OutputGallery'
import LoginModal from '@/components/LoginModal'

const WebGLBackground = dynamic(() => import('@/components/three/WebGLBackground'), { ssr: false })

interface FusionResult {
  id: string
  imageUrl: string
  emojis: string[]
  prompt?: string
  style?: string
  liked?: boolean
}

function HomeContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [emojis, setEmojis] = useState<string[]>([])
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FusionResult | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [fusingAnimation, setFusingAnimation] = useState(false)

  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setLoginOpen(true)
    }
  }, [searchParams])

  const handleFuse = async () => {
    if (!session) {
      setLoginOpen(true)
      return
    }
    if (emojis.length < 2) {
      toast.error('Select at least 2 emojis')
      return
    }

    setLoading(true)
    setFusingAnimation(true)

    try {
      const res = await fetch('/api/fuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emojis, prompt, style }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Fusion failed')

      setResult(data.fusion)
      toast.success('Fusion complete! ✨')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
      setFusingAnimation(false)
    }
  }

  const handleLike = async (id: string) => {
    if (!session) { setLoginOpen(true); return }
    try {
      await fetch(`/api/fusions/${id}/like`, { method: 'POST' })
      setResult((prev) => prev ? { ...prev, liked: !prev.liked } : null)
    } catch {
      toast.error('Failed to like')
    }
  }

  const handleReset = () => {
    setResult(null)
    setEmojis([])
    setPrompt('')
    setStyle('')
  }

  return (
    <>
      <WebGLBackground />
      <div className="noise-overlay" />

      <div className="page-wrapper">
        <Navbar />

        {/* Hero */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-accent-purple/20 text-xs font-mono text-accent-purple mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              AI-Powered Emoji Fusion
            </div>
            <h1 className="gradient-text mb-4">
              Fuse Emojis with AI
            </h1>
            <p className="text-white/40 text-base md:text-lg max-w-md mx-auto">
              Select any emojis, add a prompt, and watch AI create something entirely new.
            </p>
          </motion.div>

          {/* Blur overlay for non-logged users */}
          <AnimatePresence>
            {status === 'unauthenticated' && !loginOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-[2px] pt-32"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-8 text-center max-w-sm mx-4"
                >
                  <div className="text-4xl mb-4">🔐</div>
                  <h3 className="text-xl font-black mb-2">Login to Start Fusing</h3>
                  <p className="text-sm text-white/40 mb-6">
                    Create an account to fuse emojis, save your creations, and explore the community.
                  </p>
                  <button
                    onClick={() => setLoginOpen(true)}
                    className="btn-primary w-full"
                  >
                    Get Started Free
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main flow */}
          <div
            className={`w-full max-w-2xl flex flex-col items-center gap-8 transition-all duration-300 ${
              status === 'unauthenticated' ? 'pointer-events-none select-none blur-sm' : ''
            }`}
          >
            {/* Step 1: Emoji selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-6 md:p-8 w-full"
            >
              <EmojiSelector selectedEmojis={emojis} onEmojiChange={setEmojis} />
            </motion.div>

            {/* Step 2: Prompt + style (only after 2+ emojis) */}
            <AnimatePresence>
              {emojis.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full glass-card p-6 md:p-8 overflow-hidden"
                >
                  <PromptInput
                    prompt={prompt}
                    selectedStyle={style}
                    onPromptChange={setPrompt}
                    onStyleChange={setStyle}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Fuse */}
            <AnimatePresence>
              {emojis.length >= 2 && (
                <FuseButton
                  onClick={handleFuse}
                  loading={loading}
                  disabled={emojis.length < 2}
                  emojis={emojis}
                />
              )}
            </AnimatePresence>

            {/* Fusion animation */}
            <AnimatePresence>
              {fusingAnimation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
                >
                  <div className="flex items-center gap-4">
                    {emojis.map((e, i) => (
                      <motion.span
                        key={i}
                        className="text-6xl"
                        animate={{
                          x: [0, (emojis.length / 2 - i) * -30],
                          scale: [1, 0.2],
                          opacity: [1, 0],
                          rotate: [0, 180],
                        }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                      >
                        {e}
                      </motion.span>
                    ))}
                    <motion.div
                      className="text-6xl"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      ✨
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <OutputGallery
                  result={result}
                  onLike={handleLike}
                  onReset={handleReset}
                />
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  )
}
