# 08 — Eski form verisi güncel katılımı ve kart alanlarını eziyor

Status: resolved
Priority: P1
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

changePlanItem yalnız time değişse de tüm normalize kartı yazar. Açık editör eski item snapshotını ve katılım dizilerini tutar. Başka kullanıcı ayrıldıktan sonra eski form kaydı onu tekrar ekleyebilir; eşzamanlı başlık/not değişiklikleri de kaybolur.

## Kod referansları

- `src/features/itinerary/data/planRepository.js:182`
- `src/features/itinerary/components/PlanItemEditor.jsx:83`
- `src/features/itinerary/pages/PlanPage.jsx:50`

## Yapılacaklar ve kabul kriteri

- [x] Yalnız değişen içerik alanlarını yaz; katılım dizilerini içerik kaydından ayır. Güncel item aboneliğini modalda koru ve iki istemciyle lost-update testleri yap.

## Answer

Editör kaydı artık yalnız form açıldıktan sonra kullanıcı tarafından değiştirilen içerik alanlarını patch olarak çıkarıyor. Güncel belge transaction içinde yeniden okunup patch onun üzerine uygulanıyor; katılımcı, ayrılan ve engellenen kullanıcı dizileri form kaydının parçası değil. Takvim ve liste modalı, katılım bölümüne abonelikten gelen güncel kartı ayrıca iletiyor. Böylece başka istemcinin katılım veya farklı alan değişiklikleri eski form tarafından geri alınmıyor.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Alan bazlı transaction güncellemesi ve canlı modal katılım verisi eklendi; stale katılım patch regresyon testiyle 42 uygulama testi geçti.
