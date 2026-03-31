'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@riseup/shared'
import type { LoginInput } from '@riseup/shared'
import api from '@/lib/api'
import { setToken } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setServerError('')
    try {
      const res = await api.post('/api/auth/login', data)
      setToken(res.data.accessToken)
      if (res.data.refreshToken) {
        localStorage.setItem('riseup_refresh_token', res.data.refreshToken)
      }
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } }
      const message = error.response?.data?.message
      setServerError(Array.isArray(message) ? message[0] : (message ?? 'Erro ao fazer login'))
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div
        className="rounded-2xl bg-white p-8 shadow-sm"
        style={{ border: '1px solid #e8eaed' }}
      >
        <h1 className="mb-1 text-2xl font-bold text-[#111111]">Entrar</h1>
        <p className="mb-6 text-sm text-[#888888]">Acesse sua conta RiseUp</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#111111]">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              {...register('email')}
              className="w-full rounded-lg border px-3 py-2.5 text-sm text-[#111111] placeholder-[#bbb] outline-none transition-shadow focus:ring-2 focus:ring-[#29d9d5]/40"
              style={{ borderColor: errors.email ? '#ef4444' : '#e8eaed' }}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#111111]">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full rounded-lg border px-3 py-2.5 text-sm text-[#111111] placeholder-[#bbb] outline-none transition-shadow focus:ring-2 focus:ring-[#29d9d5]/40"
              style={{ borderColor: errors.password ? '#ef4444' : '#e8eaed' }}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#29d9d5' }}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#888888]">
          Não tem conta?{' '}
          <Link
            href="/register"
            className="font-medium underline-offset-4 hover:underline"
            style={{ color: '#29d9d5' }}
          >
            Cadastre sua clínica
          </Link>
        </p>
      </div>
    </div>
  )
}
