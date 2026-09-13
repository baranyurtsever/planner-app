import { beforeEach, describe, expect, it, vi } from 'vitest'
import { searchPlaces } from './placeSearchRepository'

describe('searchPlaces', () => {
  beforeEach(() => {
    const values = new Map()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: (key) => values.delete(key),
        clear: () => values.clear(),
      },
    })
  })

  it('runs only an explicit query and caches normalized results', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => [{
      place_id: 1, osm_type: 'node', osm_id: 2, name: 'Louvre', display_name: 'Louvre, Paris', lat: '48.86', lon: '2.33',
    }] })
    const first = await searchPlaces('Louvre Paris', { fetcher })
    const second = await searchPlaces('Louvre Paris', { fetcher })

    expect(first[0]).toMatchObject({ name: 'Louvre', lat: 48.86, lng: 2.33 })
    expect(second).toEqual(first)
    expect(fetcher).toHaveBeenCalledOnce()
    expect(fetcher.mock.calls[0][0]).toContain('addressdetails=1')
  })

  it('rejects too-short searches before making a request', async () => {
    const fetcher = vi.fn()
    await expect(searchPlaces('ab', { fetcher })).rejects.toThrow('en az 3 karakter')
    expect(fetcher).not.toHaveBeenCalled()
  })
})
