# 07 — Kişisel katılım kuralları yetki sınırlarını korumuyor

Status: resolved
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

- [x] Yalnız aktif Gezi katılımcılarını kabul et; private kartta yalnız sahibi kalsın; ayrılanı yalnız Gezi Sahibi geri alabilsin. Normal ekleme ve yeniden dahil etme yetkilerini ayrı test et.

## Answer

Kişisel kartların `participantIds` ve `blockedParticipantIds` alanları aktif Gezi üyeleriyle sınırlandı; iki liste birbiriyle çakışamıyor. Private kartlarda yalnız kart sahibi kalabiliyor. Kart sahibi normal bir Gezi katılımcısını ekleyebiliyor ancak ayrılmış/engellenmiş kişiyi geri alamıyor. Yeniden dahil etme, yalnız Gezi Sahibinin ayrılık tombstone'unu katılım güncellemesiyle aynı batch içinde silmesiyle gerçekleşiyor.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Kişisel katılım sınırları ve atomik yeniden dahil etme eklendi; normal ekleme, dış kullanıcı, private kart ve rejoin senaryolarıyla 26 kural testi geçti.
