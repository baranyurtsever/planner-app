# 03 — Kişisel bilgi formları ana Plan Öğesi formunu tetikliyor

Status: needs-triage
Priority: P1
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

PlanParticipationSection ana formun içinde birden fazla form render ediyor. İç submit olayları üst forma yayılıyor; type belirtilmeyen katıl/ayrıl/onay/sil düğmeleri de ana formu submit edebilir. Kişisel not kaydı ortak kart kaydı veya önerisiyle karışabilir.

## Kod referansları

- `src/features/itinerary/components/PlanItemEditor.jsx:124`
- `src/features/itinerary/components/PlanParticipationSection.jsx:113`

## Yapılacaklar ve kabul kriteri

- [ ] Formları kardeş yapılara ayır; tüm eylem düğmelerinin tipini açıkça belirt. Kişisel not, harcama ve katılım işlemlerinin savePlanItem çağırmadığını etkileşim testiyle doğrula.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

