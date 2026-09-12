# 15 — Katılım isteği tekrar gönderme ve modal güncelliği eksik

Status: resolved
Priority: P2
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

İstek aynı belgeye setDoc ile tekrar yazılıyor fakat kurallar requester update izni vermiyor; pending/rejected durumunda ikinci tıklama permission-denied üretir. Modal item snapshotı canlı güncellenmediğinden kabul/ayrılma sonrası katılım listesi eski kalır.

## Kod referansları

- `src/features/itinerary/data/planParticipationRepository.js:52`
- `src/features/itinerary/components/PlanParticipationSection.jsx:89`
- `src/features/itinerary/pages/PlanPage.jsx:50`

## Yapılacaklar ve kabul kriteri

- [x] Bekleyen isteği göster ve tekrar göndermeyi engelle; reddedilmiş istek için yeniden başvuru politikası belirle; modalı güncel kayıtla besle.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Bekleyen deterministik istekler yeniden yazılmadan beklemede sonucu döndürüyor ve arayüzde gösteriliyor. Reddedilen istek yalnız talep sahibi tarafından aynı belge üzerinden yeniden açılabiliyor. Plan ve takvim modalları canlı item kaydını kullanıyor; repository ve emulator testleri eklendi.
