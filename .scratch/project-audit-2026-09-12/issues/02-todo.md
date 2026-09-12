# 02 — Public Plan Öğesi kopyası gizleme/silme sonrası açık kalabiliyor

Status: needs-triage
Priority: P1
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Kaynak Plan Öğesi güncellemesi/silmesi public kopyanın aynı işlemde silinmesini zorunlu kılmıyor. publicPlanItems okuma kuralı yalnız Gezi görünürlüğüne bakıyor. Kaynak private yapılırken public kopya korunursa eski içerik anonim okunabilir.

## Kod referansları

- `firestore.rules:221`
- `firestore.rules:310`
- `src/features/itinerary/data/planRepository.js:135`

## Yapılacaklar ve kabul kriteri

- [ ] Kaynak ve public projeksiyon yaşam döngüsünü sunucu tarafında güvenceye al; private geçişi ve silme için adversarial emülatör testleri ekle. Eski profile kayıtların projeksiyon backfill eksikliğini de gider.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

