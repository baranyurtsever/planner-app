# 18 — Test kapsamı kritik iş akışlarını doğrulamıyor

Status: resolved
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

- [x] Owner/editor/viewer oturumlarıyla oluştur-drag-resize-öneri-onay-katıl-ayrıl E2E matrisi kur; repository işlemlerini emülatöre bağla; public anonim erişim testlerini ekle.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Gerçek repository fonksiyonlarını authenticated owner/editor/viewer Firestore emulator istemcilerine bağlayan öneri-onay-katıl-ayrıl entegrasyon matrisi eklendi. Matris, olmayan kişisel detay belgesini okurken ayrılmayı engelleyen kural hatasını yakaladı ve düzeltti. Takvim component entegrasyonunda oluşturma, drag, resize, retry ve touch testleri; mevcut kural takımında anonim public erişim testleri birlikte kabul matrisini karşılıyor.
