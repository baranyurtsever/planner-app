# 04 — Sürükleme başlarken pointer capture sahibi kart kaldırılıyor

Status: needs-triage
Priority: P1
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

pointerdown kart üzerinde capture alıyor; interaction state sonrası aynı kart filtrelenip farklı key taşıyan preview kartıyla değişiyor. Capture sahibi DOM düğümü yok oluyor. Hareketin sürmesi, bırakılması ve tıklama davranışı gerçek tarayıcıda doğrulanmamış.

## Kod referansları

- `src/features/itinerary/pages/CalendarPage.jsx:224`
- `src/features/itinerary/pages/CalendarPage.jsx:401`

## Yapılacaklar ve kabul kriteri

- [ ] Capture işlemini kalıcı board düğümüne taşı veya orijinal kartı koru; drag eşiği, click suppression, pointercancel ve board dışına bırakma için gerçek pointer testleri ekle.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

