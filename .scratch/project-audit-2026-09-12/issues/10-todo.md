# 10 — Öneri tekrarları ve önizleme eksikleri

Status: resolved
Priority: P2
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Sabit öneri karara bağlandıktan sonra her yeni hareket rastgele yeni belge açar; yeni pending belge tekrar bulunmaz. Panel mevcut/önerilen değerleri göstermiyor. Tarih-only öneriler hayalet olarak çizilmiyor, hayaletlerde öneren görünmüyor ve aynı Plan Öğesine ait öneriler gruplanmıyor.

## Kod referansları

- `src/features/itinerary/data/planRepository.js:67`
- `src/features/itinerary/components/ProposalPanel.jsx:51`
- `src/features/itinerary/pages/CalendarPage.jsx:183`

## Yapılacaklar ve kabul kriteri

- [x] Aktif öneriyi target/proposer üzerinden tekilleştir; alan bazlı mevcut/önerilen değer karşılaştırması ekle; tüm-gün ve gruplanmış hayalet gösterimini tamamla.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Öneriler target/proposer anahtarıyla tekilleştirildi; karara bağlanan yuva güvenli biçimde yeniden kullanılabilir yapıldı. Panel alan bazlı mevcut/önerilen karşılaştırması ve Plan Öğesi gruplaması kazandı; zamanlı ve tüm-gün önerilerinde öneren kullanıcıyla hayalet önizleme eklendi. React ve Firestore emulator testleriyle doğrulandı.
2026-09-12: Code review sonrası aynı Plan Öğesine ve güne ait zaman önerileri tek hayalet yuvada toplandı; hayalet içindeki kullanıcı seçicisiyle öneri varyantları arasında geçiş eklendi.
