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

**Profil Ziyaretçisi**:
Bir kullanıcının profilini görüntüleyen fakat görüntülediği Geziye katılımcı olmayan, oturum açması gerekmeyen kişi. Yalnızca herkese açılmış Gezi bilgilerini, Harcamaları ve plan öğelerini salt okunur görür.
_Avoid_: Gözlemci, katılımcı, üye

**Plan Öğesi**:
Uçuş, konaklama, etkinlik veya rota durağı gibi Geziye ait ortak planlama kaydı. Sahip ve Düzenleyici tarafından yönetilir; Profil Ziyaretçilerine görünürlüğü ayrıca belirlenir.
_Avoid_: Kart, kullanıcı planı, etkinlik kaydı

**Plan Zamanı**:
Zamanlı bir Plan Öğesinin mutlak başlangıç ve bitiş anları ile bu anların gösterileceği başlangıç ve bitiş saat dilimleri. Saat içermeyen bir plan yalnızca yerel tarih taşır.
_Avoid_: Saat dilimsiz tarih-saat, tarayıcı saati

**Gezi Görünürlüğü**:
Bir Geziyi gizli tutan veya kullanıcının profilinde görünür kılan üst seviye paylaşım ayarı. Gizli bir Gezinin altındaki kayıtlar kendi görünürlük seviyelerinden bağımsız olarak Profil Ziyaretçilerine gösterilmez.
_Avoid_: Public, Plan Öğesi görünürlüğü

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
