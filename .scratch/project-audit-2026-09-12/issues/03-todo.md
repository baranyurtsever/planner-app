# 03 — Kişisel bilgi formları ana Plan Öğesi formunu tetikliyor

Status: resolved
Priority: P1
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

PlanParticipationSection ana formun içinde birden fazla form render ediyor. İç submit olayları üst forma yayılıyor; type belirtilmeyen katıl/ayrıl/onay/sil düğmeleri de ana formu submit edebilir. Kişisel not kaydı ortak kart kaydı veya önerisiyle karışabilir.

## Kod referansları

- `src/features/itinerary/components/PlanItemEditor.jsx:124`
- `src/features/itinerary/components/PlanParticipationSection.jsx:113`

## Yapılacaklar ve kabul kriteri

- [x] Formları kardeş yapılara ayır; tüm eylem düğmelerinin tipini açıkça belirt. Kişisel not, harcama ve katılım işlemlerinin savePlanItem çağırmadığını etkileşim testiyle doğrula.

## Answer

Plan Öğesi ana formu ile katılım, kişisel bilgi ve harcama formları kardeş DOM yapıları haline getirildi. Ana Kaydet düğmesi `form` kimliğiyle yalnız ana forma bağlı; bölümdeki tüm eylem düğmelerinin `button`/`submit` tipi açıkça tanımlandı. Etkileşim testleri kişisel not kaydı, karta harcama ekleme ve katılım isteğinin `savePlanItem` çağırmadığını doğruluyor.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.
2026-09-12: İç içe form kaldırıldı; üç kritik alt işlem için regresyon testi eklendi. 38 uygulama testi, lint ve build geçti.
