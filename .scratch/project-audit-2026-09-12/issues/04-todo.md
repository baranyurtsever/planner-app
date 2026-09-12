# 04 — Sürükleme başlarken pointer capture sahibi kart kaldırılıyor

Status: resolved
Priority: P1
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

pointerdown kart üzerinde capture alıyor; interaction state sonrası aynı kart filtrelenip farklı key taşıyan preview kartıyla değişiyor. Capture sahibi DOM düğümü yok oluyor. Hareketin sürmesi, bırakılması ve tıklama davranışı gerçek tarayıcıda doğrulanmamış.

## Kod referansları

- `src/features/itinerary/pages/CalendarPage.jsx:224`
- `src/features/itinerary/pages/CalendarPage.jsx:401`

## Yapılacaklar ve kabul kriteri

- [x] Capture işlemini kalıcı board düğümüne taşı veya orijinal kartı koru; drag eşiği, click suppression, pointercancel ve board dışına bırakma için gerçek pointer testleri ekle.

## Answer

Pointer capture sahibi olan orijinal kart sürükleme boyunca aynı React anahtarı ve DOM düğümüyle korunup görünmez hale getiriliyor; hareketli önizleme ayrı çiziliyor. 6 px sürükleme eşiği eklendi, tamamlanan sürüklemenin ardından oluşan click bastırılıyor ve `pointercancel` yazma yapmadan etkileşimi temizliyor. Pointer testleri capture düğümünün korunduğunu, board dışındaki koordinatta bırakmanın kaydedildiğini, click suppression ve cancel davranışını doğruluyor.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Pointer yaşam döngüsü düzeltildi; 2 etkileşim testi eklendi. 40 uygulama testi, lint ve build geçti.
