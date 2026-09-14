# 01 — İsteğe bağlı ulaşım süresini düzelt

Type: bug
Status: resolved

## Kabul kriterleri

- Ulaşım şekli seçildiğinde tahmini süre boş bırakılabilir.
- Süre girildiğinde 45 dahil her pozitif tam dakika kabul edilir.
- Boş süre, ulaşım uyarısı hesaplamayan sıfır dakika olarak kaydedilir.
- Alanın ne amaçla kullanıldığı form üzerinde açıklanır.

## Comments

- `min=1` ve `step=5` birleşimi geçerli değerleri 1, 6, 11… olarak oluşturduğu için 45 reddediliyordu; adım bir dakikaya indirildi.
- Koşullu `required` kaldırıldı ve boş başlangıç değeri kullanıldı.
- Regresyon testi 45 dakikayı ve seçili ulaşım şekliyle boş süre kaydını kapsıyor.
- Doğrulama: 105 uygulama testi ve 2 Chromium uçtan uca testi geçti; lint ve üretim derlemesi başarılı.
