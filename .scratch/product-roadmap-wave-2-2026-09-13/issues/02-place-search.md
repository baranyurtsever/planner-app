# 02 — Yer arama ve zengin yer kartları

Type: feature
Status: resolved

## Amaç

Plan Öğesine mekân veya adres arayarak doğrulanmış koordinat ve kullanılabilir yer bilgileri eklemeyi hızlandırmak.

## Kabul kriterleri

- Arama yalnız kullanıcının açık eylemiyle çalışır; yazdıkça otomatik istek göndermez.
- Seçilen sonuç ad, açık adres, koordinat, harita bağlantısı ve mevcutsa web sitesi, telefon ve çalışma saatlerini forma taşır.
- Kullanıcı aramayı kullanmadan alanları manuel düzenlemeye devam edebilir.
- Liste, Takvim ayrıntısı, Bugün ve Rota yüzeyleri uygun zengin yer bilgisini gösterir.
- Yer alanları ortak Plan Öğesi önerilerine, public projeksiyona ve çevrimdışı pakete güvenli biçimde katılır.
- Sağlayıcı istekleri tekrar sorgular için önbelleklenir, saniyede bir istekle sınırlandırılır ve OSM atfı görünürdür.
- Sağlayıcı taban URL'si kod değişikliği gerektirmeden ortam yapılandırmasıyla değiştirilebilir.

## Sağlayıcı kararı

İlk sürüm, doğrudan kullanıcı tarafından tetiklenen düşük hacimli aramalar için Nominatim Search API kullanır. Otomatik tamamlama yapılmaz. Üretim ölçeği politika sınırını aşarsa `VITE_GEOCODING_BASE_URL` üzerinden proxy veya sözleşmeli sağlayıcıya geçilir.

Kaynaklar: [Nominatim Search API](https://nominatim.org/release-docs/latest/api/Search/), [Nominatim kullanım politikası](https://operations.osmfoundation.org/policies/nominatim/).

## Comments

- Açık eylemle çalışan, en az üç karakter isteyen ve en fazla beş sonuç döndüren yer arama alanı eklendi; yazdıkça otomatik sorgu yapılmıyor.
- Aynı sorgular 30 gün önbellekleniyor ve sekmeler arası paylaşılan zaman damgasıyla istekler saniyede birle sınırlandırılıyor.
- Sonuç seçimi ad, adres, koordinat, OSM bağlantısı, kategori ve varsa web sitesi, telefon ile çalışma saatlerini dolduruyor; tüm alanlar manuel düzenlenebiliyor.
- Liste, Takvim ayrıntısı, Bugün, Rota ve public Gezi görünümleri uygun yer ayrıntılarını gösteriyor; dış bağlantılar render sırasında yeniden güvenli protokol kontrolünden geçiyor.
- Zengin konum çevrimdışı pakette korunuyor; repository normalizasyonu ortak öneri ve public projeksiyona katıyor.
- Canlı Nominatim sorgusu Galata Kulesi için doğrulandı.
- Doğrulama: 99 unit/component testi, 39 Firestore Rules testi, 2 Chromium E2E senaryosu, lint ve production build geçti.
