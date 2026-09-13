export function assertOnline() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('Çevrimdışıyken değişiklik yapılamaz. Bağlantın gelince tekrar dene.')
  }
}
