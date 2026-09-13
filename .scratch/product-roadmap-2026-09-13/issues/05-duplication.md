# 05 — Gezi ve Plan Öğesi çoğaltma

Type: task
Status: resolved

## Amaç

Tekrarlanan programları yeni tarihlere güvenli biçimde kopyalamak.

## Kabul kriterleri

- Kopya yeni kimlikler üretir.
- Katılım, kişisel harcama, öneri ve özel notlar otomatik kopyalanmaz.
- Saat dilimi ve tarihler kullanıcıya açıkça gösterilir.

## Comments

- Düzenlenebilir bir Plan Öğesi, ayrıntı ekranındaki `Çoğalt` eylemiyle yeni kimlikli bir taslağa dönüşür; kullanıcı kaydetmeden önce tarih, saat ve saat dilimlerini görüp değiştirebilir.
- Plan Öğesi kopyasında not, katılımcı, ayrılan/engellenen kişi durumları sıfırlanır; Harcama ve Plan Belgeleri alt kayıt oldukları için taşınmaz.
- Yalnız Gezi Sahibi Geziyi çoğaltabilir. Yeni ad ve başlangıç tarihi zorunludur; kaynak saat dilimi işlem ekranında gösterilir.
- Gezi kopyası gizli ve yalnız yeni sahibiyle başlar. Yalnız Ortak Plan Öğeleri yeni kimliklerle taşınır; tarihler ilk ortak plan tarihinden yeni başlangıç tarihine kaydırılır.
- Katılımcılar, Kişisel Plan Öğeleri, harcamalar, Plan Belgeleri, rezervasyonlar ve öneriler yeni Geziye kopyalanmaz.
- Doğrulama: domain/component testleri, Firestore Emulator repository akışı, gerçek tarayıcıda Plan Öğesi ve Gezi çoğaltma, production build.
