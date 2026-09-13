import { useEffect, useState } from 'react'

export function OfflineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  if (online) return null
  return <div role="status" className="bg-amber-100 px-4 py-2 text-center text-sm font-bold text-amber-950">Çevrimdışısın · Son eşitlenen plan salt okunur gösteriliyor.</div>
}
