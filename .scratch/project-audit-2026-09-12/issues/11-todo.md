# 11 — Öneri patch ve karar kuralları yetersiz

Status: resolved
Priority: P2
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Update önerilerinin patch alanları/tipleri doğrulanmıyor; create önerisi güncellemesinde ilk validPlanItem kontrolü tekrarlanmıyor. Kararı approved yapmak kaynak Plan Öğesinin aynı işlemde güncellenmesini gerektirmiyor; mevcut kural testi de tek başına approved yazımını başarı kabul ediyor.

## Kod referansları

- `firestore.rules:386`
- `src/features/itinerary/data/planRepository.js:230`

## Yapılacaklar ve kabul kriteri

- [x] İzinli patch şeması tanımla; onay ve hedef değişiklik tutarlılığını güvenceye al. Geçersiz time/scope/katılım patchleri ve tek başına onay için negatif testler ekle.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Ortak Plan Öğesi önerileri içerik alanlarıyla sınırlandı; bozuk zaman, scope ve katılım patchleri engellendi. Create patch güncellemeleri yeniden doğrulanıyor. Approved kararı artık hedef Plan Öğesinin aynı atomik işlemde patch ile eşleşmesini gerektiriyor; negatif ve pozitif emulator testleri eklendi.
