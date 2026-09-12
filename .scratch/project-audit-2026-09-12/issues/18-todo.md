# 18 — Test kapsamı kritik iş akışlarını doğrulamıyor

Status: needs-triage
Priority: P2
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

35 uygulama ve 17 kural testi yeşil; ancak gerçek repository batch akışları, iç içe form olayları, pointer sürükleme ve iki istemci yarışları kapsam dışında. DOM containment testi gerçek piksel hizasını ölçmüyor. ADR'nin hedefli E2E şartı karşılanmıyor.

## Kod referansları

- `tests/firestore/access.rules.test.js:1`
- `src/features/itinerary/components/CalendarScrollFrame.test.jsx:1`
- `docs/adr/0002-rebuild-in-feature-oriented-vertical-slices.md`

## Yapılacaklar ve kabul kriteri

- [ ] Owner/editor/viewer oturumlarıyla oluştur-drag-resize-öneri-onay-katıl-ayrıl E2E matrisi kur; repository işlemlerini emülatöre bağla; public anonim erişim testlerini ekle.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

