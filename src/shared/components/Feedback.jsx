export function LoadingScreen({ label = 'Yükleniyor…' }) {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
        {label}
      </div>
    </div>
  )
}

export function ErrorMessage({ message }) {
  if (!message) return null
  return <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}
