'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { X, Sparkles, Mail } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [emailMode, setEmailMode] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const handleGoogle = async () => {
    setLoading('google')
    await signIn('google', { callbackUrl: '/' })
  }

  const handleEmail = async () => {
    if (!email) return
    setLoading('email')
    await signIn('email', { email, callbackUrl: '/' })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm">
              <div className="glass-card p-8 relative overflow-hidden">
                {/* Glow decoration */}
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-accent-purple/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-accent-cyan/20 rounded-full blur-3xl" />

                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div className="text-center mb-8 relative z-10">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-5xl mb-4 inline-block"
                  >
                    ✨
                  </motion.div>
                  <h2 className="text-2xl font-black gradient-text mb-2">Welcome to Fusion</h2>
                  <p className="text-sm text-white/40">Login to start fusing emojis with AI</p>
                </div>

                {/* Buttons */}
                <div className="space-y-3 relative z-10">
                  <button
                    onClick={handleGoogle}
                    disabled={!!loading}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white text-gray-900 font-semibold text-sm hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === 'google' ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    Continue with Google
                  </button>

                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-white/30 font-mono">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {!emailMode ? (
                    <button
                      onClick={() => setEmailMode(true)}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl glass-card border border-white/10 text-sm font-medium hover:border-white/20 transition-all hover:scale-[1.02]"
                    >
                      <Mail size={16} />
                      Continue with Email
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-purple/60 transition-colors placeholder:text-white/30"
                        onKeyDown={(e) => e.key === 'Enter' && handleEmail()}
                        autoFocus
                      />
                      <button
                        onClick={handleEmail}
                        disabled={!email || !!loading}
                        className="btn-primary w-full text-sm py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {loading === 'email' ? 'Sending link...' : 'Send magic link'}
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-center text-xs text-white/25 mt-6 relative z-10">
                  By continuing, you agree to our Terms & Privacy Policy
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
