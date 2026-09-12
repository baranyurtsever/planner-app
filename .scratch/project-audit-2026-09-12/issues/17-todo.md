# 17 — Mobil takvim ve hata kurtarma kabul kriterleri eksik

Status: needs-triage
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

- [ ] Uzun basma ve kaydırmayı ayır; otomatik scroll'u ilk yükleme/tarih değişimine sınırla; zaman çizgisi timer, yeniden deneme ve klavye modal davranışı ekle.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

