# 09 — Yeni kişisel kartın ilk kaydı public delete kuralına takılabilir

Status: resolved
Priority: P2
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

syncPublicPlan profile olmayan her kayıtta public belgeyi siler. Yeni kişisel kart oluşturan editor/viewer için public delete kuralı mevcut kaynak belgesindeki sahipliği get/exists ile arar; yeni kaynak batch içinde oluşturulduğundan öncesinde yoktur. Owner yolu bu sorunu gizleyebilir.

## Kod referansları

- `src/features/itinerary/data/planRepository.js:47`
- `src/features/itinerary/data/planRepository.js:174`
- `firestore.rules:370`

## Yapılacaklar ve kabul kriteri

- [x] Editor/viewer yeni trip/private kişisel kart oluşturmasını gerçek repository batch ile emülatörde doğrula; gereksiz delete yerine mevcut/prospektif sahiplikle uyumlu senkronizasyon kur.

## Answer

Yeni profil-dışı kart kayıtları artık var olmayan public projection için gereksiz `delete` yazmıyor. Firestore kuralı da eski istemcilerin aynı batch içinde kaynak oluşturup public belgeyi silme davranışını, işlem sonrası kaynak sahibini doğrulayarak güvenli biçimde kabul ediyor. Viewer tarafından private kişisel kart oluşturulan legacy batch emülatörde doğrulandı.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Gereksiz projection delete kaldırıldı ve prospective sahiplik kuralı eklendi; 27 kural, 42 uygulama testi, lint ve build geçti.
