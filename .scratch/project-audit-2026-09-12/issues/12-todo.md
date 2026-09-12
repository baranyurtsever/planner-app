# 12 — Zaman modeli sıfır süreyi ve geçersiz tarihleri kabul ediyor

Status: resolved
Priority: P2
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Başlangıç=bitiş hem domain hem kurallarda kabul ediliyor. 23:45 başlangıç için editör bitişi 23:45'e kırpıyor. Date-only yalnız regex kontrol ediyor; 2026-02-31 kabul edilir. Form saatleri 15 dakika hassasiyetini zorlamıyor.

## Kod referansları

- `src/features/itinerary/domain/planTime.js:17`
- `src/features/itinerary/components/PlanItemEditor.jsx:63`
- `src/features/itinerary/domain/calendarLayout.js:4`

## Yapılacaklar ve kabul kriteri

- [x] En az 15 dakika ve geçerli takvim tarihi doğrulaması ekle; gece yarısı bitişini ertesi güne taşı; DST boş/çift saatler için açık davranış ve testler tanımla.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Domain ve Firestore kurallarında en az 15 dakika, 15 dakikalık ızgara ve gerçek takvim tarihi doğrulandı. Gece yarısını aşan varsayılan bitiş ertesi güne taşındı. DST boş saatleri reddetme ve çift saatlerde ilk gerçekleşmeyi seçme davranışı testlerle belgelendi.
