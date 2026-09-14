# 01 — Herkese açık Gezi erişimini düzelt

Type: bug
Status: resolved

## Kabul kriterleri

- Anonim ziyaretçi, herkese açık Gezi planlarını ve harcamalarını koleksiyon sorgularıyla okuyabilir.
- Gizli planlar genel sorguya dahil edilemez.
- Oturumlu ziyaretçi genel profilden Geziye girdiğinde üst çubukta “Gezilerime dön” bağlantısını görür.
- Firestore hatası kullanıcıya ham “Missing or insufficient permissions” olarak yansımaz.

## Comments

- 2026-09-14: Kök neden, `publicPlanItems` dinleyicisinin görünürlük filtresi olmadan koleksiyonu sorgulamasıydı. Firestore listeleme kuralı tüm olası sonuçların genel olduğunu kanıtlayamadığı için sorguyu reddediyordu.
- 2026-09-14: Genel plan sorgusuna `visibility == profile` filtresi eklendi; genel izdüşüm okuma kuralı kaynak belgenin özel alanlarına bağlı kalmadan, atomik senkronizasyon kurallarıyla korunan izdüşümü doğruluyor.
- 2026-09-14: Tam tarayıcı kontrolünde ortaya çıkan ilişkili çevrimdışı yarış durumu giderildi; Firestore'un boş yerel snapshot'ı dolu plan önbelleğini artık ezmiyor.
- 2026-09-14: Doğrulama: 109 uygulama testi, 41 Firestore kural testi ve 2 uçtan uca tarayıcı senaryosu geçti.
