# Genel kontrol ve tasarım gelişimi

## Korunan işlevler

Geziler/Kişiler/Profilim ana navigasyonu; Liste/Takvim/Rota/Bütçe/Hazırlık/Gezi Detayları/Ayarlarım bölümleri korunur. Rol ve görünürlük kuralları, öneri onayı, kişisel Plan Öğeleri, katılım, Harcamalar ve Hazırlık Öğeleri aynı arayüzlerden erişilebilir kalır. Tasarım değişikliği veri şemasını değiştirmez.

## Uygulanan tasarım

- Sıcak açık zemin ve koyu petrol yeşili Gezi başlığı.
- Mobilde iki satıra yerleşen ana navigasyon; belirgin aktif bölüm.
- Gezi sekmeleri dar ekranda satırlara bölünür; bütün bölümler görünür kalır.
- Gezi başlığında katılımcı sayısı ve görünürlük bilgisi.
- Gezi listesinde katılımcı sayısı ve açık yönlendirme.
- Klavye odağı ve azaltılmış hareket tercihine destek.

## Kontrol bulguları

- **Düzeltildi:** Rota ekranı boş koordinatları `Number(null) === 0` nedeniyle gerçek konum sayıyordu. Boş ve sınır dışı değerler dışlanır; geçerli sıfır koordinatları korunur.
- **Açık doğrulama ihtiyacı:** Mevcut Chromium iş akışı testinde drag/resize için `setPointerCapture` devre dışı bırakılıyor ve sentetik olaylar kullanılıyor. Bu test native fare/touch davranışını kanıtlamaz. Önceki tamamlanma beyanı bu kapsam için fazla geniştir. Native fare, touch, resize kalıcılığı ve gerçek piksel hizası ayrıca doğrulanmalı.
- **Kullanılabilirlik:** Katılımcı ekleme Firebase UID gerektiriyor. Kullanıcı adıyla arama/davet öncelikli iyileştirmedir.
- **Eksik ürün akışı:** Profilim mevcut profili gösteriyor; görünen ad, biyografi ve görsel düzenleme akışı yok.
- **Bakım:** CalendarCard ayrılmış olsa da CalendarPage hâlâ etkileşim, öneri gruplama ve abonelik sorumluluklarını birlikte taşıyor.
- **Popover:** Tam içerik eklendi ancak ekran kenarlarında kırpılma ve Escape ile kapatma ayrıca incelenmeli.

## Önerilen yeni özellikler

1. **Kullanıcı adıyla davet:** UID yerine profil arama; süreli, iptal edilebilir davet. Katılım ancak kabul sonrası gerçekleşmeli.
2. **Bekleyen işlemler merkezi:** Plan Değişiklik Önerileri ve Plan Katılım İstekleri için tek görünüm ve sayaç. Mevcut yetkiler korunmalı.
3. **Gezi özeti:** Bugünkü Plan Öğeleri, sıradaki durak, kendi Harcama özeti ve Hazırlık ilerlemesi. Özel bilgiler yalnız sahibine gösterilmeli.
4. **Profil düzenleme:** Görünen ad, biyografi ve görsel; Kullanıcı Adı değişimi ayrıca benzersizlik ve bağlantı politikasına ihtiyaç duyar.
5. **Takvim filtreleri:** Bana ait, katıldıklarım, ortak, kategori ve durum filtreleri; görünürlük izinleri filtrelerden bağımsız kalmalı.
6. **Takvim dışa aktarma:** ICS; yalnız yetkili görünür içerik, kişisel notlar ve katılımcı kimlikleri için açık paylaşım seçimi.
7. **Değişiklik geçmişi:** Kim, neyi, ne zaman değiştirdi; geri alma güncel yetkilendirmeye tabi olmalı.

Yeni özellikler bu tasarım değişikliğine dahil edilmedi; öneri sırası mevcut kod ve kullanım akışlarından çıkarılmıştır.

## Doğrulama kapsamı

68 mevcut unit/component testi, lint ve build geçti. Chromium kayıt ve üç rollü iş akışı testleri geçti. 390 px ve 1440 px ekran görüntüleri incelendi; mobil yatay taşma kontrolü eklendi. Rota koordinatları ayrıca domain testiyle doğrulandı. Tüm ekranlar ve gerçek üretim verileri için kapsamlı görsel/manuel kabul yapılmış sayılmaz.
