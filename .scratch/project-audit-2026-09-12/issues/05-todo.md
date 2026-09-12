# 05 — Notu olmayan kullanıcı Plan Öğesinden ayrılamıyor

Status: resolved
Priority: P1
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

leavePlanItem kişisel detay belgesini varlığını kontrol etmeden silmeye çalışıyor. Delete kuralı resource.data.userId gerektiriyor; belge yoksa kontrol başarısız olup batch tamamını reddeder. Eski ortak kartlarda excludedParticipantIds/status eksikliği de ayrılmayı engeller.

## Kod referansları

- `src/features/itinerary/data/planParticipationRepository.js:97`
- `firestore.rules:482`

## Yapılacaklar ve kabul kriteri

- [x] Detay belgesi yokken de güvenli ayrılma sağla; eski kayıtları uyumlu işle. Not/harcama olmayan yeni katılımcı ve eski Plan Öğesi senaryolarını emülatörde test et.

## Answer

Ayrılma akışı kişisel detay belgesini önce okuyor ve yalnız gerçekten varsa silme işlemini batch'e ekliyor. Firestore güncelleme kuralları, normal kart düzenlemelerinde tam doğrulamayı korurken katılımcının alan-kısıtlı ayrılma işlemini eski kartlarda eksik `status`, `excludedParticipantIds` veya `blockedParticipantIds` alanları olsa da kabul ediyor. Repository testi olmayan detay belgesinin silinmediğini, emülatör testi eski ortak karttan ayrılmanın başarılı olduğunu doğruluyor.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Ayrılma batch'i ve legacy kural uyumluluğu düzeltildi. 22 kural ve 41 uygulama testi, lint ve build geçti.
