# 04 — ICS takvim dışa aktarma

Type: task
Status: resolved

## Amaç

Yetkili Plan Öğelerini saat dilimi bilgisi korunarak standart takvim dosyasına aktarmak.

## Kabul kriterleri

- Tarihli ve zamanlı Plan Öğeleri geçerli ICS üretir.
- Kişisel notlar ve görünmeyen Plan Öğeleri dışarı aktarılmaz.
- Çıktı Google, Apple ve Outlook takvimlerine eklenebilir.

## Comments

- Takvim ekranından kullanıcının katıldığı tüm görünür Plan Öğeleri tek `.ics` dosyası olarak indirilebilir.
- Plan Öğesi ayrıntısından yalnız ilgili öğe ayrı bir `.ics` dosyası olarak indirilebilir.
- Zamanlı öğeler standart UTC anlarıyla dışa aktarılır; başlangıç ve bitiş IANA saat dilimleri ayrıca korunur. Tarihli öğelerde ICS'nin dışlayıcı bitiş tarihi kuralı uygulanır.
- Başlık, zaman, konum ve iptal durumu dışa aktarılır; notlar, Plan Belgeleri, rezervasyon numaraları ve katılımcı kimlikleri aktarılmaz.
- Kullanıcının ayrıldığı veya katılımcısı olmadığı Plan Öğeleri toplu dışa aktarıma girmez.
- Doğrulama: ICS domain testleri, ilgili component testleri, gerçek tarayıcı indirme senaryosu ve production build.
