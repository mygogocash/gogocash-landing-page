import { SITE_FACTS } from "@/lib/site-facts";

export type IndonesianFaqEntry = { question: string; answer: string };

export const INDONESIAN_FAQ_ITEMS: IndonesianFaqEntry[] = [
  {
    question: "Bagaimana cara kerja cashback GoGoCash?",
    answer:
      "Buka merchant melalui GoGoCash, lalu belanja dan checkout seperti biasa. Setelah merchant mengonfirmasi pesanan, cashback akan masuk ke dompet GoGoCash Anda.",
  },
  {
    question: "Berapa lama cashback dikonfirmasi?",
    answer:
      "Sebagian besar pesanan dikonfirmasi dalam beberapa hari kerja, tetapi promo besar dan pemesanan perjalanan dapat memerlukan waktu lebih lama.",
  },
  {
    question: "Bagaimana cara menarik saldo?",
    answer:
      "Setelah saldo terkonfirmasi mencapai minimum yang ditampilkan di aplikasi, Anda dapat meminta penarikan ke rekening bank atau e-wallet yang didukung.",
  },
  {
    question: "Apakah GoGoCash gratis?",
    answer:
      "Ya. GoGoCash tidak mengenakan biaya keanggotaan. Mulai perjalanan belanja dari GoGoCash untuk memenuhi syarat mendapatkan cashback.",
  },
  {
    question: "Brand apa saja yang tersedia?",
    answer: `GoGoCash bekerja sama dengan ${SITE_FACTS.partnerCountLabel} mitra di Asia Tenggara, termasuk Shopee, Lazada, Agoda, dan banyak brand lainnya.`,
  },
  {
    question: "Apa yang harus dilakukan jika cashback tidak terlacak?",
    answer:
      "Pastikan Anda membuka merchant dari GoGoCash, mengizinkan cookie, dan menyelesaikan checkout tanpa berpindah perangkat. Jika masih bermasalah, hubungi dukungan dengan nomor pesanan dan bukti pembayaran.",
  },
];
