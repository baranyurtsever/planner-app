# Peregrin ürün yol haritası — Dalga 1

Status: ready-for-agent

## Amaç

Rakip araştırmasındaki kısa vadeli fırsatları Peregrin'in grup kararı, katılım ve görünürlük modelini koruyarak teslim etmek. Her özellik ayrı bir dikey dilim, yerel ticket ve doğrulama kapsamıyla ilerler.

## Uygulama sırası

- [ ] [01 — Gezi daveti ve bekleyen davetler](issues/01-trip-invitations.md)
- [ ] [02 — Plan Öğesi belgeleri ve rezervasyon bilgileri](issues/02-plan-documents.md)
- [ ] [03 — Bugün ve sıradaki görünümü](issues/03-today-view.md)
- [ ] [04 — ICS takvim dışa aktarma](issues/04-calendar-export.md)
- [ ] [05 — Gezi ve Plan Öğesi çoğaltma](issues/05-duplication.md)
- [ ] [06 — Mobil PWA kabuğu ve çevrimdışı temel erişim](issues/06-mobile-pwa.md)

## Ortak sınırlar

- Firestore kuralları yetkilendirmenin esas kaynağıdır.
- Kişisel veri ve katılımcı kimliği herkese açık projeksiyonlara taşınmaz.
- Yeni mobil yüzeyler mevcut responsive web uygulamasını temel alır; ayrı ürün mantığı oluşturmaz.
- Her dilimde unit/component, Firestore Emulator ve gerekli olduğunda E2E doğrulaması yapılır.
