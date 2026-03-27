'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Sparkles, LayoutDashboard, Globe, LogOut, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarMenu, setAvatarMenu] = useState(false)

  const navLinks = [
    { href: '/', label: 'Fuse', icon: <Sparkles size={14} /> },
    { href: '/explore', label: 'Explore', icon: <Globe size={14} /> },
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10">
      {/* Glass pill */}
      <div className="absolute inset-0 backdrop-blur-md bg-void/40 border-b border-white/5" />

      {/* Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-2 group">
        <span className="text-2xl">✨</span>
        <span className="font-black text-lg gradient-text tracking-tight">
          Emoji Fusion
        </span>
      </Link>

      {/* Desktop links */}
      <div className="relative z-10 hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="relative z-10 flex items-center gap-3">
        {session ? (
          <div className="relative">
            <button
              onClick={() => setAvatarMenu(!avatarMenu)}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-accent-purple/50 hover:border-accent-cyan transition-all duration-200 hover:scale-105"
            >
              {session.user?.image ? (
                <Image src={session.user.image} alt="avatar" width={36} height={36} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-sm font-bold">
                  {session.user?.name?.[0] ?? '?'}
                </div>
              )}
            </button>

            <AnimatePresence>
              {avatarMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 glass-card p-2 min-w-[160px] shadow-2xl"
                >
                  <p className="px-3 py-1.5 text-xs text-white/40 font-mono truncate">
                    {session.user?.email}
                  </p>
                  <hr className="border-white/10 my-1" />
                  <Link
                    href="/dashboard"
                    onClick={() => setAvatarMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors"
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            href="/?login=true"
            className="btn-primary text-sm px-5 py-2.5 rounded-xl"
          >
            Sign In
          </Link>
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 glass-card mx-4 mt-2 p-3 z-50"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm hover:bg-white/5 transition-colors"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
