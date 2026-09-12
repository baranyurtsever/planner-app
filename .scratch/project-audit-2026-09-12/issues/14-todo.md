# 14 — Kayıt formu sonrası hata yetim profil bırakabiliyor

Status: resolved
Priority: P2
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Firestore transaction başarılı olduktan sonra updateProfile başarısız olursa catch Auth kullanıcısını siler fakat username/profile/account belgeleri kalır. Kullanıcı adı tekrar alınamaz. Doğrulama maili hatası ise oluşturulmuş hesabı kayıt başarısızmış gibi sunar.

## Kod referansları

- `src/features/auth/data/authRepository.js:21`

## Yapılacaklar ve kabul kriteri

- [x] Kayıt aşamalarını tekrar denenebilir hale getir; profil güncelleme ve mail hatalarını hesap oluşturma sonucundan ayır. Her aşama için hata enjeksiyon testi ekle.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: Auth hesabı yalnız kalıcı profil transaction'ı başarısızsa geri alınıyor. Profil adı ve doğrulama e-postası bağımsız, yeniden denenebilir tamamlama adımlarına ayrıldı; başarısızlıkları hesabı silmeden warnings olarak döndürülüyor. Her aşamaya hata enjeksiyon testi eklendi.
