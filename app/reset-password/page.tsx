'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [isReset, setIsReset] = useState(false)

  // If Supabase redirected here with a session token, show the new password form
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsReset(true)
    })
  }, [])

  async function sendResetLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setMsg(error ? error.message : 'Reset link sent! Check your email.')
    setLoading(false)
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setMsg(error.message)
    } else {
      setMsg('Password updated successfully!')
      setTimeout(() => router.push('/login'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={isReset ? changePassword : sendResetLink}
        className="bg-zinc-900 p-8 rounded-2xl w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-white text-2xl font-bold text-center">
          {isReset ? 'Set New Password' : 'Forgot Password'}
        </h1>

        {msg && (
          <p className={`text-sm ${msg.includes('sent') || msg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
            {msg}
          </p>
        )}

        {isReset ? (
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="bg-zinc-800 text-white rounded-lg px-4 py-2 outline-none"
          />
        ) : (
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-zinc-800 text-white rounded-lg px-4 py-2 outline-none"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Please wait...' : isReset ? 'Change Password' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  )
}
