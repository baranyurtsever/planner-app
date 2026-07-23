import { Link, Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#f4f1ea] text-slate-900">
      <header className="border-b border-slate-200/80 bg-[#f4f1ea]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3 font-bold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-800 text-white">P</span>
            Peregrin
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:border-teal-600"
          >
            Giriş yap
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <Outlet />
      </main>
    </div>
  )
}
