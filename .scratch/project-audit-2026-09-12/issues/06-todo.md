# 06 — Ayrılma sırasında kişisel veri silinmesi kurallarda garanti değil

Status: resolved
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

- [x] Ayrılma ve bağlı kayıt yaşam döngüsü için güvenilir atomik model kur; eşzamanlı yazma, eksik silme, ayrılık sonrası yeniden yazma testlerini ekle.

## Answer

Ayrılma işlemi artık katılım dizisi değişikliğiyle aynı batch içinde deterministik bir `planDepartures` kaydı oluşturmak zorunda. İstemci bulunan not ve harcamaları fiziksel olarak silmeye devam ediyor; sorguyla yarışıp geride kalan bağlı kayıtlar ise tombstone sonrasında kurallar tarafından okunamaz hale geliyor. Ayrılan kullanıcı aynı karta yeni not/harcama yazamıyor. Böylece rastgele kimlikli alt kayıtları Rules içinde sayma gereksinimi olmadan atomik ve güvenilir bir erişim sınırı sağlandı.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Atomik ayrılık tombstone modeli eklendi; eksik silme ve ayrılık sonrası yazma senaryoları dahil 23 kural testi geçti.
