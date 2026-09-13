# 04 — Öneri oylaması ve karar kaydı

Type: feature
Status: resolved

## Amaç

Gezi katılımcılarının ortak plan önerileri hakkındaki görüşlerini görünür kılmak ve Gezi Sahibinin verdiği nihai kararları sonradan izlenebilir biçimde korumak.

## Kabul kriterleri

- Her aktif Gezi katılımcısı bekleyen bir öneriye destek veya karşı oyu verebilir ve karar verilene kadar oyunu değiştirebilir.
- Oy dağılımı tüm Gezi katılımcılarına görünür, Profil Ziyaretçilerine görünmez.
- Oylar bağlayıcı değildir; öneriyi yalnız Gezi Sahibi kabul veya reddedebilir.
- Kabul veya red kararı önerinin eylemini, değişikliklerini, önerenini ve karar anındaki oyları kalıcı Karar Kaydına kopyalar.
- Karar Kayıtları Gezi katılımcılarınca görülebilir, değiştirilemez ve silinemez.
- Aynı katılımcının aynı öneride yalnız bir güncel oyu bulunur.

## Comments

- Bekleyen önerilere tüm aktif Gezi katılımcılarının destek veya karşı oyu verebildiği, değiştirilebilir tek-oy modeli eklendi.
- Önerinin içeriği değiştiğinde önceki içeriğe verilmiş oylar sıfırlanıyor.
- Oy dağılımı katılımcılara gösteriliyor; nihai kabul/red yetkisi Gezi Sahibinde kalıyor.
- Kabul ve red sırasında öneri, öneren, değişiklik, sonuç ve oy anlık görüntüsü ayrı ve değiştirilemez Karar Kaydına yazılıyor.
- Son on Karar Kaydı liste ve takvim ekranlarında kişi adlarıyla gösteriliyor.
- Firestore kuralları kullanıcının yalnız kendi oyunu değiştirmesine izin veriyor; Karar Kayıtlarını katılımcı dışına kapatıyor.
- Çevrimdışı uçtan uca doğrulama, plan paketinin gerçekten yazılmasını bekleyecek şekilde yarış koşuluna karşı sağlamlaştırıldı.
- Doğrulama: 104 birim/bileşen testi, 41 Firestore kural testi ve 2 Chromium uçtan uca testi geçti; lint ve üretim derlemesi başarılı.
