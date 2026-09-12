# 02 — Public Plan Öğesi kopyası gizleme/silme sonrası açık kalabiliyor

Status: resolved
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

- [x] Kaynak ve public projeksiyon yaşam döngüsünü sunucu tarafında güvenceye al; private geçişi ve silme için adversarial emülatör testleri ekle. Eski profile kayıtların projeksiyon backfill eksikliğini de gider.

## Answer

Firestore kuralları artık `profile` görünürlüklü kaynak kartın güvenli public kopyasıyla aynı atomik işlemde yazılmasını; kart gizlenirken veya silinirken kopyanın aynı işlemde silinmesini zorunlu tutuyor. Public okuma ayrıca kaynak kartın hâlâ var ve `profile` görünürlükte olduğunu doğruladığı için eski bir kopya tek başına dışarıya açılamıyor. Gezi sahibi planı açtığında eksik public kartlar tamamlanıyor ve kaynağı kalmamış kopyalar temizleniyor; kişisel kart sahibi de kendi eksik kopyasını onarabiliyor.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Projection yaşam döngüsü kurallarla zorunlu hale getirildi; gizleme, silme, eksik ve stale kopya senaryolarını içeren 21 emülatör testi geçti.
