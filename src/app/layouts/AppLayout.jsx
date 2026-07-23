import { NavLink, Outlet } from 'react-router-dom'
import { logout } from '../../features/auth/data/authRepository'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-8">
            <NavLink to="/app/trips" className="flex items-center gap-3 font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-800 text-white">P</span>
              Peregrin
            </NavLink>
            <NavLink
              to="/app/trips"
              className={({ isActive }) =>
                `text-sm font-semibold ${isActive ? 'text-teal-800' : 'text-slate-500'}`
              }
            >
              Geziler
            </NavLink>
            <NavLink
              to="/app/people"
              className={({ isActive }) =>
                `text-sm font-semibold ${isActive ? 'text-teal-800' : 'text-slate-500'}`
              }
            >
              Kişiler
            </NavLink>
            <NavLink
              to="/app/profile"
              className={({ isActive }) =>
                `text-sm font-semibold ${isActive ? 'text-teal-800' : 'text-slate-500'}`
              }
            >
              Profilim
            </NavLink>
          </div>
          <button
            onClick={() => logout()}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Çıkış
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  )
}
