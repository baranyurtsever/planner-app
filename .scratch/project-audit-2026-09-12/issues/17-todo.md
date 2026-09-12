# 17 — Mobil takvim ve hata kurtarma kabul kriterleri eksik

Status: resolved
Priority: P2
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Kart hareketi uzun basma beklemeden pointerdown ile başlıyor; touch-none kaydırmayı engelliyor. Her items güncellemesi scrollTop'u sıfırlıyor. Şimdi çizgisi timer ile ilerlemiyor; yazma hatasında tekrar dene yok. Editörde Escape/focus trap bulunmuyor.

## Kod referansları

- `src/features/itinerary/pages/CalendarPage.jsx:95`
- `src/features/itinerary/pages/CalendarPage.jsx:169`
- `docs/specs/interactive-calendar.md`

## Yapılacaklar ve kabul kriteri

- [x] Uzun basma ve kaydırmayı ayır; otomatik scroll'u ilk yükleme/tarih değişimine sınırla; zaman çizgisi timer, yeniden deneme ve klavye modal davranışı ekle.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Touch kart sürüklemesi 450 ms uzun basmaya alındı ve dikey kaydırma korundu. Otomatik scroll tarih aralığı başına tek çalışıyor; şimdi çizgisi dakikada yenileniyor. Başarısız takvim yazımına yeniden deneme, editör modalına Escape ve Tab focus sınırı eklendi; etkileşim testleri yazıldı.
2026-09-12: Code review sonrası doğrudan yetkili drag/resize işlemleri optimistic gösterime alındı; yazma hatasında geçici zaman kaldırılarak kartın eski konuma döndüğü test edildi. Öneri akışı optimistic resmî değişiklik yapmıyor.
