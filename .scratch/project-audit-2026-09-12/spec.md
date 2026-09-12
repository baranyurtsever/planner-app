# Proje taraması — Yapılacaklar

Tarih: 2026-09-12
Durum: İnceleme tamamlandı; düzeltmeler uygulanmadı.

## Kapsam ve kanıt sınırı

Aktif feature modülleri, Firebase veri katmanı ve güvenlik kuralları; kimlik, profil, sosyal ilişkiler, Gezi yönetimi, bütçe, hazırlık ve takvim incelendi. CONTEXT.md, ADR belgeleri ve onaylanmış etkileşimli takvim spesifikasyonu esas alındı. Kullanıcıya ait eski src/App.jsx ve ilgisiz yerel dosyalar değiştirilmedi.

Bulgular statik kod incelemesine dayanır. Her ticket somut kod yolunu ve yapılacak doğrulamayı belirtir; listedeki her senaryo ayrı ayrı tarayıcıda veya emülatörde yeniden üretilmiş değildir. Canlı veriler incelenmedi ve üretim yayını yapılmadı. Bu liste bütün olası hataların eksiksiz garantisi değildir.

## Mevcut doğrulama

- npm test: 35 test geçti (13 dosya).
- npm run test:rules: 17 test geçti.
- npm run lint: başarılı.
- npm run build: başarılı; eski Browserslist veri uyarısı var.

Yeşil testler aşağıdaki açıkların bulunmadığı anlamına gelmiyor. Özellikle repository batch işlemleri ve gerçek pointer/form etkileşimleri için test açığı var.

## Öncelik sırası

P1: Gizlilik, veri bütünlüğü ve ana akışı engelleyen hatalar. P2: İşlevsel eksikler ve sağlamlaştırma. Öncelik kodun olası etkisine göre verilmiştir; ayrı yeniden üretim doğrulaması ticket uygulamasının ilk adımıdır.

- [x] **P1 / 01** — [Public Gezi belgesi katılımcı kimliklerini açığa çıkarıyor](issues/01-todo.md)
- [x] **P1 / 02** — [Public Plan Öğesi kopyası gizleme/silme sonrası açık kalabiliyor](issues/02-todo.md)
- [x] **P1 / 03** — [Kişisel bilgi formları ana Plan Öğesi formunu tetikliyor](issues/03-todo.md)
- [x] **P1 / 04** — [Sürükleme başlarken pointer capture sahibi kart kaldırılıyor](issues/04-todo.md)
- [x] **P1 / 05** — [Notu olmayan kullanıcı Plan Öğesinden ayrılamıyor](issues/05-todo.md)
- [x] **P1 / 06** — [Ayrılma sırasında kişisel veri silinmesi kurallarda garanti değil](issues/06-todo.md)
- [x] **P1 / 07** — [Kişisel katılım kuralları yetki sınırlarını korumuyor](issues/07-todo.md)
- [x] **P1 / 08** — [Eski form verisi güncel katılımı ve kart alanlarını eziyor](issues/08-todo.md)
- [x] **P2 / 09** — [Yeni kişisel kartın ilk kaydı public delete kuralına takılabilir](issues/09-todo.md)
- [x] **P2 / 10** — [Öneri tekrarları ve önizleme eksikleri](issues/10-todo.md)
- [x] **P2 / 11** — [Öneri patch ve karar kuralları yetersiz](issues/11-todo.md)
- [x] **P2 / 12** — [Zaman modeli sıfır süreyi ve geçersiz tarihleri kabul ediyor](issues/12-todo.md)
- [x] **P2 / 13** — [Takvim yerel gün ve çok günlük etkinlikleri yanlış gösteriyor](issues/13-todo.md)
- [x] **P2 / 14** — [Kayıt formu sonrası hata yetim profil bırakabiliyor](issues/14-todo.md)
- [x] **P2 / 15** — [Katılım isteği tekrar gönderme ve modal güncelliği eksik](issues/15-todo.md)
- [ ] **P2 / 16** — [Gezi ve harcama düzenleme arayüzleri eksik](issues/16-todo.md)
- [ ] **P2 / 17** — [Mobil takvim ve hata kurtarma kabul kriterleri eksik](issues/17-todo.md)
- [ ] **P2 / 18** — [Test kapsamı kritik iş akışlarını doğrulamıyor](issues/18-todo.md)

## Önerilen uygulama sırası

1. 01–02: Public veri sınırı ve projeksiyon tutarlılığı.
2. 03–09: Formlar, drag, katılım ve eşzamanlı veri yazımı. 18 numaralı test işi bu düzeltmelerle birlikte yürütülmeli.
3. 10–15: Öneriler, zaman modeli, kayıt kurtarma ve katılım istekleri.
4. 16–17: Düzenleme ekranları, mobil ve erişilebilirlik.

## Karar gerektiren noktalar

- Reddedilen katılım isteği yeniden gönderilebilir mi? (15)
- Profil düzenlemede hangi alanlar değiştirilebilir? (16)
- Eski public kayıtlar için backfill ve public Gezi projeksiyonu geçişi nasıl yayınlanacak? (01–02)

## Önceki tamamlanma beyanlarıyla fark

interactive-calendar.md durumunda “uygulandı” yazmasına rağmen atomik ayrılma garantisi, öneri karşılaştırma ekranı, mobil uzun basma ve hedefli E2E gibi kabul kriterleri henüz tam karşılanmıyor. Dokümanın tamamlanma durumu düzeltmeler sırasında kriter bazında güncellenmeli.
