'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerClinicSchema } from '@riseup/shared'
import type { RegisterClinicInput } from '@riseup/shared'
import api from '@/lib/api'
import { setToken } from '@/lib/auth'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

type FieldProps = {
  id: string
  label: string
  type?: string
  placeholder: string
  error?: string
  autoComplete?: string
  props: UseFormRegisterReturn
}

function Field({ id, label, type = 'text', placeholder, error, autoComplete, props }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#111111]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...props}
        className="w-full rounded-lg border px-3 py-2.5 text-sm text-[#111111] placeholder-[#bbb] outline-none transition-shadow focus:ring-2 focus:ring-[#29d9d5]/40"
        style={{ borderColor: error ? '#ef4444' : '#e8eaed' }}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterClinicInput>({
    resolver: zodResolver(registerClinicSchema),
  })

  // Auto-generate slug from clinic name
  const clinicName = watch('clinicName')
  useEffect(() => {
    if (clinicName) setValue('clinicSlug', slugify(clinicName), { shouldValidate: false })
  }, [clinicName, setValue])

  const onSubmit = async (data: RegisterClinicInput) => {
    setServerError('')
    try {
      const res = await api.post('/api/auth/register', data)
      setToken(res.data.accessToken)
      if (res.data.refreshToken) {
        localStorage.setItem('riseup_refresh_token', res.data.refreshToken)
      }
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } }
      const message = error.response?.data?.message
      setServerError(Array.isArray(message) ? message[0] : (message ?? 'Erro ao cadastrar'))
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div
        className="rounded-2xl bg-white p-8 shadow-sm"
        style={{ border: '1px solid #e8eaed' }}
      >
        <h1 className="mb-1 text-2xl font-bold text-[#111111]">Criar conta</h1>
        <p className="mb-6 text-sm text-[#888888]">Cadastre sua clínica gratuitamente</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field
            id="clinicName"
            label="Nome da clínica"
            placeholder="Clínica Sorriso Perfeito"
            error={errors.clinicName?.message}
            props={register('clinicName')}
          />

          {/* Hidden slug field — auto-populated */}
          <input type="hidden" {...register('clinicSlug')} />

          <Field
            id="adminName"
            label="Seu nome"
            placeholder="Dr. João Silva"
            autoComplete="name"
            error={errors.adminName?.message}
            props={register('adminName')}
          />

          <Field
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            error={errors.email?.message}
            props={register('email')}
          />

          <Field
            id="password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password?.message}
            props={register('password')}
          />

          <Field
            id="confirmPassword"
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            props={register('confirmPassword')}
          />

          {serverError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#29d9d5' }}
          >
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#888888]">
          Já tem conta?{' '}
          <Link
            href="/login"
            className="font-medium underline-offset-4 hover:underline"
            style={{ color: '#29d9d5' }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
