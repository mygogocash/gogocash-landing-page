import { SITE_FACTS } from "@/lib/site-facts";
import type { LocaleHomeCopy } from "@/lib/locale-home-copy";

/** Indonesian landing-page copy. Keep claims aligned with `SITE_FACTS`. */
export const ID_HOME = {
  documentLang: "id",
  partnerLogoAltTemplate: "{name} mitra cashback GoGoCash",
  langNavEnglish: "English site",
  langNavLocal: "Bahasa Indonesia",
  breadcrumbNavAria: "Pilih bahasa",

  hero: {
    h1: "Hemat setiap kali belanja",
    sub: "dengan GoGoCash — di brand yang sudah Anda kenal",
    body: `Dapatkan cashback hingga ${SITE_FACTS.maxCashbackLabel} di ${SITE_FACTS.partnerCountLabel} mitra — ${SITE_FACTS.keyMerchantsShort}, dan lainnya di Asia Tenggara. Gratis digunakan, cashback nyata masuk ke dompet Anda.`,
    ctaLaunch: "Mulai dapat cashback",
    ctaLine: "Hubungi lewat LINE",
    lineAria: "Hubungi GoGoCash melalui LINE",
  },

  partners: {
    badge: "Mitra brand",
    title: "Dapat cashback dari brand langganan Anda",
    description: `Temukan ${SITE_FACTS.partnerCountLabel} mitra di ${SITE_FACTS.regionLabel}. Buka brand dari GoGoCash sebelum checkout agar kunjungan terlacak dan cashback dapat dikonfirmasi setelah merchant memvalidasi pesanan.`,
    searchLabel: "Cari brand",
    searchPlaceholder: "Ketik nama brand atau kategori…",
    searchClear: "Hapus",
    noResults: "Brand tidak ditemukan. Coba kata kunci lain.",
    brandsCountAll: "{count} brand",
    brandsCountFiltered: "Menampilkan {filtered} dari {total} brand",
    loadMore: "Lihat brand lainnya",
  },

  why: {
    badge: "Mengapa GoGoCash",
    title: "Dibuat untuk belanja sehari-hari di Asia Tenggara",
    subtitle:
      "Tarif yang jelas, brand tepercaya, dan cashback yang benar-benar bisa ditarik — lewat web atau mini app.",
    cards: [
      {
        title: "Cashback nyata, bukan poin membingungkan",
        body: "Lihat saldo bertambah setelah merchant mengonfirmasi pesanan dan tarik saat mencapai batas minimum.",
      },
      {
        title: "Brand yang Anda percaya",
        body: `Belanja di ${SITE_FACTS.partnerCountLabel} mitra SEA dan lihat tarif sebelum membayar.`,
      },
      {
        title: "Quest yang relevan",
        body: "Selesaikan tantangan belanja dan promo musiman untuk bonus tambahan.",
      },
      {
        title: "Bantuan saat dibutuhkan",
        body: "Tim kami siap membantu masalah pelacakan dan penarikan.",
      },
    ],
  },

  features: {
    badge: "Fitur utama",
    title: "Cara lebih mudah mendapatkan cashback",
    cards: [
      {
        title: "Pantau saldo cashback",
        body: "Cashback masuk setelah pesanan dikonfirmasi. Pantau status dan saldo dengan jelas di aplikasi.",
      },
      {
        title: "Dukungan 24/7",
        body: "Butuh bantuan pelacakan atau penarikan? Hubungi tim melalui chat atau email.",
      },
      {
        title: "Quest personal",
        body: "Buka bonus dan penawaran tambahan lewat tantangan yang sesuai kebiasaan belanja Anda.",
      },
    ],
    ctaCard: {
      title: "Siap mendapatkan cashback?",
      bodyLine: "Dapatkan cashback dengan mudah bersama GoGoCash.",
      cta: "Mulai sekarang",
    },
  },

  howItWorks: {
    title: "Cashback dalam tiga langkah",
    intro:
      "Buka brand dari GoGoCash, belanja seperti biasa, lalu terima cashback setelah merchant mengonfirmasi pesanan.",
    progressCue: "3 langkah menuju cashback pertama",
    browseAppCta: "Lihat semua mitra",
    steps: [
      {
        summary: "Pilih tarif cashback",
        title: "Buka brand dari GoGoCash",
        desc: `Jelajahi ${SITE_FACTS.partnerCountLabel} mitra e-commerce dan perjalanan di ${SITE_FACTS.regionLabel}, bandingkan tarif, lalu buka merchant melalui GoGoCash agar kunjungan terlacak.`,
        bullets: [
          "Shopee, Lazada, Agoda, AliExpress, Trip.com, dan lainnya",
          "Lihat tarif sebelum berbelanja",
        ],
      },
      {
        summary: "Checkout seperti biasa",
        title: "Belanja dan bayar di merchant",
        desc: "Masukkan produk ke keranjang dan checkout di situs atau aplikasi merchant seperti biasa. Tidak perlu kode khusus.",
        bullets: [
          "Gunakan akun dan metode pembayaran Anda",
          "GoGoCash melacak pembelian di latar belakang",
        ],
      },
      {
        summary: "Saldo bertambah",
        title: "Cashback masuk setelah dikonfirmasi",
        desc: "Setelah merchant mengonfirmasi pesanan, cashback masuk ke dompet GoGoCash. Tarik ke rekening atau e-wallet setelah mencapai minimum.",
        bullets: [
          "Sebagian besar pesanan dikonfirmasi dalam beberapa hari",
          "Pantau status dan saldo di aplikasi",
        ],
      },
    ],
  },

  download: {
    badge: "Buka aplikasi",
    title: "Gunakan GoGoCash dengan cara yang Anda suka",
    desc: "Pilih Telegram Mini App, LINE Mini App, atau web — cashback dan saldo Anda tetap sama.",
    bullets: ["Lihat promo dan quest kapan saja", "Dapatkan pembaruan tarif"],
    scanLabel: "Pindai untuk membuka",
    qrCaptionBefore: "Buka",
    qrCaptionLink: "GoGoCash LINE Mini App",
    qrCaptionAfter: " — atau gunakan Telegram / web",
    telegram: "Telegram Mini App",
    line: "LINE Mini App",
    web: "Buka web app",
    qrAria: "Buka GoGoCash LINE Mini App dengan kode QR",
    qrAlt: "Kode QR untuk membuka GoGoCash LINE Mini App",
  },

  learn: {
    badge: "Pelajari",
    title: "Panduan cashback yang mudah dipahami",
    readMore: "Baca selengkapnya",
    teasers: [
      {
        title: "Cara cashback dilacak",
        desc: "Dari klik hingga konfirmasi merchant",
        href: "/learn/how-cashback-works",
      },
      {
        title: "Cara menarik cashback",
        desc: "Minimum, waktu proses, dan saldo terkonfirmasi",
        href: "/learn/withdraw-cashback-gogocash",
      },
      {
        title: "Cashback belum terlacak?",
        desc: "Checklist cepat sebelum menghubungi dukungan",
        href: "/learn/cashback-not-tracking-fixes",
      },
    ],
  },

  community: {
    badge: "Komunitas",
    title: "Bergabung dengan komunitas GoGoCash",
    desc: "Temukan tips, promo, dan bantuan dari tim serta sesama pengguna melalui kanal pilihan Anda.",
  },

  faq: {
    badge: "FAQ",
    title: "Pertanyaan umum tentang GoGoCash",
    subtitleEnHint:
      "Panduan tambahan tersedia dalam bahasa Inggris di pusat Learn.",
  },

  finalCta: {
    title: "Siap mendapatkan cashback dari setiap belanja?",
    sub: "Ubah belanja sehari-hari menjadi cashback yang bisa ditarik.",
    cta: "Mulai dapat cashback",
  },
} satisfies LocaleHomeCopy;
