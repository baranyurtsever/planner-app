import { afterEach, describe, expect, it } from 'vitest'
import { assertOnline } from './network'

describe('offline writes', () => {
  afterEach(() => Object.defineProperty(navigator, 'onLine', { configurable: true, value: true }))

  it('blocks changes with a clear message while offline', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
    expect(() => assertOnline()).toThrow('Çevrimdışıyken değişiklik yapılamaz')
  })
})
