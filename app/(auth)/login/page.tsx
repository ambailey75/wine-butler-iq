'use client'

import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }

    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#c9a84c', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
          Check your email
        </p>
        <p style={{ color: '#d4b8be', fontFamily: 'Arial, sans-serif', fontSize: '0.9rem', lineHeight: '1.6' }}>
          We sent a magic link to <strong>{email}</strong>. Click it to sign in.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Label htmlFor="email" style={{ color: '#d4b8be', fontFamily: 'Arial, sans-serif' }}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border-[#6B212E] bg-[#2a1115] text-[#f5f0eb] placeholder:text-[#7a5a60] focus-visible:ring-[#B89600]"
        />
      </div>

      {status === 'error' && (
        <p style={{ color: '#e07a7a', fontFamily: 'Arial, sans-serif', fontSize: '0.85rem' }}>
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-[#B89600] text-[#1a0a0e] hover:bg-[#c9a84c]"
      >
        {status === 'sending' ? 'Sending...' : 'Send magic link'}
      </Button>
    </form>
  )
}
