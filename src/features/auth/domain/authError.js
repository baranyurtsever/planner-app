const messages = {
  'auth/invalid-credential': 'E-posta veya şifre hatalı.',
  'auth/invalid-email': 'Geçerli bir e-posta adresi gir.',
  'auth/too-many-requests': 'Çok fazla deneme yapıldı. Bir süre sonra tekrar dene.',
  'auth/network-request-failed': 'Bağlantı kurulamadı. İnternet bağlantını kontrol et.',
  'auth/email-already-in-use': 'Bu e-posta adresiyle zaten bir hesap var.',
  'auth/weak-password': 'Daha güçlü bir şifre seç.',
}

export function authErrorMessage(error) {
  return messages[error?.code] || 'İşlem tamamlanamadı. Lütfen tekrar dene.'
}
