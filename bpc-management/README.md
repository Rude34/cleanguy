# BPC Operasyon Merkezi — Neon / PostgreSQL

Arayüz mevcut Next.js/Vercel sitesinin `/bpc-management/` yolunda çalışır. API `/api/bpc` yolundadır. Kullanıcılar, teslimatlar, vardiyalar, masa personeli, bekleme sırası ve denetim günlüğü PostgreSQL tablolarında tutulur. Çalışan uygulama Blob'a veya yerel JSON dosyasına erişmez.

## 1. Neon'da ücretsiz veritabanı oluştur

1. https://console.neon.tech üzerinden hesap aç ve **Free** planında bir proje oluştur. Bölgeyi Vercel Function bölgesine yakın seç.
2. **Connect** ekranından üretim branch'i ve veritabanını seç. **Connection pooling** açıkken PostgreSQL bağlantı adresini kopyala (host adında genellikle `-pooler` bulunur). Bağlantı adresi parola içerir; sohbetlere veya Git'e koyma.
3. Neon **SQL Editor**'de aynı branch ve veritabanını seç. Depo kökündeki [`db/bpc-schema.sql`](../db/bpc-schema.sql) dosyasının tamamını çalıştır. Tablolar `bpc_` önekiyle oluşturulur. Dosya tekrar çalıştırılabilir; mevcut kayıtları silmez.

Şema build sırasında otomatik uygulanmaz. Yanlış branch'e veri yazılmaması için bu adım açıkça yapılır. `bpc_state` içindeki tek satır, kısa yazma transaction'larını farklı Vercel Function örnekleri arasında sıraya koyar. BPC kaydı ve denetim günlüğü birlikte commit/rollback edilir. `(operator_id, idempotency_key)` unique kısıtı aynı gönderimin ikinci kez kaydolmasını engeller.

## 2. Vercel ortam değişkenlerini ayarla

Mevcut `cleanguy` projesinde **Settings → Environment Variables** bölümüne aşağıdakileri **Production** için ekle:

| Ad | Değer |
| --- | --- |
| `DATABASE_URL` | Neon üretim branch'inin pooled bağlantı adresi |
| `BPC_SESSION_SECRET` | Uzun, rastgele oturum imzalama değeri; mevcut değeri koruyabilirsin |
| `BPC_SETUP_KEY` | İlk yönetici hesabını oluşturmak için ayrı, uzun rastgele değer |

İki farklı gizli değer üretmek için aşağıdaki komutu iki kez çalıştırabilirsin:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Bu değişkenler sunucuya aittir. `VITE_` veya `NEXT_PUBLIC_` öneki ekleme. BPC artık `BLOB_STORE_ID`, `BLOB_READ_WRITE_TOKEN` veya OIDC ayarı kullanmaz. `DATABASE_URL` yoksa Blob'a geri dönmez; açıklayıcı bir kurulum hatası döndürür.

Preview ve yerel geliştirme için **ayrı Neon branch'i** oluştur ve onun bağlantısını kullan. Preview deployment'larını üretim veritabanına bağlama. Ortam değişkenlerini güncelledikten sonra yeni bir deployment gerekir.

## 3. Eski Blob kayıtları varsa önce aktar

Mevcut Blob verisi otomatik alınmaz. Kota nedeniyle Blob kapalıysa Neon'a geçmek o dosyanın kilidini açmaz. Mevcut kullanıcıların ve kayıtların korunması için Blob erişimi açıldığında `bpc-management/data.json` dosyasını indir.

1. JSON yedeğini depo kökündeki `.data/bpc.json` dosyasına koy. `.data/` Git dışında tutulur. Yedek parola özetlerini de içerdiği için paylaşma.
2. Üretim hedefine aktarım yaparken eski uygulamadaki veri girişlerini durdur; yedek alındıktan sonra eski depoya yazılan kayıtlar bu aktarıma girmez.
3. Proje kökünde `.env.local` dosyasına **aktarımı yapacağın hedef** için `DATABASE_URL` ekle.
4. Paketleri kurduktan sonra çalıştır:

   ```powershell
   npm run db:setup
   npm run db:import -- .data/bpc.json
   ```

Aktarım tek transaction'dır. Hata olursa tamamı geri alınır. Araç yalnızca **boş BPC tablolarına** aktarır; var olan kayıtları birleştirmez veya silmez. Boş hedefe aktarmadan önce web arayüzünden yeni yönetici oluşturma. Hesap kimlikleri, `scrypt` parola özetleri, eski vardiya kimlikleri, BPC kayıtları, sıra ve denetim günlüğü korunur. Aktarım sonrası eski kullanıcı adı/parolalarla giriş yapılabilir.

Aktarım yapılmadan boş bir veritabanıyla ilk yönetici hesabını oluşturursan yeni bir veri setiyle başlarsın; Blob'daki hesaplar orada otomatik görünmez. Sonradan eski verileri aktarmak için ayrı boş branch ve planlı geçiş gerekir.

## 4. Deploy et ve ilk girişi yap

1. Kod değişikliklerini gözden geçirip GitHub'a gönder. Vercel'de Root Directory depo kökü, build komutu `npm run build` olarak kalsın.
2. Production deployment **Ready** olduğunda `/bpc-management/` adresini aç.
3. Yedeği aktardıysan eski hesabınla giriş yap. Veritabanı boşsa ilk yönetici ekranı açılır; en az 12 karakterlik parola ve Vercel'de tanımladığın `BPC_SETUP_KEY` ile hesabını oluştur.
4. Yönetici panelinden operatör ekle. Bir BPC kaydı oluştur, sayfayı yenile ve kaydın korunduğunu kontrol et. İki hesapla sıra ve vardiya akışını da kontrol et.
5. Eski Blob deposunu yeni sistem ve aktarılmış kayıtlar doğrulanana kadar koru.

## Yerelde geliştirme

Node.js 20.19+ veya 22.12+ gerekir. Proje kökündeki `.env.example` dosyasını `.env.local` olarak kopyalayıp geliştirme branch'inin `DATABASE_URL` değerini ekle.

```powershell
npm install
npm run db:setup
npm run dev
```

`http://localhost:3000/bpc-management/` adresini aç. Vite arayüzü ve Next.js API birlikte başlar. Yerelde ilk yönetici için setup anahtarı zorunlu değildir; üretimde zorunludur. Yerel JSON fallback'i yoktur.

## Kullanım ve yenileme

- Diğer kullanıcıların değişiklikleri etkileşim devam ederken 30 saniyede bir kontrol edilir. Kendi işleminden sonra ekran hemen yenilenir.
- Gizli sekmede, internet yokken veya iki dakika etkileşim olmayınca otomatik sorgular durur. Sayfaya geri gelince/yeniden etkileşimde güncellenir. Hatalarda bekleme 120 saniyeye kadar artar ve aynı polling döngüsünde istekler üst üste binmez.
- Bu davranış Neon'un kullanılmadığında uykuya geçebilmesine yardımcı olur. Aktif kullanıcılar sorgu göndermeye devam ederken compute tüketimi sürer. Ücretsiz planın kullanım ekranını takip et; ücretsiz kullanım sınırsız değildir.
- Kimlik kontrolü tek kullanıcı satırını okur; operasyon ekranı parola özetleri olmadan verileri tek SQL snapshot'ında alır. Ekran mevcut geçmiş vardiya ve tarih filtrelerini korumak için kayıt geçmişini de getirir; kayıt hacmi büyüdüğünde sunucu tarafında tarih/vardiya filtrelemesi ve sayfalama eklenmelidir.
- Şifreler `scrypt` ile özetlenir. Oturum HttpOnly / SameSite=Strict çerezindedir. Şifre yenileme ve hesap devre dışı bırakma eski oturumların erişimini keser.

## Kontroller

```powershell
npm run test:bpc
npm run build
```

`test:bpc`, gerçek Neon hesabına veya ortam değişkenlerine bağlanmadan PGlite PostgreSQL motoruyla şemayı, tekrar gönderimleri, rollback'i, yetkileri, vardiyaları ve JSON aktarımını kontrol eder. Çoklu Neon bağlantılarındaki davranış ve gerçek deployment bağlantısı ayrıca canlı ortamda doğrulanmalıdır.

Resmi kaynaklar: [Neon bağlantısı](https://neon.com/docs/connect/connect-from-any-app), [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver), [Vercel entegrasyonu](https://neon.com/docs/guides/vercel-overview), [güncel plan sınırları](https://neon.com/pricing).
