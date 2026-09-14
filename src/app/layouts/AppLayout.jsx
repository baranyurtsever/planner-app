import { NavLink, Outlet } from 'react-router-dom'
import { logout } from '../../features/auth/data/authRepository'
import { useAuth } from '../../features/auth/authState'
import { useActionCenter } from '../../features/action-center/hooks/useActionCenter'
import { clearAllOfflineCache } from '../../shared/offline/offlineCache'
import { OfflineStatus } from '../../shared/offline/OfflineStatus'
import { PwaInstallButton } from '../../shared/offline/PwaInstallButton'

export function AppLayout() {
  const { user } = useAuth()
  const actionCenter = useActionCenter(user.uid)
  return (
    <div className="app-shell min-h-screen text-slate-900">
      <OfflineStatus />
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="contents">
            <NavLink to="/app/trips" className="flex items-center gap-3 font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-800 text-white">P</span>
              Peregrin
            </NavLink>
            <nav aria-label="Ana navigasyon" className="main-nav order-last flex w-full gap-1 rounded-2xl bg-slate-100/80 p-1 sm:order-none sm:w-auto">
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
              to="/app/actions"
              className={({ isActive }) =>
                `flex items-center gap-1 text-sm font-semibold ${isActive ? 'text-teal-800' : 'text-slate-500'}`
              }
            >
              İşlemler
              {actionCenter.count > 0 && <span aria-label={`${actionCenter.count} bekleyen işlem`} className="grid min-w-5 place-items-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-black text-white">{actionCenter.count > 99 ? '99+' : actionCenter.count}</span>}
            </NavLink>
            <NavLink
              to="/app/profile"
              className={({ isActive }) =>
                `text-sm font-semibold ${isActive ? 'text-teal-800' : 'text-slate-500'}`
              }
            >
              Profilim
            </NavLink>
            </nav>
          </div>
          <PwaInstallButton />
          <button
            onClick={() => { clearAllOfflineCache(); logout() }}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Çıkış
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Outlet context={{ actionCenter }} />
      </main>
    </div>
  )
}
