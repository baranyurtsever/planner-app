# 06 — Ayrılma sırasında kişisel veri silinmesi kurallarda garanti değil

Status: needs-triage
Priority: P1
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

UI bir batch kullanıyor ama kurallar yalnız katılım dizisini değiştirerek ayrılmaya izin veriyor. Harcama sorgusu batch öncesi yapıldığından eşzamanlı ekleme geride kalabilir. Harcamalarda planItemId üyelik kontrolü yok; ayrıldıktan sonra yeniden kayıt eklenebilir.

## Kod referansları

- `src/features/itinerary/data/planParticipationRepository.js:97`
- `firestore.rules:256`
- `firestore.rules:485`

## Yapılacaklar ve kabul kriteri

- [ ] Ayrılma ve bağlı kayıt yaşam döngüsü için güvenilir atomik model kur; eşzamanlı yazma, eksik silme, ayrılık sonrası yeniden yazma testlerini ekle.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

