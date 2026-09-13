# 01 — Gezi daveti ve bekleyen davetler

Type: task
Status: resolved

## Amaç

Gezi Sahibinin kullanıcı adıyla rol belirterek davet göndermesi; davet edilenin kabul veya ret vermesi; üyeliğin yalnız kabul sonrası oluşması.

## Kabul kriterleri

- Bekleyen davet Gezi erişimi sağlamaz.
- Yalnız Gezi Sahibi davet gönderebilir veya iptal edebilir.
- Davet edilen yalnız kendi davetini kabul ya da reddedebilir.
- Kabul, rol ve üyeliği atomik biçimde oluşturur.
- Yinelenen bekleyen davet oluşturulmaz.
- UI, repository ve Firestore kural testleri geçer.

## Comments

- Gezi Sahibi kullanıcı adı ve rol ile davet gönderebilir; mevcut üyelerin rolü ayrıca doğrudan değiştirilebilir.
- Davetler Kişiler ekranında kabul veya ret bekler. Kabul işlemi davet durumu ile Gezi üyeliğini aynı batch içinde günceller.
- Bekleyen davetler Gezi Detayları ekranında görünür ve Gezi Sahibi tarafından iptal edilebilir.
- Doğrulama: lint, 73 Vitest testi, 36 Firestore kural testi, 2 Playwright E2E senaryosu ve production build geçti.
