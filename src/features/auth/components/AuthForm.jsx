import { useState } from 'react'
import { authErrorMessage } from '../domain/authError'

export function AuthForm({ mode, onSubmit, onResetPassword }) {
  const isRegister = mode === 'register'
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  function change(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSubmitting(true)
    try {
      const payload = isRegister
        ? form
        : { email: form.email, password: form.password }
      await onSubmit(payload)
    } catch (submitError) {
      setError(authErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  async function requestPasswordReset() {
    setError('')
    setNotice('')
    if (!form.email.trim()) {
      setError('Şifreni sıfırlamak için önce e-posta adresini gir.')
      return
    }

    setSubmitting(true)
    try {
      await onResetPassword(form.email.trim())
      setNotice('Bu adres kayıtlıysa şifre sıfırlama bağlantısı e-posta adresine gönderildi.')
    } catch (resetError) {
      setError(authErrorMessage(resetError))
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
      {!isRegister && (
        <div className="-mt-2 text-right">
          <button
            type="button"
            disabled={submitting}
            onClick={requestPasswordReset}
            className="text-sm font-semibold text-teal-700 hover:text-teal-900 disabled:opacity-50"
          >
            Şifremi unuttum
          </button>
        </div>
      )}
      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {notice && <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">{notice}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
      >
        {submitting ? 'İşleniyor…' : isRegister ? 'Hesap oluştur' : 'Giriş yap'}
      </button>
    </form>
  )
}
