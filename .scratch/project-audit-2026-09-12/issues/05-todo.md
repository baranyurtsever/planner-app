# 05 — Notu olmayan kullanıcı Plan Öğesinden ayrılamıyor

Status: needs-triage
Priority: P1
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

leavePlanItem kişisel detay belgesini varlığını kontrol etmeden silmeye çalışıyor. Delete kuralı resource.data.userId gerektiriyor; belge yoksa kontrol başarısız olup batch tamamını reddeder. Eski ortak kartlarda excludedParticipantIds/status eksikliği de ayrılmayı engeller.

## Kod referansları

- `src/features/itinerary/data/planParticipationRepository.js:97`
- `firestore.rules:482`

## Yapılacaklar ve kabul kriteri

- [ ] Detay belgesi yokken de güvenli ayrılma sağla; eski kayıtları uyumlu işle. Not/harcama olmayan yeni katılımcı ve eski Plan Öğesi senaryolarını emülatörde test et.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

