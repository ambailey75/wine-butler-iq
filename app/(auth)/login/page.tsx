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
        <p style={{ color: '#6B5B52', fontFamily: 'Arial, sans-serif', fontSize: '0.9rem', lineHeight: '1.6' }}>
          We sent a magic link to <strong>{email}</strong>. Click it to sign in.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Label htmlFor="email" style={{ color: '#6B5B52', fontFamily: 'Arial, sans-serif' }}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border-secondary bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
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
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {status === 'sending' ? 'Sending...' : 'Send magic link'}
      </Button>
    </form>
  )
}
