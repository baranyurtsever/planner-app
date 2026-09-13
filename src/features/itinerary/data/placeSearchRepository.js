import { normalizePlaceSearchResult } from '../domain/place'

const DEFAULT_ENDPOINT = 'https://nominatim.openstreetmap.org'
const CACHE_PREFIX = 'peregrin:place-search:v1:'
const LAST_REQUEST_KEY = 'peregrin:place-search:last-request'
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000
let lastRequestAt = 0

function cacheKey(query) {
  return `${CACHE_PREFIX}${query.trim().toLocaleLowerCase('tr-TR')}`
}

function readCache(query) {
  try {
    const cached = JSON.parse(window.localStorage.getItem(cacheKey(query)))
    return cached?.cachedAt > Date.now() - CACHE_TTL_MS ? cached.results : null
  } catch {
    return null
  }
}

function writeCache(query, results) {
  try {
    window.localStorage.setItem(cacheKey(query), JSON.stringify({ results, cachedAt: Date.now() }))
  } catch {
    // Search still works if browser storage is unavailable.
  }
}

export async function searchPlaces(query, { fetcher = fetch } = {}) {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 3) throw new Error('Yer aramak için en az 3 karakter yaz.')
  const cached = readCache(normalizedQuery)
  if (cached) return cached

  try {
    lastRequestAt = Math.max(lastRequestAt, Number(window.localStorage.getItem(LAST_REQUEST_KEY)) || 0)
  } catch {
    // The in-memory limiter remains active.
  }
  const wait = Math.max(0, 1000 - (Date.now() - lastRequestAt))
  if (wait) await new Promise((resolve) => window.setTimeout(resolve, wait))
  lastRequestAt = Date.now()
  try {
    window.localStorage.setItem(LAST_REQUEST_KEY, String(lastRequestAt))
  } catch {
    // The in-memory limiter remains active.
  }

  const endpoint = import.meta.env.VITE_GEOCODING_BASE_URL || DEFAULT_ENDPOINT
  const url = new URL('/search', endpoint)
  url.search = new URLSearchParams({
    q: normalizedQuery,
    format: 'jsonv2',
    limit: '5',
    addressdetails: '1',
    extratags: '1',
    namedetails: '1',
    'accept-language': navigator.language || 'tr',
  })
  const response = await fetcher(url.toString(), { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Yer arama servisine ulaşılamadı. Biraz sonra tekrar dene.')
  const payload = await response.json()
  const results = Array.isArray(payload) ? payload.map(normalizePlaceSearchResult) : []
  writeCache(normalizedQuery, results)
  return results
}
