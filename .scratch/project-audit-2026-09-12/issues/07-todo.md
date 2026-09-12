# 07 — Kişisel katılım kuralları yetki sınırlarını korumuyor

Status: needs-triage
Priority: P1
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Kişisel kart sahibi participantIds/blockedParticipantIds alanlarını sınırsız değiştirebilir: ayrılanı yeniden dahil edebilir, Gezi dışı UID ekleyebilir, private karta başkalarını ekleyebilir. Bunlar kabul edilen katılım kurallarına aykırı.

## Kod referansları

- `firestore.rules:243`
- `firestore.rules:296`
- `src/features/itinerary/data/planParticipationRepository.js:88`

## Yapılacaklar ve kabul kriteri

- [ ] Yalnız aktif Gezi katılımcılarını kabul et; private kartta yalnız sahibi kalsın; ayrılanı yalnız Gezi Sahibi geri alabilsin. Normal ekleme ve yeniden dahil etme yetkilerini ayrı test et.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

