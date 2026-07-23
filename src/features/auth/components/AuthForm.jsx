import { useState } from 'react'

export function AuthForm({ mode, onSubmit }) {
  const isRegister = mode === 'register'
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function change(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = isRegister
        ? form
        : { email: form.email, password: form.password }
      await onSubmit(payload)
    } catch (submitError) {
      setError(submitError.message || 'İşlem tamamlanamadı.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {isRegister && (
        <>
          <label className="block text-sm font-medium text-slate-700">
            Ad soyad
            <input
              required
              value={form.displayName}
              onChange={change('displayName')}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Kullanıcı adı
            <input
              required
              minLength={3}
              value={form.username}
              onChange={change('username')}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
            />
          </label>
        </>
      )}
      <label className="block text-sm font-medium text-slate-700">
        E-posta
        <input
          required
          type="email"
          value={form.email}
          onChange={change('email')}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Şifre
        <input
          required
          minLength={6}
          type="password"
          value={form.password}
          onChange={change('password')}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
        />
      </label>
      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <button
        disabled={submitting}
        className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
      >
        {submitting ? 'İşleniyor…' : isRegister ? 'Hesap oluştur' : 'Giriş yap'}
      </button>
    </form>
  )
}
