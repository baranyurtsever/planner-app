# Peregrin

Peregrin is a collaborative travel-planning context in which participants organize a trip together while retaining their own personal preferences.

## Language

**Gezi**:
Katılımcıları ve rolleri bulunan; takvim, rota ve ortak masraflar gibi paylaşılan planlama bilgilerini kapsayan ortak çalışma alanı.
_Avoid_: Kullanıcı gezisi, kişisel gezi

**Gezi Ayarı**:
Belirli bir Gezi için yalnızca ilgili kullanıcıya ait para birimi ve kişi sayısı gibi tercihler.
_Avoid_: Kişisel gezi verisi, ortak gezi ayarı

**Hazırlık Öğesi**:
Bir kullanıcının belirli bir Gezi için takip ettiği valiz, belge veya diğer kişisel hazırlık kaydı. Diğer katılımcılarla paylaşılan görevleri kapsamaz.
_Avoid_: Ortak görev, gezi görevi

**Harcama Görünürlüğü**:
Bir harcamanın yalnızca sahibi, Gezi katılımcıları veya ilgili profili görüntüleyen herkes tarafından görülebileceğini belirleyen paylaşım seviyesi.
_Avoid_: Public, ortak harcama

**Harcama**:
Belirli bir Gezi kapsamında tek bir kullanıcıya ait mali kayıt. Görünürlüğünün genişletilmesi, sahipliğini veya düzenleme yetkisini değiştirmez.
_Avoid_: Ortak masraf, paylaşılan sahiplik

**Harcama Sahibi**:
Harcamayı kaydeden, ödemeyi yapan ve kaydı değiştirebilen Gezi katılımcısı. Harcama Payı olan diğer katılımcılar Harcama Sahibi olmaz.
_Avoid_: Ortak ödeyen, harcama yöneticisi

**Harcama Payı**:
Gezi katılımcılarıyla görünür bir Harcanan kaydın, seçilen Hesaplaşma Katılımcıları arasında eşit bölünen karşılığı.
_Avoid_: Sahiplik payı, kişisel harcama

**Hesaplaşma Katılımcısı**:
Belirli bir Harcama Payından sorumlu Gezi katılımcısı. Yalnızca Gezi katılımcılarıyla görünür Harcamalarda bulunur.
_Avoid_: Borçlu, Harcama Sahibi

**Hesaplaşma Para Birimi**:
Bir Gezi içindeki Harcama Paylarını ortak değerde karşılaştırmak için kullanılan para birimi. Harcamaya kaydedilen dönüşüm kuru sonradan değişmez.
_Avoid_: Görüntüleme para birimi, canlı kur

**Profil Ziyaretçisi**:
Bir kullanıcının profilini görüntüleyen fakat görüntülediği Geziye katılımcı olmayan, oturum açması gerekmeyen kişi. Yalnızca herkese açılmış Gezi bilgilerini, Harcamaları ve plan öğelerini salt okunur görür.
_Avoid_: Gözlemci, katılımcı, üye

**Plan Öğesi**:
Uçuş, konaklama, etkinlik veya rota durağı gibi bir Gezi kapsamında zamanlanan kayıt. Bir Plan Öğesi, Ortak Plan Öğesi veya Kişisel Plan Öğesidir.
_Avoid_: Kart, etkinlik kaydı, kişisel gezi

**Ortak Plan Öğesi**:
Gezi planını temsil eden ve varsayılan olarak tüm katılımcıları kapsayan Plan Öğesi. Resmî içeriği Gezi Sahibi belirler; diğer yetkili katılımcılar değişiklik önerebilir.
_Avoid_: Sahipsiz kart, herkesin kartı

**Kişisel Plan Öğesi**:
Bir Gezi katılımcısına ait olan ve içeriği yalnız sahibi tarafından değiştirilebilen Plan Öğesi. Başka katılımcıların katılması, öğenin sahipliğini değiştirmez.
_Avoid_: Kişisel gezi, özel gezi

**Plan Katılımı**:
Bir Gezi katılımcısının Plan Öğesine katılma veya öğeden ayrılma durumu. Katılım, Plan Öğesini düzenleme yetkisi veya sahiplik sağlamaz.
_Avoid_: Kart üyeliği, ortak sahiplik

**Plan Değişiklik Önerisi**:
Bir Ortak Plan Öğesinde yapılması istenen fakat Gezi Sahibi onaylayana kadar resmî plana uygulanmayan değişiklik.
_Avoid_: Taslak kart, bekleyen düzenleme

**Öneri Oyu**:
Bir Gezi katılımcısının bekleyen Plan Değişiklik Önerisini desteklediğini veya ona karşı olduğunu bildiren, nihai kararı bağlamayan görüşü.
_Avoid_: Onay, veto, karar

**Öneri Kararı**:
Gezi Sahibinin bir Plan Değişiklik Önerisini kabul veya reddetmesiyle oluşan; öneri içeriğini ve karar anındaki oyları koruyan kalıcı kayıt.
_Avoid_: Oy sonucu, geçici durum

**Plan Katılım İsteği**:
Bir Gezi katılımcısının görünür bir Kişisel Plan Öğesine katılmak için öğenin sahibine gönderdiği istek. Profil Ziyaretçileri Plan Katılım İsteği gönderemez.
_Avoid_: Herkese açık katılım, arkadaşlık isteği

**Plan Zamanı**:
Zamanlı bir Plan Öğesinin mutlak başlangıç ve bitiş anları ile bu anların gösterileceği başlangıç ve bitiş saat dilimleri. Saat içermeyen bir plan yalnızca yerel tarih taşır.
_Avoid_: Saat dilimsiz tarih-saat, tarayıcı saati

**Plan Belgesi**:
Bir Plan Öğesine bağlı bilet, rezervasyon, QR, PDF veya bağlantı kaydı. Plan Belgesi onu ekleyen kullanıcıya aittir; varsayılan olarak yalnız sahibi görür ve Gezi katılımcılarıyla açıkça paylaşılabilir. Profil Ziyaretçilerine hiçbir zaman gösterilmez.
_Avoid_: Herkese açık ek, ortak sahipli belge, profil belgesi

**Gezi Varsayılan Saat Dilimi**:
Gezi Sahibinin belirlediği ve yalnızca yeni Plan Öğelerinin başlangıç ile bitiş saat dilimine başlangıç değeri sağlayan IANA saat dilimi. Değiştirilmesi mevcut Plan Öğelerinin kayıtlı zamanlarını dönüştürmez.
_Avoid_: Kullanıcının tarayıcı saati, tüm kartları geriye dönük değiştiren saat dilimi

**Gezi Görünürlüğü**:
Bir Geziyi gizli tutan veya kullanıcının profilinde görünür kılan üst seviye paylaşım ayarı. Gizli bir Gezinin altındaki kayıtlar kendi görünürlük seviyelerinden bağımsız olarak Profil Ziyaretçilerine gösterilmez.
_Avoid_: Public, Plan Öğesi görünürlüğü

**Gezi Daveti**:
Gezi Sahibinin bir kullanıcıya önerdiği Gezi rolüdür. Davet kabul edilene kadar kullanıcı Gezi katılımcısı olmaz ve Gezi verilerine erişemez.
_Avoid_: Doğrudan katılımcı ekleme, Plan Katılım İsteği, arkadaşlık isteği

**İşlem Merkezi**:
Bir kullanıcının cevap veya karar vermesini bekleyen Gezi Daveti, arkadaşlık isteği, Plan Katılım İsteği ve Plan Değişiklik Önerilerini geziler arasında birleştiren kişisel görünüm. Yaklaşan planlar bilgi verir fakat bekleyen işlem sayılmaz.
_Avoid_: Bildirim kutusu, aktivite geçmişi

**Arşivlenmiş Gezi**:
Aktif planlamadan kaldırılmış, normal listelerde gösterilmeyen ve değiştirilemeyen; ortak ve kişisel kayıtları korunmaya devam eden Gezi.
_Avoid_: Silinmiş gezi, tamamlanmış gezi

**Kullanıcı Adı**:
Bir profili aramak ve tanımlamak için kullanılan, büyük/küçük harften bağımsız olarak sistem genelinde benzersiz ad.
_Avoid_: Görünen ad, e-posta

**Arkadaşlık**:
İki kullanıcı arasındaki, kabul edilmiş tek ve karşılıklı ilişki kaydı. Kullanıcıların profillerinde ayrı ayrı tutulan arkadaş listelerinin birleşimi değildir.
_Avoid_: Arkadaş dizisi, takip, bekleyen istek

**Profil**:
Bir kullanıcıyı diğer kullanıcılara tanıtan Kullanıcı Adı, görünen ad, biyografi ve profil görselinden oluşan görüntülenebilir kimlik.
_Avoid_: Hesap, kullanıcı belgesi

**Hesap**:
Kimlik doğrulama ve kullanıcıya özel bilgiler için ayrılan, yalnızca sahibinin erişebildiği kayıt.
_Avoid_: Profil, herkese açık kullanıcı verisi
