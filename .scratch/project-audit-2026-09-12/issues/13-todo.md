# 13 — Takvim yerel gün ve çok günlük etkinlikleri yanlış gösteriyor

Status: resolved
Priority: P2
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Bugün UTC toISOString ile hesaplanıyor; Türkiye'de 00–03 arası önceki gün olabilir. Çok günlük kayıt yalnız başlangıç gününde yer alır. Farklı saat dilimlerinin duvar saatleri çıkarılarak yükseklik hesaplanır. Geçersiz date sorgu parametresi render hatasına yol açabilir.

## Kod referansları

- `src/features/itinerary/pages/CalendarPage.jsx:29`
- `src/features/itinerary/pages/CalendarPage.jsx:56`
- `src/features/itinerary/pages/CalendarPage.jsx:149`

## Yapılacaklar ve kabul kriteri

- [x] Yerel bugün yardımcı fonksiyonu, doğrulanmış URL tarihi ve günlere bölünmüş zaman aralığı modeli kur; saat dilimli uçuş ve gece yarısı testleri ekle.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Yerel bugün ve güvenli URL tarihi yardımcıları eklendi. Zamanlı Plan Öğeleri başlangıç saat diliminde gün segmentlerine ayrılıyor; gece yarısı ve farklı varış saat dilimli uçuş senaryoları domain testleriyle doğrulandı.
