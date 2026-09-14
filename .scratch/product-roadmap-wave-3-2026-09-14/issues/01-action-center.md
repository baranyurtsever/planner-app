# 01 — Merkezi İşlem Merkezi

Type: feature
Status: resolved

## Kabul kriterleri

- Ana navigasyonda İşlem Merkezi bağlantısı ve bekleyen işlem sayısı görünür.
- Gezi davetleri, arkadaşlık istekleri, kişisel plan katılım istekleri ve ortak plan önerileri geziler arasında birleşir.
- Davet, arkadaşlık ve katılım istekleri merkezi ekrandan karara bağlanabilir.
- Öneriler mevcut oy ve Gezi Sahibi karar yetkilerini korur.
- Yaklaşan yedi günlük planlar rozet sayısına katılmadan ayrı gösterilir.
- Profil Ziyaretçileri ve oturum açmamış kullanıcılar ekrana erişemez.

## Comments

- 2026-09-14: İşlem Merkezi, geziler arası bekleyen davetleri, arkadaşlık isteklerini, kişisel plan katılım isteklerini ve plan önerilerini mevcut yetkileriyle bir araya getirir.
- 2026-09-14: Yaklaşan yedi günlük planlar bilgi amaçlı gösterilir ve navigasyon rozetine dahil edilmez.
- 2026-09-14: Doğrulama: 108 birim/bileşen testi, 41 Firestore kural testi ve 2 tarayıcı E2E senaryosu geçti. E2E çevrimdışı son görünürlük kontrolü ilk turda zamanlama nedeniyle bir kez düştü; değişiklik yapılmadan tekrarlandığında 2/2 geçti.
