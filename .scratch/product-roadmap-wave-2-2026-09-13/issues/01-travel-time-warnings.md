# 01 — Ulaşım süresi ve çakışma uyarıları

Type: feature
Status: resolved

## Amaç

Bir Plan Öğesine önceki duraktan ulaşım şeklini ve tahmini süreyi ekleyerek kullanıcının sıradaki plana zamanında yetişip yetişemeyeceğini görünür kılmak.

## Kabul kriterleri

- Plan Öğesi düzenleyicisinde ulaşım şekli ve dakika cinsinden tahmini süre seçilebilir.
- Alanlar kişisel ve ortak Plan Öğelerinde mevcut yetki/öneri modeliyle kaydedilir.
- Takvim, önceki kartın bitişi ile sıradaki kartın başlangıcı arasındaki boşluk yetersizse eksik süreyi gösterir.
- Kart ayrıntısı ve Bugün görünümü ulaşım şeklini ve süreyi gösterir; rota görünümü duraklar arasındaki geçişi listeler.
- Veri public projeksiyona güvenli biçimde taşınır ve çevrimdışı programda korunur.
- Eski Plan Öğeleri yeni alan olmadan çalışmaya devam eder.

## Comments

- Plan Öğesi formuna yürüyüş, toplu taşıma, araç/taksi, bisiklet, uçuş ve diğer seçenekleriyle önceki plandan ulaşım süresi eklendi.
- Takvim ardışık zamanlı kartları gerçek UTC zaman çizgisinde karşılaştırıyor; eksik dakikayı özet ve kart ayrıntısında gösteriyor.
- Bugün ve Rota görünümleri sıradaki geçişin ulaşım türünü ve tahmini süresini gösteriyor.
- Alan ortak kartlarda düzenleyici önerisine dahil, public projeksiyonda kaynakla atomik eşit ve çevrimdışı cache içinde korunuyor.
- Eski belgelerde alanın bulunmaması güvenlik kurallarında geriye uyumlu kabul ediliyor; ilk sonraki yazımda normalize ediliyor.
- Doğrulama: 92 unit/component testi, 39 Firestore Rules testi, 2 Chromium E2E senaryosu, lint ve production build geçti.
