# 08 — Eski form verisi güncel katılımı ve kart alanlarını eziyor

Status: needs-triage
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

- [ ] Yalnız değişen içerik alanlarını yaz; katılım dizilerini içerik kaydından ayır. Güncel item aboneliğini modalda koru ve iki istemciyle lost-update testleri yap.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

