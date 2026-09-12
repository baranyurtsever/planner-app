# 11 — Öneri patch ve karar kuralları yetersiz

Status: needs-triage
Priority: P2
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Update önerilerinin patch alanları/tipleri doğrulanmıyor; create önerisi güncellemesinde ilk validPlanItem kontrolü tekrarlanmıyor. Kararı approved yapmak kaynak kartın aynı işlemde güncellenmesini gerektirmiyor; mevcut kural testi de tek başına approved yazımını başarı kabul ediyor.

## Kod referansları

- `firestore.rules:386`
- `src/features/itinerary/data/planRepository.js:230`

## Yapılacaklar ve kabul kriteri

- [ ] İzinli patch şeması tanımla; onay ve hedef değişiklik tutarlılığını güvenceye al. Geçersiz time/scope/katılım patchleri ve tek başına onay için negatif testler ekle.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

