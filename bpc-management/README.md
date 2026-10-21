# BPC Operasyon Merkezi

BPC arayüzü Vite ile derlenir ve var olan Next.js/Vercel projesinin `/bpc-management/` alt yolunda yayınlanır. Giriş, hesap yönetimi ve BPC kayıtları mevcut Next.js sunucusundaki `/api/bpc` rotasından çalışır. Supabase kullanılmaz.

## Yerelde çalıştırma

Gereksinimler: Node.js 20.19+ veya 22.12+ ve npm.

1. Bu workspace için çalışan eski Next.js sunucularını terminallerinde `Ctrl+C` ile durdurun. Port 3000 ve `.next/dev/lock` serbest kalmalı.
2. Depo kökünde çalıştırın:

   ```powershell
   npm install
   npm run dev
   ```

3. `http://localhost:3000/bpc-management/` adresini açın. İlk kullanımda yönetici kullanıcı adı ve en az 12 karakterlik parolanızı siz belirlersiniz; varsayılan hesap veya parola yoktur.
4. Girişten sonra yönetici panelinden operatör hesaplarını oluşturun.

Yerel kayıtlar `.data/bpc.json` dosyasına yazılır ve Git dışında tutulur. Vite’ı tek başına `npm --prefix bpc-management run dev` ile başlatırsanız arayüz `http://127.0.0.1:5173/bpc-management/` adresinde açılır, fakat API için Next.js’in 3000 portunda da çalışması gerekir.

## Mevcut Vercel projesine yayınlama

BPC için ayrı bir statik proje oluşturmayın. Kök `npm run build`, Vite çıktısını `public/bpc-management/` içine üretir ve ardından var olan Next.js sitesini derler. Next.js catch-all route bu alt yolda `index.html` döndürür; sitenin ana sayfası ve diğer mevcut yollar değişmez.

1. Vercel’de mevcut CleanGuy Tech projesini açın. **Storage → Create Store → Blob** üzerinden erişimi **Private** olan bir Blob store oluşturup bu projeye **Production** ortamında bağlayın. Bağlantıda `BLOB_STORE_ID` görünmelidir. Vercel OIDC token’ı deploy derleme ortamında env değişkeni olarak sunabilir; Function çalışırken ise request context’teki `x-vercel-oidc-token` başlığından alınır. Uygulama bunu `@vercel/oidc` helper’ıyla her server isteğinde okur ve `@vercel/blob` çağrısına sunucu tarafında verir. `VERCEL_OIDC_TOKEN` değerini manuel tanımlamayın/kopyalamayın ve `BLOB_WEBHOOK_PUBLIC_KEY` değerini storage token’ı olarak kullanmayın.
2. **Project Settings → Environment Variables** kısmına `BPC_SESSION_SECRET` ve `BPC_SETUP_KEY` adlarında iki ayrı gizli değer ekleyin. Her biri için uzun ve tahmin edilemez değer kullanın. PowerShell ile değer üretme örneği:

   ```powershell
   -join ((1..48) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
   ```

   Her komutu ayrı çalıştırıp bir değerini `BPC_SESSION_SECRET`, diğerini `BPC_SETUP_KEY` için kaydedin. Bunları frontend `VITE_` değişkeni yapmayın.
3. Blob deposunun **Projects** bağlantısında doğru `cleanguy` projesi ile **Production** ortamını seçili doğrulayın. Bağlantıyı değiştirdiyseniz değişiklikten sonra yeni Production deployment oluşturun; eski deployment’a sonradan OIDC bağlamı eklenmez. Ardından `https://cleanguy.tech/bpc-management/` adresini açın. İlk yönetici hesabını ve parolasını seçip `BPC_SETUP_KEY` değerini ilk kurulum anahtarı alanına girin. İlk yönetici oluşturulunca kurulum API’si yeniden hesap oluşturmayı reddeder.
4. Yönetici olarak giriş yapıp üç operatörü oluşturun. Kullanıcı adı ve parolaları doğrudan operatörlere iletin.

## Güvenlik ve veri

- Parolalar Node.js `scrypt` ile tuzlanıp özetlenir; oturum imzalı, HTTP-only ve SameSite çerezindedir.
- Sunucu operatör kimliğini oturumdan alır; istemci kullanıcı kimliği veya zaman damgası gönderemez.
- Operatör sadece teslimat kaydı açar. Hesap ekleme/devre dışı bırakma ve kayıt iptali yalnızca yöneticidedir. İptal sebebi denetim günlüğüne eklenir.
- Masa numarası 7–41, kategori de arayüzdeki sekiz sabit seçenekle doğrulanır.
- Yerelde JSON dosyası kullanılır. Vercel’de veriler private Blob’da kalıcı tutulur; üretimde sunucu dosya sistemine yazma fallback’i yoktur. ETag/412 çakışmasında Blob yeniden okunur ve en güncel ETag ile en fazla 8 kez, jitter’lı exponential backoff kullanılarak koşullu yazma denenir; ETag koşulu kaldırılmaz. Her BPC form gönderimi UUID idempotency key taşır; aynı operatör aynı isteği tekrar gönderirse mevcut kayıt döndürülür, yeni kayıt/audit eklenmez. Retry başarısızlığı ve nedeni sunucu loglarına credential değerleri yazılmadan kaydedilir. Blob nesne depolamadır, işlem veritabanı değildir; bu yaklaşım düşük hacimde çakışmaları yönetir, ancak daha yüksek eşzamanlı yazma veya güçlü transaction garantisi gerektiğinde PostgreSQL’e unique idempotency constraint ve transaction ile geçiş önerilir.
- Diğer oturumların akışı üç saniyede bir yenilenir; bu uygulama WebSocket değil, basit polling kullanır.
- Her rolün gördüğü ortak masa/SKU özetinde 7–41 arasındaki masalar seçilen güne göre SKU toplamı ve kayıt sayısıyla görünür. Masaya dokununca kategori bazında adetler ve operatör hareketleri açılır; veri üç saniyede bir güncellenir.
- `Sıradaki masalar` sekmesi tüm kullanıcılar için ortak olan, en fazla 34 masalık bekleme sırasıdır. Masayı sıraya ekleyin; BPC tamamlanınca tikleyin. Öğe kaldırılır ve kalan sıra numaraları otomatik kayar. Aynı masa sıradayken ikinci kez eklenemez.
- Yönetici panelindeki `Vardiyayı bitir` mevcut kayıtları ve masa personeli atamalarını geçmiş vardiyada saklar ve yeni boş bir aktif vardiya başlatır. Tüm ortacıların aktif operasyon akışı yeni vardiyaya geçer; geçmiş vardiyalar ortak masa görünümünden seçilebilir. Yönetici aktif vardiyada her masa için çalışan personelin adını kaydedebilir.
- Yönetici operatörlerin mevcut parolalarını göremez. `Şifre yenile` yeni bir parola belirler, sunucuda özetler ve önceki oturumları geçersiz kılar.

## Derleme

Depo kökünde `npm run build` hem BPC arayüzünü hem mevcut Next.js sitesini üretir. BPC istemcisini tek başına doğrulamak için `Push-Location bpc-management; npm run build; Pop-Location` çalıştırabilirsiniz.
