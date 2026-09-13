# 02 — Plan Öğesi belgeleri ve rezervasyon bilgileri

Type: task
Status: resolved

## Amaç

Bilet, QR, PDF, bağlantı ve rezervasyon numarasını ilgili Plan Öğesine bağlamak; sahiplik ve görünürlüğü rolden ayrı korumak.

## Kabul kriterleri

- Ekler varsayılan olarak yalnız sahibine görünür.
- Açıkça seçilen ekler Gezi katılımcılarıyla paylaşılabilir.
- Profil Ziyaretçisine kişisel belge veya rezervasyon numarası açılmaz.

## Comments

- Plan Öğesi içinden bilet, rezervasyon, QR, PDF ve bağlantı kaydı eklenebilir; bağlantı veya rezervasyon numarasından en az biri gerekir.
- Her Plan Belgesi onu ekleyen kullanıcıya aittir. Yalnız sahibi düzenleyebilir/silebilir; Gezi rolü bu sahipliği değiştirmez.
- Varsayılan görünürlük `Yalnızca ben`; kullanıcı isterse yalnız Gezi katılımcılarıyla paylaşabilir.
- Profil Ziyaretçisi erişimi hem veri modeli hem Firestore kuralları tarafından engellenir; herkese açık plan projeksiyonuna belge alanı eklenmez.
- Doğrulama: component, Firestore Emulator, gerçek tarayıcı E2E ve production build.
