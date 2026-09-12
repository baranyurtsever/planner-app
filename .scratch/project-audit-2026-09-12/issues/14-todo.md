# 14 — Kayıt formu sonrası hata yetim profil bırakabiliyor

Status: needs-triage
Priority: P2
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Firestore transaction başarılı olduktan sonra updateProfile başarısız olursa catch Auth kullanıcısını siler fakat username/profile/account belgeleri kalır. Kullanıcı adı tekrar alınamaz. Doğrulama maili hatası ise oluşturulmuş hesabı kayıt başarısızmış gibi sunar.

## Kod referansları

- `src/features/auth/data/authRepository.js:21`

## Yapılacaklar ve kabul kriteri

- [ ] Kayıt aşamalarını tekrar denenebilir hale getir; profil güncelleme ve mail hatalarını hesap oluşturma sonucundan ayır. Her aşama için hata enjeksiyon testi ekle.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

