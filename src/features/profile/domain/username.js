export function normalizeUsername(value) {
  const normalized = value.trim().toLocaleLowerCase('en-US')

  if (!/^[a-z0-9_]{3,24}$/.test(normalized)) {
    throw new Error('Kullanıcı adı yalnızca küçük harf, rakam ve alt çizgi içerebilir.')
  }

  return normalized
}
