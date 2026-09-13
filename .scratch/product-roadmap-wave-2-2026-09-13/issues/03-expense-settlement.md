# 03 — Çoklu para birimi ve kişi bazlı hesap kapatma

Type: feature
Status: resolved

## Amaç

Gezi katılımcılarının farklı para birimlerindeki ortak Harcamaları kim ödedi ve kimler arasında paylaşılacak bilgisiyle kaydedip en az ödeme hareketiyle hesap kapatmasını sağlamak.

## Kabul kriterleri

- Gezi Sahibi Gezi için üç harfli bir Hesaplaşma Para Birimi belirleyebilir.
- Gezi katılımcılarıyla görünür Harcanan kayıt, seçilen aktif katılımcılar arasında eşit bölünebilir.
- Harcama Sahibi ödeyen kişidir; Harcama sahipliği ve düzenleme yetkisi paylaşılmaz.
- Farklı para birimindeki Harcamada Hesaplaşma Para Birimine dönüşüm kuru zorunludur ve kayda dondurulur.
- Bütçe ekranı hesaplaşma bakiyelerini sadeleştirerek “kim kime ne ödeyecek” listesini gösterir.
- Özel, profilde açık, planlanan ve gelir kayıtları Hesaplaşmaya katılmaz; katılımcı kimlikleri profil ziyaretçilerine açılmaz.
- Eski Harcamalar bölüşüm verisi olmadan çalışmaya devam eder ve kendiliğinden borç üretmez.
- Firestore kuralları yalnız Gezi katılımcılarının paylaştırılmasına izin verir.

## Comments

- Geziye varsayılan Hesaplaşma Para Birimi eklendi; mevcut geziler TRY ile geriye uyumlu çalışıyor.
- Geziye açık harcanan kayıtlar için ödeyen kişi, eşit bölüşülecek aktif katılımcılar ve dondurulmuş dönüşüm kuru kaydediliyor.
- Eski Harcamalar borç üretmiyor; geçmişte farklı Hesaplaşma Para Birimiyle kaydedilen Harcamalar kendi para birimlerinde ayrı hesaplanıyor.
- Özel, profilde açık, planlanan ve gelir kayıtlarında katılımcı listesi temizleniyor.
- Borç/alacak bakiyeleri en az sayıda ödeme hareketine indirgenerek kişi adlarıyla gösteriliyor.
- Firestore kuralları gezi dışındaki kullanıcıların paylaştırmaya eklenmesini ve geçersiz dönüşüm kurlarını reddediyor.
- Doğrulama: 103 birim/bileşen testi, 40 Firestore kural testi ve 2 Chromium uçtan uca testi geçti; lint ve üretim derlemesi başarılı.
