# 09 — Yeni kişisel kartın ilk kaydı public delete kuralına takılabilir

Status: needs-triage
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

- [ ] Editor/viewer yeni trip/private kişisel kart oluşturmasını gerçek repository batch ile emülatörde doğrula; gereksiz delete yerine mevcut/prospektif sahiplikle uyumlu senkronizasyon kur.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

