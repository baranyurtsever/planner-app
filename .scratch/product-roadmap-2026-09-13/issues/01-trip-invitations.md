# 01 — Gezi daveti ve bekleyen davetler

Type: task
Status: ready-for-agent

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
