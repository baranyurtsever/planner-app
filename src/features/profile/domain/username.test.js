import { describe, expect, it } from 'vitest'
import { normalizeUsername } from './username'

describe('username', () => {
  it('normalizes case and surrounding whitespace for global uniqueness', () => {
    expect(normalizeUsername('  Gezgin_Ali  ')).toBe('gezgin_ali')
  })

  it('rejects characters that cannot appear in profile URLs', () => {
    expect(() => normalizeUsername('gezgin ali')).toThrow(
      'Kullanıcı adı yalnızca küçük harf, rakam ve alt çizgi içerebilir.',
    )
  })
})
