# 01 — Public Gezi belgesi katılımcı kimliklerini açığa çıkarıyor

Status: needs-triage
Priority: P1
Type: task
Evidence: Kod incelemesi; özel senaryo henüz ayrı testle çalıştırılmadı.

## Bulgu

Public Gezi okuması tüm belgeyi döndürüyor; memberIds/memberRoles dışarıya açık. Profil belgeleri de herkese okunabilir olduğu için kimlikler adlarla eşleştirilebilir. publicPlanItems projeksiyonu bu üst-belge sızıntısını kapatmıyor.

## Kod referansları

- `firestore.rules:188`
- `src/features/profile/data/profileRepository.js:27`

## Yapılacaklar ve kabul kriteri

- [ ] Public Gezi için katılımcı kimlikleri içermeyen projeksiyon oluştur; anonim istemcinin asıl üyelik belgesini okuyamadığını emülatörde doğrula.

## Comments

2026-09-12: Genel proje taramasında kaydedildi. Bu ticket uygulama değişikliği içermez.

