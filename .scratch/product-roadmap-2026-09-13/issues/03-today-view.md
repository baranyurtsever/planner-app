# 03 — Bugün ve sıradaki görünümü

Type: task
Status: resolved

## Amaç

Kullanıcının bulunduğu anda sıradaki Plan Öğesini, adresi ve gerekli hazırlıkları tek mobil yüzeyde göstermek.

## Kabul kriterleri

- Gezi Varsayılan Saat Dilimi ve kartın kendi saat dilimi doğru uygulanır.
- Kullanıcının katılmadığı veya görme yetkisi olmayan kayıt gösterilmez.
- Canlı uçuş sağlayıcısı olmadan çalışır.

## Comments

- Gezi navigasyonuna mobil öncelikli `Bugün` sekmesi eklendi ve Gezi kök rotası bu özete yönlendirildi.
- `Sıradaki`, mutlak UTC anına göre devam eden veya yaklaşan ilk zamanlı Plan Öğesini gösterir; saat gösterimi kartın kendi saat dilimini kullanır.
- `Bugünün akışı`, tarih içeren kartlarda Gezi Varsayılan Saat Dilimini; zamanlı kartlarda kartın başlangıç saat dilimini kullanır.
- Kullanıcının ayrıldığı Ortak Plan Öğeleri ile katılımcısı olmadığı Kişisel Plan Öğeleri özetten çıkarılır.
- Konum/harita bağlantısı ve kullanıcıya ait tamamlanmamış ilk beş Hazırlık Öğesi aynı yüzeyde gösterilir.
- Doğrulama: domain ve component testleri, tüm Vitest paketi, gerçek tarayıcı E2E ve production build.
