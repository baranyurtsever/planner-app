import { useState } from 'react'
import { searchPlaces } from '../data/placeSearchRepository'

export function PlaceSearchField({ disabled = false, initialQuery = '', onSelect }) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    event.stopPropagation()
    setLoading(true)
    setError('')
    try {
      setResults(await searchPlaces(query))
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 md:col-span-2">
      <div>
        <p className="text-sm font-black text-emerald-950">Yer ara</p>
        <p className="mt-1 text-xs text-emerald-800">Mekân veya adres seçildiğinde koordinat ve mevcut yer bilgileri otomatik doldurulur.</p>
      </div>
      <div className="mt-3 flex gap-2">
        <input aria-label="Yer arama sorgusu" value={query} disabled={disabled || loading} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'Enter') submit(event)
        }} placeholder="Örn. Galata Kulesi, İstanbul" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3" />
        <button type="button" disabled={disabled || loading} onClick={submit} className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white disabled:opacity-50">{loading ? 'Aranıyor…' : 'Ara'}</button>
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-rose-700">{error}</p>}
      {!loading && query.trim().length >= 3 && results.length === 0 && !error && <p className="mt-2 text-xs text-slate-500">Aramak için Ara düğmesine bas.</p>}
      {results.length > 0 && (
        <ul className="mt-3 divide-y divide-emerald-100 overflow-hidden rounded-xl border border-emerald-100 bg-white">
          {results.map((place) => (
            <li key={place.id}>
              <button type="button" onClick={() => { onSelect(place); setResults([]); setQuery(place.name) }} className="w-full px-4 py-3 text-left hover:bg-emerald-50">
                <span className="block font-bold text-slate-900">{place.name}</span>
                <span className="mt-1 block text-xs text-slate-500">{place.address}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-slate-500">Yer verisi © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="font-bold underline">OpenStreetMap katkıcıları</a></p>
    </section>
  )
}
