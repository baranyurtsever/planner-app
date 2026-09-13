import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('PWA assets', () => {
  it('declares installable icons and caches only same-origin application assets', () => {
    const manifest = JSON.parse(fs.readFileSync('public/manifest.webmanifest', 'utf8'))
    const serviceWorker = fs.readFileSync('public/sw.js', 'utf8')
    expect(manifest.display).toBe('standalone')
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']))
    expect(fs.existsSync('public/icons/peregrin-192.png')).toBe(true)
    expect(fs.existsSync('public/icons/peregrin-512.png')).toBe(true)
    expect(serviceWorker).toContain("url.origin !== self.location.origin")
    expect(serviceWorker).not.toContain('firestore.googleapis.com')
  })
})
