export type Tool = {
  slug: string;
  title: string;
  desc: string;
  tag: string;
  content: string;
};

const tools: Tool[] = [
  {
    slug: "network-reset-checklist",
    title: "Network Reset Checklist",
    desc: "İnternet yok / DNS sorunları için adım adım hızlı kontrol listesi.",
    tag: "Network",
    content: `
1. Modem/router'ı 30 saniye kapatıp açın.
2. Windows'ta "ipconfig /release" ve "ipconfig /renew" komutlarını çalıştırın.
3. DNS önbelleğini temizleyin: "ipconfig /flushdns"
4. TCP/IP stack sıfırlama: "netsh int ip reset"
5. Winsock sıfırlama: "netsh winsock reset"
6. Bilgisayarı yeniden başlatın.
7. Sorun devam ediyorsa DNS adresini manuel olarak 8.8.8.8 (Google) yapın.
    `.trim(),
  },
  {
    slug: "wifi-troubleshooter",
    title: "Wi-Fi Troubleshooter",
    desc: "Semptom seç → sana uygulanabilir adımların sırasını versin.",
    tag: "Wi-Fi",
    content: `
Semptom: Wi-Fi ağa bağlanıyor ama internet yok
→ 1. Router'ı yeniden başlatın.
→ 2. "ipconfig /flushdns" çalıştırın.
→ 3. DNS'i 8.8.8.8 olarak manuel ayarlayın.

Semptom: Wi-Fi ağı hiç görünmüyor
→ 1. Uçak modunu kapatın.
→ 2. Device Manager'dan Wi-Fi adaptörünü disable/enable yapın.
→ 3. Wi-Fi sürücüsünü güncelleyin.

Semptom: Bağlanıyor ama sürekli kopuyor
→ 1. Router'a yaklaşın veya 5GHz yerine 2.4GHz bandını deneyin.
→ 2. Güç tasarrufu ayarlarında Wi-Fi adaptörünü "Always on" yapın.
→ 3. Kanal girişimini kontrol edin.
    `.trim(),
  },
  {
    slug: "system-info-template",
    title: "System Info Template",
    desc: "Destek isterken kopyala-yapıştır yapacağın hazır bilgi şablonu.",
    tag: "Support",
    content: `
--- SİSTEM BİLGİSİ ŞABLONU ---

İşletim Sistemi: Windows __ (örn. Windows 11 Home 23H2)
CPU: 
RAM: 
GPU: 
Depolama (SSD/HDD): 

Sorun Tanımı:
[Sorunu buraya yaz]

Hata Mesajı (varsa):
[Hata mesajını buraya yapıştır]

Ne zaman başladı:
[Tarih / belirli bir güncelleme sonrası mı?]

Denenmiş çözümler:
1.
2.
3.
    `.trim(),
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getAllTools(): Tool[] {
  return tools;
}
