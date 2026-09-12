# 16 — Gezi ve harcama düzenleme arayüzleri eksik

Status: needs-triage
Priority: P2
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Gezi detayları ad/konum/görünürlüğü yalnız gösteriyor; yaratıldıktan sonra düzenleme UI yok. Harcama repository updateExpense içerse de bütçede yalnız oluştur/sil var; kullanıcının sonradan görünürlük/tutar değiştirmesi mümkün değil.

## Kod referansları

- `src/features/trips/pages/TripDetailsPage.jsx:38`
- `src/features/expenses/pages/BudgetPage.jsx:1`
- `src/features/profile/pages/AppProfilePage.jsx:1`

## Yapılacaklar ve kabul kriteri

- [ ] Gezi sahipliğiyle uyumlu bilgi düzenleme ve harcama sahibi için tutar/para birimi/görünürlük düzenleme ekle. Kullanıcı profil düzenleme kapsamını ayrıca kararlaştır.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

