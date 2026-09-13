# Seyahat planlama uygulamaları: rakip özellik araştırması

Tarih: 13 Eylül 2026

## Amaç ve yöntem

Bu not, Peregrin'e eklenebilecek özellikleri belirlemek için güncel seyahat planlama ürünlerini karşılaştırır. İnceleme yalnız ürün sahiplerinin resmî ürün, destek ve yardım sayfalarına dayanır. Pazarlama sayfasındaki bir ifade, ürünün bütün platformlarında veya ücretsiz planda bulunduğu anlamına gelmeyebilir; ücretli ya da platforma özgü ayrımlar bilindiği yerde belirtilmiştir.

Peregrin'in mevcut tabanı; ortak gezi ve Plan Öğeleri, owner/editor/viewer rolleri, öneri ve katılım akışları, liste/takvim/rota görünümleri, bütçe, hazırlık listeleri, kişisel görünürlük ve IANA saat dilimi modelidir. Bu nedenle aşağıdaki öneriler, var olan çekirdeği çoğaltmak yerine onu tamamlamaya odaklanır.

## Yönetici özeti

Pazardaki ürünler üç ana kümeye ayrılıyor:

1. **Rezervasyon merkezi:** TripIt ve Tripsy, e-postadan uçuş/otel/aktivite çıkarıp tek zaman çizelgesine dönüştürmeyi ana değer önerisi yapıyor.
2. **Plan + harita + keşif:** Wanderlog ve Tripomatic, yer arama, gün bazlı program ve rota optimizasyonunu birlikte sunuyor.
3. **Seyahat sırasında ve sonrasında yardımcı:** Roadtrippers çevrimdışı rota ve yol üzeri keşifte; Polarsteps ise otomatik gezi kaydı, paylaşım ve anı üretiminde ayrışıyor.

Peregrin için en iyi kısa vadeli fırsat, bütün bu ürünlerin kapsamını kopyalamak değil; **grup kararlarını ve gerçek seyahat icrasını birbirine bağlamak**. Önce davet/rol akışı, rezervasyon belgeleri, takvim dışa aktarma ve “Bugün” görünümü tamamlanmalı. Sonra seyahat süresi destekli programlama, çevrimdışı paket ve rezervasyon içe aktarma gelmeli.

## Ürün bazında bulgular

### Wanderlog

Öne çıkan özellikler:

- Harita ve programı aynı görünümde birleştiriyor; yerler arasında mesafe ve seyahat süresi gösteriyor.
- Canlı ortak düzenleme, masraf takibi ve bölüşme, bütçe, kontrol listeleri ve rezervasyon saklama sunuyor.
- Rezervasyon e-postalarını ileterek veya Gmail taramasıyla içe aktarabiliyor.
- Rota optimizasyonu, çevrimdışı erişim, canlı uçuş durumu, Google Maps'e dışa aktarma, yer rehberleri ve kişiselleştirilmiş/AI önerileri sunuyor.
- Yer kartlarında puan, açılış saati ve resmî site bağlantısı gibi karar vermeyi kolaylaştıran bağlam sağlıyor.

Ayırt edici yönü, planlama tablosu, harita, rezervasyon kutusu, bütçe ve keşfi tek üründe en geniş biçimde birleştirmesi. Peregrin için çıkarım: rota görünümü yalnız pinleri göstermekle kalmamalı; gün içi sıra, ulaşım modu, süre ve çakışma riskini görünür kılmalı. Kaynak: [Wanderlog resmî ürün sayfası](https://wanderlog.com/).

### TripIt

Öne çıkan özellikler:

- Kullanıcı rezervasyon onay e-postasını özel bir adrese ilettiğinde kapsamlı programı otomatik oluşturuyor; gelen kutusu eşitlemesi de sunuyor.
- Takvim eşitleme, metin/e-posta/uygulama yoluyla paylaşma, belge ekleme, ulaşım seçenekleri, yakındaki yerler ve hava durumu sağlıyor.
- Pro planında gecikme, iptal, bağlantı, kapı ve bagaj bildirimleri; alternatif uçuş, check-in hatırlatma, havaalanına çıkış zamanı, interaktif terminal haritaları ve ödül programı takibi bulunuyor.
- Karbon ayak izi, seyahat istatistikleri, pasaport yenileme hatırlatması ve ülkeye özgü seyahat bilgisi gibi yolculuk çevresi özellikleri var.

Ayırt edici yönü “nereden rezervasyon yaptığın fark etmez” yaklaşımıyla manuel veri girişini ortadan kaldırması ve uçuş günündeki belirsizliği yönetmesi. Peregrin için çıkarım: rezervasyon içe aktarma ayrı bir ürün alanı değil, Plan Öğesi oluşturmanın en hızlı yolu olmalı. Kaynaklar: [TripIt ücretsiz özellikler](https://www.tripit.com/web/free), [TripIt ve TripIt Pro karşılaştırması](https://help.tripit.com/en/support/solutions/articles/103000063396-tripit-or-tripit-pro-).

### Tripomatic (Sygic Travel çizgisi)

Öne çıkan özellikler:

- İlgi, tempo ve seyahat tarzına göre AI destekli program; dünya çapında yer kataloğu, açılış saatleri ve yerel ipuçları sunuyor.
- Gün bazlı sürükle-bırak planlama ve akıllı süre tahminleri var.
- Yürüme, toplu taşıma, araba, bisiklet ve yürüyüş parkuru için rota optimizasyonu yapıyor.
- Otomatik maliyet tahmini, tur/bilet rezervasyonu, gerçek zamanlı ortak çalışma ve görüntüleme/düzenleme izinleri sunuyor.
- PDF, GPX ve KML dışa aktarma; çevrimdışı harita; geziyi çoğaltıp şablon olarak kullanma ve gün/yer/rota notları bulunuyor.

Ayırt edici yönü, “nereye gitmeli?” keşfinden “günü nasıl sığdırmalı?” sorusuna kadar yer verisi ve rota zamanını programın parçası yapması. Peregrin için çıkarım: boş bir kart formundan önce yer arama ve bağlamsal öneri; kart oluşturulduktan sonra süre/ulaşım uyarıları gelmeli. Kaynak: [Tripomatic resmî ürün sayfası ve SSS](https://tripomatic.com/en).

### Roadtrippers

Öne çıkan özellikler:

- Yolculuk başlangıç/bitişine göre güzergâh çıkarıyor; yol üzerindeki yerleri kategori ve rotadan sapma yarıçapıyla keşfettiriyor.
- Durakları verimli sıraya koyuyor; kullanıcı sırayı ve yolu değiştirebiliyor.
- Toplam sürüş süresi, mesafe, durak sayısı, yakıt maliyeti ve durak bütçelerini özetliyor.
- Ortak çalışma, canlı trafik, çevrimdışı harita, GPX dışa aktarma, yazdırma ve paylaşılabilir/yerleştirilebilir gezi sunuyor.
- Araç profili ve RV ölçülerine göre güvenli rota; otoyol vb. kaçınmalar ve Autopilot ile tercihe dayalı başlangıç planı sağlıyor.

Ayırt edici yönü bir güzergâhı yalnız A-B navigasyonu değil, “yoldan ne kadar sapmaya değer?” keşif problemi olarak çözmesi. Peregrin için çıkarım: rota görünümüne ulaşım modu, duraklar arası süre ve “rota üzerinde ara” eklemek; genel optimizasyondan daha anlaşılır ilk adımlardır. Kaynaklar: [Roadtrippers mobil planlama rehberi](https://support.roadtrippers.com/hc/en-us/articles/202594209-Planning-a-Trip-in-Our-Mobile-App), [Roadtrippers web başlangıç rehberi](https://support.roadtrippers.com/hc/en-us/articles/203322709-Website-Getting-Started), [Roadtrippers üyelik özellikleri](https://roadtrippers.com/plus-with-bogo/).

### Tripsy

Öne çıkan özellikler:

- İletilen rezervasyon e-postalarını uçuş, konaklama ve aktivitelere dönüştürüyor.
- Uçuş gecikmesi, kapı ve bagaj bildirimleri; takvim eşitleme; rezervasyon, e-posta, not, fotoğraf, bağlantı ve belge saklama sunuyor.
- Davet başına işbirlikçi veya salt okunur rol verilebiliyor; belge ve masraf görünürlüğü ayrıca sınırlandırılabiliyor.
- “Favori misafir”, sık seyahat edilen kişiyi yeni gezilere otomatik ekleyebiliyor.
- Gezi başına çoklu para birimiyle masraf yönetimi ve katılımcıların kendi masraflarını eklemesi var.
- Ülke, otel gecesi, uçuş süresi ve mesafe gibi geçmiş seyahat istatistiklerini görselleştiriyor.

Ayırt edici yönü, Apple odaklı cilalı bir program deneyimini ince taneli misafir izinleriyle birleştirmesi. Peregrin için çıkarım: mevcut rol sistemi doğru yönde; belge/masraf gibi hassas alanlarda rolün yanında ayrı görünürlük ayarı ve sık kullanılan yol arkadaşı akışı değerlidir. Kaynak: [Tripsy resmî ürün sayfası](https://tripsy.app/).

### TripMapper

Öne çıkan özellikler:

- Kart/liste görünümü, başlangıç-bitiş saati, görsel ve notlarla program oluşturuyor.
- Bütçe, para birimi dönüşümü, görev ve son tarih, bildirim, ek dosya, PDF, harita ve çevrimdışı erişim sunuyor.
- Hazır programlar kopyalanıp düzenlenebiliyor.
- Admin/editor/viewer seviyeleri var; masraf ve dosya görünürlüğü ayrı yönetilebiliyor. Dosyalar varsayılan olarak yalnız sahibine görünür.

Ayırt edici yönü, planlama görevleri ile programı aynı alanda tutması ve masraf/dosya gizliliğini üyelik rolünden ayırması. Peregrin için çıkarım: mevcut Hazırlık Öğeleri program kartlarına bağlanabilmeli; örneğin “bilet al” görevi ilgili uçuş kartından üretilebilmeli. Kaynaklar: [TripMapper resmî özellik sayfası](https://www.tripmapper.co/), [TripMapper ortak çalışma rolleri](https://help.tripmapper.co/en/articles/5646798-can-you-invite-others-to-view-and-edit-your-trip-itinerary).

### Polarsteps

Öne çıkan özellikler:

- Program oluşturma, konaklama/aktivite ekleme, kişiselleştirilmiş keşif ve uçuş arayıp programa ekleme sunuyor.
- Gezi sırasında rotayı düşük pil tüketimiyle ve çevrimdışı otomatik kaydediyor; fotoğraf, video ve hikâyelerle zaman çizelgesi oluşturuyor.
- Canlı konumu gösterme ya da yalnız son paylaşılan adıma kadar rotayı gösterme gibi gizlilik kontrolleri var.
- Geziyi video özetine veya basılı fotoğraf kitabına dönüştürüyor; ziyaret edilen ülkeler ve diğer istatistikleri biriktiriyor.
- AI programı kullanıcının geçmiş gezilerinden seyahat zevkini öğreniyor ve önerilerin neden uygun olduğunu açıklıyor.

Ayırt edici yönü planlama, geziyi yaşama ve sonradan hatırlama döngüsünü tek üründe kapatması. Peregrin için çıkarım: anı/günlük büyük bir yeni alan olduğundan kısa vadeli olmamalı; ancak “geziyi tamamla → özet ve istatistik” düşük kapsamlı bir başlangıç olabilir. Kaynaklar: [Polarsteps resmî ürün sayfası](https://www.polarsteps.com/), [Polarsteps 2026 sürüm notu](https://www.polarsteps.com/summer-release), [Polarsteps AI programları](https://news.polarsteps.com/releases/ai-itineraries).

## Özellik matrisi

| Yetenek | Wanderlog | TripIt | Tripomatic | Roadtrippers | Tripsy | TripMapper | Polarsteps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Gerçek zamanlı ortak plan | Evet | Paylaşım ağırlıklı | Evet | Evet | Evet | Evet | Sınırlı/paylaşım ağırlıklı |
| Rezervasyon e-postası içe aktarma | Evet | Ana özellik | Belirtilmiyor | Belirtilmiyor | Evet | İş ürününde var | Belirtilmiyor |
| Gün bazlı program | Evet | Evet | Evet | Evet | Evet | Evet | Evet |
| Akıllı rota / süre | Evet | Ulaşım seçenekleri | Evet | Ana özellik | Akıllı rotalar | Harita | Rota haritası |
| Çevrimdışı erişim | Evet | Mobil erişim; açık çevrimdışı iddia incelenmedi | Evet | Evet | Belirtilmiyor | Evet | Evet |
| Takvim eşitleme | Belirtilmiyor | Evet | Belirtilmiyor | Belirtilmiyor | Evet | Belirtilmiyor | Belirtilmiyor |
| Belge/ek | Evet | Evet | Belirtilmiyor | Belirtilmiyor | Evet | Evet | Medya günlüğü |
| Bütçe/masraf | Evet | Belirtilmiyor | Evet | Yakıt + durak bütçesi | Evet | Evet | Belirtilmiyor |
| Canlı uçuş bilgisi | Evet | Evet | Belirtilmiyor | Belirtilmiyor | Evet | İş ürününde var | Uçuş arama/ekleme |
| Keşif/öneri | Evet | Yakındaki yerler | Ana özellik | Ana özellik | Belirtilmiyor | Hazır programlar | Evet |
| Dışa aktarma | Google Maps | Takvim | PDF/GPX/KML | GPX/yazdırma/embed | Takvim | PDF | Video/kitap |

“Belirtilmiyor”, özelliğin bulunmadığını değil, incelenen resmî kaynaklarda doğrulanmadığını ifade eder.

## Peregrin için önerilen öncelik sırası

Etki, kullanıcıya ve ürün farklılaşmasına beklenen katkıdır. Efor, mevcut Peregrin modeline göre göreli geliştirme maliyetidir.

| Sıra | Öneri | Etki | Efor | Gerekçe ve ilk kapsam |
| ---: | --- | --- | --- | --- |
| 1 | **Kullanıcı adı/e-posta ile davet ve bekleyen davetler** | Çok yüksek | Orta | Ortak planın giriş sürtünmesini kaldırır. Süreli ve iptal edilebilir davet; kabul sonrası üyelik; owner/editor/viewer seçimi. Tripsy ve TripMapper rol yaklaşımıyla doğrulanmış temel beklenti. |
| 2 | **Plan Öğesine belge, bağlantı ve rezervasyon bilgisi ekleme** | Çok yüksek | Orta | Bilet/QR/konfirmasyonu planın kullanıldığı anda erişilebilir yapar. İlk sürüm dosya + URL + rezervasyon numarası; dosya görünürlüğü varsayılan olarak sahibine özel olmalı. |
| 3 | **“Bugün / sıradaki” seyahat görünümü ve hatırlatmalar** | Yüksek | Düşük-Orta | Peregrin'i yalnız planlama aracından seyahat yardımcısına çevirir. Saat dilimine göre sıradaki Plan Öğesi, adres, belge ve hazırlık uyarısı; canlı uçuş verisi gerektirmez. |
| 4 | **ICS/takvim aboneliği ve dışa aktarma** | Yüksek | Orta | Programı kullanıcının günlük takvimine taşır ve tekrar giriş ihtiyacını azaltır. Yalnız yetkili öğeler; saat dilimi ve güncelleme davranışı açık olmalı. TripIt/Tripsy ana beklenti oluşturuyor. |
| 5 | **Duraklar arası ulaşım modu, süre ve çakışma uyarısı** | Çok yüksek | Orta-Yüksek | Mevcut takvim ve rotayı tek karar yüzeyine bağlar. Önce manuel/harita API süreleri ve “yetişmek zor” uyarısı; otomatik yeniden sıralama sonraki sürüm. |
| 6 | **Gezi için çevrimdışı paket** | Yüksek | Yüksek | Yabancı ülkede bağlantı kaybını kritik olmaktan çıkarır. İlk kapsam salt okunur program, adresler ve önceden indirilen ekler; tam çevrimdışı ortak düzenleme daha sonra. |
| 7 | **Rezervasyon e-postası/PDF içe aktarma** | Çok yüksek | Yüksek | Manuel Plan Öğesi girişini dramatik azaltır ve TripIt/Wanderlog/Tripsy ile özellik açığını kapatır. Önce uçuş ve otel için kullanıcı onaylı taslak; e-posta hesabına sürekli erişim yerine iletme/yükleme ile başlamak daha güvenli. |
| 8 | **Yer arama ve zengin yer kartı** | Yüksek | Orta-Yüksek | Adres, koordinat, açılış saati, site ve telefonun otomatik dolması veri kalitesini ve rota değerini yükseltir. Sağlayıcı maliyeti, lisans ve önbellekleme politikası seçimden önce netleşmeli. |
| 9 | **Çoklu para birimi, kur ve kişi bazlı hesap kapatma** | Orta-Yüksek | Orta | Uluslararası grup gezilerinde bütçeyi kullanışlı hale getirir. Harcamanın orijinal para birimi ve kullanılan kur dondurulmalı; “kim kime ne ödeyecek?” özeti eklenmeli. |
| 10 | **Plan önerileri için oylama ve karar son tarihi** | Yüksek | Orta | Rakiplerin çoğunda zayıf olan grup kararı alanında Peregrin'i ayrıştırır. Mevcut öneri modeline evet/hayır/belki, yorum, son tarih ve karar kaydı eklenebilir. |
| 11 | **Gezi/Plan Öğesi çoğaltma ve şablonlar** | Orta | Düşük-Orta | Tekrarlanan hafta sonu, iş gezisi veya hazırlık listesini hızlandırır. Tripomatic ve TripMapper'da doğrulanmış bir verimlilik özelliği. |
| 12 | **Uçuş numarasından detay ve canlı durum** | Yüksek | Yüksek + sürekli maliyet | Seyahat gününde güçlü değer üretir fakat veri sağlayıcı bağımlılığı ve operasyon maliyeti vardır. Rezervasyon alanı ve bildirim altyapısından sonra gelmeli. |
| 13 | **Açıklanabilir AI gezi taslağı** | Orta | Yüksek | Rakiplerde yaygınlaşıyor fakat temel veri/yer/rota katmanı olmadan yüzeysel kalır. Kullanıcının tempo, bütçe, ilgi ve zorunlu duraklarını alıp düzenlenebilir taslak üretmeli; neden önerildiğini göstermeli. |
| 14 | **Gezi sonrası özet, istatistik ve anı** | Orta | Orta-Yüksek | Retansiyon ve paylaşım sağlar ancak planlama çekirdeğinden uzaktır. İlk sürüm ziyaret edilen yer, toplam süre/mesafe ve seçili fotoğraflardan özel bir özet olabilir. |

## Önerilen teslim dalgaları

### Dalga 1 — Ortak planı kullanılabilir kıl

- Davet ve bekleyen işlem merkezi.
- Plan Öğesi ekleri ve rezervasyon alanları.
- Bugün/sıradaki görünümü.
- ICS dışa aktarma.
- Gezi ve Plan Öğesi çoğaltma.

Bu dalga, yeni harici veri sağlayıcısına bağımlılığı sınırlı tutarken günlük kullanım değerini yükseltir.

### Dalga 2 — Plan ile gerçek dünya arasındaki boşluğu kapat

- Ulaşım süresi ve çakışma uyarıları.
- Yer arama/zengin kartlar.
- Salt okunur çevrimdışı paket.
- Çoklu para birimi ve hesap kapatma.
- Öneri oylaması ve karar kaydı.

### Dalga 3 — Otomasyon ve seyahat zekâsı

- Rezervasyon e-postası/PDF içe aktarma.
- Canlı uçuş verisi ve bildirimler.
- Açıklanabilir AI taslakları.
- Gezi sonrası özet/anı.

## Ürün konumlandırma fırsatı

Rakiplerin çoğu “bütün rezervasyonların tek yerde” veya “haritada en iyi rota” söylemini sahiplenmiş durumda. Peregrin'in savunulabilir konumu şu olabilir:

> **Birlikte seyahat eden insanların karar verdiği, kimin neye katıldığını bildiği ve herkesin kendi saat diliminde güvenle uyguladığı ortak plan.**

Bu konum, mevcut öneri, katılım, rol, kişisel görünürlük ve saat dilimi altyapısına dayanır. Ürün yol haritasında her yeni özelliğin şu sorulardan en az birine belirgin yanıt vermesi yararlı olur: “Kim karar verdi?”, “Kim katılıyor?”, “Kim görebilir?”, “Sırada ne var?” ve “Oraya zamanında yetişebilir miyiz?”

## Kaynak dizini

- [Wanderlog](https://wanderlog.com/)
- [TripIt ücretsiz ürün](https://www.tripit.com/web/free)
- [TripIt / TripIt Pro karşılaştırması](https://help.tripit.com/en/support/solutions/articles/103000063396-tripit-or-tripit-pro-)
- [Tripomatic](https://tripomatic.com/en)
- [Roadtrippers mobil planlama](https://support.roadtrippers.com/hc/en-us/articles/202594209-Planning-a-Trip-in-Our-Mobile-App)
- [Roadtrippers web başlangıç](https://support.roadtrippers.com/hc/en-us/articles/203322709-Website-Getting-Started)
- [Roadtrippers üyelik özellikleri](https://roadtrippers.com/plus-with-bogo/)
- [Tripsy](https://tripsy.app/)
- [TripMapper](https://www.tripmapper.co/)
- [TripMapper ortak çalışma rolleri](https://help.tripmapper.co/en/articles/5646798-can-you-invite-others-to-view-and-edit-your-trip-itinerary)
- [Polarsteps](https://www.polarsteps.com/)
- [Polarsteps 2026 yaz sürümü](https://www.polarsteps.com/summer-release)
- [Polarsteps AI programları](https://news.polarsteps.com/releases/ai-itineraries)
