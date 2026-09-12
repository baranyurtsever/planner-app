# 01 — Public Gezi belgesi katılımcı kimliklerini açığa çıkarıyor

Status: resolved
Priority: P1
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Public Gezi okuması tüm belgeyi döndürüyor; memberIds/memberRoles dışarıya açık. Profil belgeleri de herkese okunabilir olduğu için kimlikler adlarla eşleştirilebilir. publicPlanItems projeksiyonu bu üst-belge sızıntısını kapatmıyor.

## Kod referansları

- `firestore.rules:188`
- `src/features/profile/data/profileRepository.js:27`

## Yapılacaklar ve kabul kriteri

- [x] Public Gezi için katılımcı kimlikleri içermeyen projeksiyon oluştur; anonim istemcinin asıl üyelik belgesini okuyamadığını emülatörde doğrula.

## Answer

Anonim erişim ana `trips/{tripId}` belgesinden kaldırıldı. Public gezi sayfası `publicTrips/{tripId}`, profil listesi ise `profiles/{userId}/publicTrips/{tripId}` altındaki kimliksiz projeksiyonlardan besleniyor. Gezi oluşturma ve güncelleme işlemleri bu kayıtları atomik batch ile yazıyor; mevcut public geziler, sahip kendi gezi listesini açtığında bir defalık geriye dönük olarak oluşturuluyor. Firestore emülatöründe ana belgenin anonim okumaya kapalı, iki güvenli projeksiyonun okunabilir ve `memberIds`/`memberRoles` içermediği doğrulandı.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Güvenli public Gezi projeksiyonları eklendi; 18 Firestore kural testi, 35 uygulama testi, lint ve production build geçti.
