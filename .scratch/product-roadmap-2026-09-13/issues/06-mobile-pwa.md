# 06 — Mobil PWA kabuğu ve çevrimdışı temel erişim

Type: task
Status: resolved

## Amaç

Mevcut responsive web uygulamasını telefona kurulabilir hâle getirmek ve son açılan Geziyi bağlantı yokken salt okunur göstermek.

## Kabul kriterleri

- Web app manifest, ikonlar ve güvenli service worker bulunur.
- Uygulama iOS ve Android ana ekranına kurulabilir.
- Çevrimdışı durumda son eşitlenen program ve adresler okunabilir; yazma denemesi açıkça engellenir.
- Cache, oturum veya kişisel veriyi başka kullanıcıya sızdırmaz.

## Comments

- Web app manifest, 192/512 piksel ikonlar ve yalnızca aynı origin'deki uygulama kabuğunu saklayan service worker eklendi.
- Android kurulum istemi uygulama içinde sunuluyor; iOS ana ekran kurulumu için gerekli manifest ve Apple meta etiketleri tanımlandı.
- Son eşitlenen Gezi ve Plan Öğeleri kullanıcı/gezi bazlı, kişisel alanları ayıklanmış yerel cache'e yazılıyor. Cache çıkışta temizleniyor.
- İlk açılış çevrimdışıyken son eşitlenen program ve adresler salt okunur gösteriliyor; repository yazmaları anlaşılır bir çevrimdışı hatasıyla engelleniyor.
- Doğrulama: 86 unit/component testi, 39 Firestore Rules testi, 2 Chromium E2E senaryosu, lint ve production build geçti.
