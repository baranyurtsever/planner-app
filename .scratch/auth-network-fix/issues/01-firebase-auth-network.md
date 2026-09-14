# 01 — Firebase Auth ağ hatasını gider

Type: bug
Status: resolved

## Kabul kriterleri

- Canlı Chrome oturumundan yapılan şifre sıfırlama isteği `auth/network-request-failed` üretmez.
- Firebase SDK, HTTP referrer kısıtlı API anahtarlarını destekleyen bir sürümdedir.
- Mevcut kimlik doğrulama ve uygulama akışları testlerden geçer.

## Comments

- Hata Chrome'da sahte e-posta ile deterministik olarak yeniden üretildi; CLI üzerinden aynı Firebase uç noktası sağlıklı cevap verdi.
- Chrome 152 güncellemesi uygulanıp aynı hata yeniden üretildi; tarayıcı sürümü kök neden olmaktan çıkarıldı.
- Firebase `12.6.0`, referrer kısıtlı anahtar düzeltmesini içeren sürümden eskiydi; `12.19.0` sürümüne yükseltildi.
- Canlı dağıtım sonrasında aynı Chrome ve aynı sahte e-posta probu Firebase cevabına ulaştı.
- Doğrulama: 104 uygulama testi, 41 Firestore kural testi ve 2 Chromium uçtan uca testi geçti; lint ve üretim derlemesi başarılı.
