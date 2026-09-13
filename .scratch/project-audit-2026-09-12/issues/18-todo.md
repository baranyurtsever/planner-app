# 18 — Test kapsamı kritik iş akışlarını doğrulamıyor

Status: resolved
Priority: P2
Type: task
Evidence: `tests/e2e/authenticated-workflow.spec.js`; `tests/firestore/repository-workflow.test.js`; `npm run test:e2e`; `npm run test:rules`.

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
2026-09-13: Playwright ve Firebase Auth/Firestore emülatörleriyle gerçek Chromium E2E katmanı eklendi. Üç ayrı kullanıcı oturumu üzerinden Gezi oluşturma, rol atama, editor önerisi, owner onayı, viewer kişisel Plan Öğesi, piksel koordinatlı drag/resize, katılım isteği, kabul ve ayrılma tek matriste doğrulandı. E2E sırasında özel Plan Öğesi sorgusundaki eksik `scope` kısıtı yakalanıp düzeltildi.
