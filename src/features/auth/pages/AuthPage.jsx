import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../authState'
import { AuthForm } from '../components/AuthForm'
import { login, register, resetPassword } from '../data/authRepository'

export function AuthPage({ mode }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (!loading && user) return <Navigate to="/app/trips" replace />

  async function submit(payload) {
    if (mode === 'register') {
      const result = await register(payload)
      if (result.warnings.length) {
        window.sessionStorage.setItem('registration-completion', JSON.stringify({
          displayName: payload.displayName,
          warnings: result.warnings,
        }))
      }
    } else await login(payload)
    navigate('/app/trips')
  }

  const isRegister = mode === 'register'
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
          {isRegister ? 'Yeni yolculuk' : 'Tekrar hoş geldin'}
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">
          {isRegister ? 'Peregrin hesabını oluştur' : 'Gezilerine dön'}
        </h1>
        <div className="mt-7">
          <AuthForm mode={mode} onSubmit={submit} onResetPassword={resetPassword} />
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? 'Zaten hesabın var mı?' : 'Henüz hesabın yok mu?'}{' '}
          <Link
            className="font-bold text-teal-700"
            to={isRegister ? '/login' : '/register'}
          >
            {isRegister ? 'Giriş yap' : 'Hesap oluştur'}
          </Link>
        </p>
      </div>
    </div>
  )
}
