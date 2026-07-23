# Etkileşimli Takvim ve Plan Önerileri

Durum: onaylandı, uygulandı

## Amaç

Peregrin Takvimini, Plan Öğelerini haftalık bir zaman çizelgesinde oluşturma, inceleme ve yetkiye uygun biçimde değiştirme yüzeyi hâline getirmek.

Takvim; Ortak Plan Öğeleri, Kişisel Plan Öğeleri, Plan Katılımı ve Plan Değişiklik Önerilerini aynı resmî planı karıştırmadan göstermelidir.

## Kapsam dışı

- Gezi adı, üyelik rolleri veya arşiv durumuna değişiklik önerme
- Profil Ziyaretçilerinin katılım isteği göndermesi
- Katılımcıların önerilere oy vermesi
- Gerçek zamanlı sohbet veya yorum dizileri
- Gezi Sahibinin başkasına ait Kişisel Plan Öğesini düzenlemesi

## Plan Öğesi türleri

### Ortak Plan Öğesi

- Geziye aittir.
- Gezi Sahibi doğrudan oluşturabilir, düzenleyebilir, taşıyabilir, yeniden boyutlandırabilir ve silebilir.
- Düzenleyici aynı işlemleri doğrudan uygulamaz; Plan Değişiklik Önerisi oluşturur.
- Viewer ortak değişiklik öneremez.
- Varsayılan katılım, Gezi katılımcılarının tamamıdır.
- Geziye sonradan eklenen katılımcı da varsayılan olarak katılmış sayılır.

### Kişisel Plan Öğesi

- Öğeyi oluşturan Gezi katılımcısına aittir.
- Yalnız sahibi içeriğini doğrudan oluşturabilir, düzenleyebilir, taşıyabilir, yeniden boyutlandırabilir ve silebilir.
- Gezi Sahibi dahil diğer kullanıcılar içeriğini değiştiremez.
- Sahibi dışındaki bir katılımcının öğeye katılması sahipliği veya düzenleme yetkisini değiştirmez.
- Owner, editor ve viewer kendi Kişisel Plan Öğelerini yönetebilir.

### Geçiş uyumluluğu

- Tür alanı bulunmayan mevcut Plan Öğeleri Ortak Plan Öğesi kabul edilir.
- Mevcut kayıtlar topluca silinmez.
- Bir kayıt ilk kez yazıldığında türü açıkça saklanır.

## Görünürlük

Kişisel Plan Öğesi aşağıdaki görünürlüklerden birini taşır:

- `private`: Yalnız sahibi görür. Başka katılımcı eklenemez ve katılım isteği gönderilemez.
- `trip`: Gezi katılımcıları görür. Uygun katılımcılar katılım isteği gönderebilir.
- `profile`: Gezi herkese açıksa Profil Ziyaretçileri kartın herkese açık içeriğini görür.

Profil Ziyaretçilerine katılımcı adları, katılım durumları, öneriler veya kişisel katılımcı bilgileri gösterilmez.

Ortak Plan Öğesi `trip` veya `profile` görünürlüğü taşır. Gizli Gezi, altındaki `profile` öğeleri de dışarıya kapatır.

## Plan Katılımı

### Ortak Plan Öğesine katılım

- Başlangıç durumu tüm aktif Gezi katılımcılarının katılmasıdır.
- Katılımcı kendisini öğeden doğrudan çıkarabilir.
- Ayrılan katılımcı kendisini yeniden ekleyemez veya katılım isteği gönderemez.
- Ayrılan katılımcıyı yalnız Gezi Sahibi yeniden dahil edebilir.
- Ayrılma işlemi ortak öğenin içeriğini değiştirmez.

### Kişisel Plan Öğesine katılım

- Başlangıçta yalnız öğenin sahibi katılmıştır.
- Öğe sahibi başka bir Gezi katılımcısını doğrudan ekleyebilir.
- `trip` veya `profile` görünürlüğündeki öğe için yalnız aynı Gezinin katılımcıları Plan Katılım İsteği gönderebilir.
- Profil Ziyaretçisi ve Geziye katılmayan oturum sahibi istek gönderemez.
- İlk katılım isteğini Kişisel Plan Öğesinin sahibi kabul veya reddeder.
- Katılımcı öğeden ayrıldıktan sonra yeniden istek gönderemez.
- Ayrılmış katılımcıyı yalnız Gezi Sahibi yeniden dahil edebilir.
- Gezi Sahibinin yeniden dahil etme yetkisi kart içeriğini düzenleme yetkisi vermez.

### Ayrılmanın veri etkisi

Bir katılımcı Ortak veya Kişisel Plan Öğesinden ayrıldığında yalnız o kullanıcıya ve o Plan Öğesine bağlı aşağıdaki kayıtlar kalıcı olarak silinir:

- Harcamalar
- Kişisel notlar
- Kişisel bağlantılar ve ekler
- Katılımcıya özel diğer Plan ayrıntıları

Gezi genelindeki veya başka Plan Öğelerine bağlı kişisel kayıtlar silinmez.

Ayrılma öncesinde kullanıcıya aşağıdaki etkileri açıkça belirten onay penceresi gösterilir:

> Bu Plan Öğesinden ayrılırsan bu öğeye bağlı kişisel harcamaların, notların ve bağlantıların kalıcı olarak silinecek. Kendin yeniden katılamazsın; yalnız Gezi Sahibi seni tekrar dahil edebilir.

İşlem, onay verilmeden uygulanmaz. Silme ve katılım değişikliği tek atomik işlem olarak tamamlanır.

## Karta bağlı kişisel bilgiler

Bir Plan Öğesine katılan kullanıcı:

- Kendi Harcamalarını öğeye bağlayabilir.
- Kendi kişisel notlarını ekleyebilir.
- Kendi bağlantılarını ve eklerini saklayabilir.
- Yalnız kendisine ait kayıtları değiştirebilir.

Karta katılmak, başka katılımcıların kişisel kayıtlarını görme veya düzenleme yetkisi vermez. Harcamaların mevcut `private`, `trip` ve `profile` görünürlük kuralları korunur.

## Plan Değişiklik Önerisi

### Kim öneri oluşturabilir?

- Düzenleyici, Ortak Plan Öğesi için öneri oluşturabilir.
- Viewer öneri oluşturamaz.
- Gezi Sahibi öneriye ihtiyaç duymadan resmî öğeyi değiştirir.
- Kişisel Plan Öğesi için öneri oluşturulmaz; yalnız öğenin sahibi içeriği değiştirir.

### Öneri işlemleri

Düzenleyici aşağıdaki ortak değişiklikleri önerebilir:

- Yeni Ortak Plan Öğesi oluşturma
- Kartı farklı gün veya saate taşıma
- Başlangıç veya bitiş zamanını değiştirme
- Kart alanlarını düzenleme
- Kartı silme

Katılımcının yalnız kendi katılımını değiştirmesi Plan Değişiklik Önerisi değildir.

### Görünürlük ve durumlar

- Bekleyen öneriyi Gezinin tüm katılımcıları görür.
- Profil Ziyaretçileri önerileri görmez.
- Kararı yalnız Gezi Sahibi verir.
- Durumlar: `pending`, `approved`, `rejected`, `withdrawn`.
- Öneren bekleyen önerisini geri çekebilir.
- Aynı öneren ve hedef kart için yeni hareketler ayrı öneriler üretmek yerine mevcut bekleyen öneriyi günceller.
- Farklı kullanıcılar aynı kart için ayrı öneriler oluşturabilir.

### Alan bazlı uygulama

- Öneri tam kart kopyası değil, değiştirilmesi önerilen alanları taşıyan bir patch olarak uygulanır.
- Öneri onaylandığında yalnız patch içindeki alanlar güncel resmî değerleri ezer.
- Öneri dışındaki güncel kart alanları korunur.
- Aynı alan daha önce Gezi Sahibi veya başka onaylı öneri tarafından değiştirilmiş olsa bile en son onaylanan öneri kazanır.
- `stale` veya otomatik geçersizleştirme durumu yoktur.
- Gezi Sahibi onay ekranında mevcut değer, önerilen değer ve ezilecek alanları görür.
- Onay ve resmî kart güncellemesi atomik işlem olarak uygulanır.

### Takvimde öneri gösterimi

- Resmî kart yerinde kalır.
- Önerilen zaman veya süre kesik çizgili, yarı saydam hayalet kart olarak gösterilir.
- Hayalet kartta öneren kişi ve `Öneri` etiketi bulunur.
- Silme önerisi resmî kartı soldurur fakat onaylanana kadar kaldırmaz.
- Yeni kart önerisi yalnız hayalet kart olarak görünür.
- Aynı karta ait birden fazla öneri seçilebilir bir öneri göstergesi altında gruplanır.

## Takvim görünümü

### Masaüstü

- Pazartesi başlangıçlı 7 günlük görünüm
- 24 saatlik dikey zaman çizelgesi
- Her 30 dakikada görünür ayırıcı çizgi
- Her tam saatte saat etiketi
- Varsayılan açılışta ilk karta veya saat 08:00'e otomatik kaydırma
- Bugünün sütununda ayırt edici arka plan
- Geçerli zamanı gösteren yatay çizgi
- Üstte ayrı Tüm Gün satırı

### Mobil

- Aynı anda tek gün gösterilir.
- Önceki/sonraki gün hareketi haftalar arasında kesintisiz devam eder.
- Tarih seçiciyle doğrudan güne gidilebilir.
- Mobilde HTML sürükle-bırak yerine pointer/touch etkileşimi kullanılır.
- Dokunma ile kart açılır; uzun basma hareket modunu başlatır.

### Tarih navigasyonu

- Önceki ve sonraki hafta/gün
- Bugün
- Tarih seçici
- Gösterilen tarih aralığı başlıkta açıkça belirtilir.
- Navigasyon URL sorgusuna yansır; yenileme ve geri/ileri hareketlerinde tarih korunur.

## Zaman hassasiyeti

- Izgara çizgileri 30 dakikadır.
- Oluşturma, taşıma ve yeniden boyutlandırma 15 dakikaya hizalanır.
- Minimum zamanlı kart süresi 15 dakikadır.
- Varsayılan yeni kart süresi 60 dakikadır.
- Kart günler arasında taşındığında süresi korunur.
- Başlangıç kenarı yalnız başlangıcı, bitiş kenarı yalnız bitişi değiştirir.
- Bitiş başlangıçtan önce veya başlangıca eşit olamaz.

## Saat dilimleri

- Kalıcı zaman modeli UTC başlangıç/bitiş anları ile IANA başlangıç/bitiş saat dilimlerini korur.
- Kartın gün ve başlangıç konumu başlangıç saat dilimindeki yerel saate göre hesaplanır.
- Kart etiketi başlangıç ve bitiş saatlerini kendi saat dilimleriyle gösterir.
- Saat dilimleri farklıysa iki kısaltma da kartta veya ayrıntı görünümünde belirtilir.
- Yaz/kış saati dönüşümleri domain zaman yardımcıları üzerinden yapılır; tarayıcı saat dilimi sessizce kalıcı değere dönüştürülmez.

## Kart yerleşimi ve çakışmalar

### Çakışma tanımı

İki zamanlı kartın zaman aralıkları kesişiyorsa çakışırlar. Bir kartın bitişi diğerinin başlangıcına eşitse çakışma sayılmaz.

### Yan yana yerleşim

- Aynı gün içindeki kesişen kartlar çakışma kümelerine ayrılır.
- Her kümede kartlar başlangıç zamanı, ardından süre ve kimlik ile kararlı biçimde sıralanır.
- Kart, zaman aralığı boyunca boş olan en soldaki sütuna yerleştirilir.
- Kümenin ihtiyaç duyduğu en yüksek eşzamanlı sütun sayısı temel genişliği belirler.
- Kartın sağındaki komşu sütunlar kartın tüm süresi boyunca boşsa kart bu sütunlara doğru genişler.
- Kartlar birbirini kapatmaz.
- Sütunlar arasında en az 2 piksel boşluk bırakılır.
- Çok dar kartlarda ikincil bilgiler saklanır; başlık, zaman ve tip göstergesi korunur.
- Hover veya klavye odağında kart öne çıkar ve tam içeriği tooltip/popover ile gösterilir.
- Çakışan kartlarda uyarı işareti bulunur ancak kayıt engellenmez.

## Kart etkileşimleri

### Takvimden oluşturma

- Boş zaman alanına çift tıklama, o noktadan başlayan 60 dakikalık kart düzenleyiciyi açar.
- Tıklanan zaman 15 dakikaya hizalanır.
- Tüm Gün satırına çift tıklama tarih-only kart oluşturur.
- Mobilde boş alana uzun basma aynı işlemi başlatır.
- Düzenleyici Ortak türü seçerse kayıt yerine oluşturma önerisi oluşur.
- Viewer yalnız Kişisel türü seçebilir.

### Taşıma

- Kart gövdesi tutulup aynı gün içinde veya başka güne sürüklenebilir.
- Sürükleme başlangıcında imlecin kart içindeki dikey ofseti korunur.
- Hayalet önizleme yeni zaman, süre ve çakışmaları gösterir.
- Kişisel kart sahibi ve Gezi Sahibi yetkili oldukları kartlarda doğrudan kayıt yapar.
- Düzenleyicinin Ortak kart hareketi öneri oluşturur veya mevcut önerisini günceller.

### Yeniden boyutlandırma

- Kartın üst kenarı başlangıç zamanını değiştirir.
- Kartın alt kenarı bitiş zamanını değiştirir.
- Tutamaklar masaüstünde hover/focus ile, mobilde seçili kartta görünür.
- Yeniden boyutlandırma sırasında zaman etiketi canlı güncellenir.

### Kartı açma

- Tıklama kart ayrıntı/düzenleme modalını açar.
- Salt okunur kullanıcı aynı modalı devre dışı alanlarla görür.
- Düzenleyici Ortak kartı kaydettiğinde doğrudan kartı değil öneri patch'ini kaydeder.

### Hata davranışı

- Doğrudan yetkili değişiklik ekranda optimistic olarak gösterilir.
- Firestore yazımı başarısız olursa kart eski konum ve boyutuna döner.
- Kullanıcıya anlaşılır hata ve yeniden deneme seçeneği gösterilir.
- Öneri yazımı başarısız olursa resmî kart hiçbir zaman değişmez.

## Kart düzenleyici

Kart düzenleyici aşağıdaki alanları kapsar:

- Tür: Ortak Plan Öğesi veya Kişisel Plan Öğesi
- Başlık
- Kart tipi
- Durum
- Başlangıç ve bitiş
- Başlangıç ve bitiş saat dilimleri
- Tarih-only seçeneği
- Konum adı, harita bağlantısı, enlem ve boylam
- Not
- Görünürlük
- Katılımcılar
- Kullanıcının karta bağlı kişisel notları
- Kullanıcının karta bağlı Harcamaları
- Kullanıcının kişisel bağlantıları ve ekleri

Ortak alanlar ile kullanıcıya ait kişisel alanlar görsel olarak ayrı bölümlerde gösterilir.

## Kart tipleri

Takvim 10 kart tipi kullanır:

| Tip | Görsel yön |
| --- | --- |
| Uçuş | İndigo, uçak simgesi |
| Konaklama | Mor, yatak simgesi |
| Ulaşım | Mavi, araç simgesi |
| Yeme–İçme | Mercan, çatal-kaşık simgesi |
| Müze | Zümrüt, yapı simgesi |
| Tur/Aktivite | Teal, pusula simgesi |
| Eğlence | Menekşe, yıldız simgesi |
| Alışveriş | Amber, çanta simgesi |
| Sağlık | Kırmızı, sağlık simgesi |
| Diğer | Slate, nokta simgesi |

Renk tek başına anlam taşımaz; simge ve metin etiketi de kullanılır.

## Kart durumları

- Yapılacak
- Tamamlandı
- Ertelendi
- İptal edildi

Tamamlanan kartlar düşük vurgu ve tamamlandı göstergesiyle; ertelenenler kesik vurgu ile; iptal edilenler üstü çizili fakat okunabilir biçimde gösterilir.

## Yetki özeti

| Eylem | Gezi Sahibi | Düzenleyici | Viewer | Profil Ziyaretçisi |
| --- | --- | --- | --- | --- |
| Ortak kartı doğrudan değiştirme | Evet | Hayır | Hayır | Hayır |
| Ortak kart için öneri | Gereksiz | Evet | Hayır | Hayır |
| Önerileri görme | Evet | Evet | Evet | Hayır |
| Öneriyi onaylama/reddetme | Evet | Hayır | Hayır | Hayır |
| Kendi kişisel kartını yönetme | Evet | Evet | Evet | Hayır |
| Başkasının kişisel kartını düzenleme | Hayır | Hayır | Hayır | Hayır |
| Kendi katılımından ayrılma | Evet | Evet | Evet | Hayır |
| Ayrılanı ortak karta yeniden dahil etme | Evet | Hayır | Hayır | Hayır |
| Kişisel karta ilk katılım isteğini karara bağlama | Kart sahibi ise | Kart sahibi ise | Kart sahibi ise | Hayır |

## Güvenlik sınırı

Firestore Security Rules aşağıdakileri istemciden bağımsız olarak uygular:

- Plan Öğesi türü ve sahipliği
- Ortak kart doğrudan yazma yetkisi
- Düzenleyicinin yalnız öneri oluşturabilmesi
- Viewer'ın öneri oluşturamaması
- Kişisel kartı yalnız sahibinin değiştirebilmesi
- Önerileri yalnız Gezi katılımcılarının okuyabilmesi
- Öneriyi yalnız Gezi Sahibinin onaylayabilmesi
- Plan Katılım İsteğini yalnız Gezi katılımcısının oluşturabilmesi
- Profil Ziyaretçisinin katılım ve katılımcı kimliklerine erişememesi
- Ayrılma sırasında karta bağlı kullanıcı verilerinin atomik silinmesi

## Kabul kriterleri

### Takvim

- Haftalık masaüstü takviminde 24 saat ve 30 dakikalık çizgiler görünür.
- Kartlar UTC anlarından doğru yerel güne ve saate yerleşir.
- Taşıma ve resize 15 dakikaya hizalanır.
- Kart başka güne taşındığında süre korunur.
- Üst ve alt tutamaklar doğru alanı değiştirir.
- Çakışan kartlar üst üste binmeden yan yana ve mümkün olan genişlikte görünür.
- Tarih-only öğeler Tüm Gün satırında görünür.
- Mobil görünüm tek gün, dokunmatik taşıma ve resize sunar.

### Yetki ve öneriler

- Gezi Sahibi Ortak kart değişikliklerini doğrudan uygular.
- Düzenleyicinin Ortak kart değişikliği resmî kartı değiştirmeden öneri oluşturur.
- Viewer Ortak kart önerisi oluşturamaz.
- Tüm Gezi katılımcıları bekleyen önerileri görür.
- Onaylanan öneri yalnız patch alanlarını ezer.
- Reddedilen veya geri çekilen öneri resmî kartı değiştirmez.
- Kişisel kartı yalnız sahibi değiştirebilir.

### Katılım

- Ortak kart ilk oluşturulduğunda tüm Gezi katılımcıları katılmış görünür.
- Kullanıcı ayrılırken veri kaybı uyarısını görür.
- Ayrılma karta bağlı kişisel kayıtları siler.
- Ayrılan kullanıcı kendisini yeniden dahil edemez.
- Gezi Sahibi ayrılan kullanıcıyı yeniden dahil edebilir.
- Kişisel görünür karta yalnız Gezi katılımcısı istek gönderebilir.
- Profil Ziyaretçisi katılımcı adlarını göremez ve istek gönderemez.

## Test kapsamı

- Takvim yerleşim matematiği için saf unit testler
- Çakışma kümeleri, sütun atama ve sütun genişletme testleri
- 15 dakikalık snap, drag ve resize reducer testleri
- Saat dilimi ve DST sınır testleri
- Yetki matrisi unit testleri
- Firestore Emulator ile doğrudan yazma ve öneri kuralları
- Firestore Emulator ile katılım, ayrılma ve atomik kişisel veri silme
- Masaüstü drag/resize ve takvimden oluşturma UI testleri
- Mobil tek gün ve touch etkileşimi UI testleri
- Gezi Sahibi öneri onay/red smoke testleri
