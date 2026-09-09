/* ============================================================
   SARAPAN KITA — FILE DATA (EDIT DI SINI)
   ------------------------------------------------------------
   Semua isi website (menu, harga, foto, promo, nomor HP, dll)
   diatur dari file ini. Kamu TIDAK perlu menyentuh file lain
   untuk mengubah konten. Ikuti komentar di setiap bagian.

   CARA GANTI FOTO:
   - Taruh file foto di folder /assets (contoh: assets/roti-john-original.jpg)
   - Lalu isi field "image" dengan path itu, misalnya:
     image: "assets/roti-john-original.jpg"
   - Kalau field "image" dibiarkan kosong (""), website akan
     menampilkan ikon emoji bawaan supaya tetap rapi.
   ============================================================ */

const CONFIG = {

  /* ============ 1. IDENTITAS BRAND ============ */
  brand: {
    name: "Sarapan Kita",
    tagline: "Sarapan simple, tidak ribet.",
    // Logo: kosongkan "" untuk pakai logo teks bawaan (bisa diedit lewat CSS),
    // atau isi path gambar, contoh: "assets/logo.png"
    logoImage: "assets/logokingjohn.png",
    // Warna aksen kalau logoImage kosong (logo teks otomatis)
    logoInitial: "SK"
  },

  /* ============ 2. KONTAK & CHECKOUT ============ */
  contact: {
    // Nomor WhatsApp tujuan checkout, format 62xxxxxxxxxx (TANPA + atau 0 di depan)
    whatsapp: "6285157188619",
    // Nomor ini yang tampil di layar (boleh format biasa)
    phoneDisplay: "6285157188619",
    instagram: "@sarapankita.id"
  },

  /* ============ 3. ALAMAT OUTLET + GOOGLE MAPS ============ */
  outlet: {
    name: "King John - Outlet Pusat",
    address: "Jl. antara raya, harapan jaya, bekasi utara",
    // Cara ambil link embed Google Maps ada di README.md bagian "Ganti Lokasi Google Maps"
    mapsEmbedUrl:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d589.6043738644828!2d106.98233657974562!3d-6.214887158557361!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698d001be74ca5%3A0xcba453d766dabdee!2sKing%20John%20(Roti%20John)!5e0!3m2!1sid!2sid!4v1788888504368!5m2!1sid!2sid",
    mapsLinkUrl: "https://maps.app.goo.gl/hMEGxeAjh6hMqwT67",
    jamBuka: "16.00 - 22.00 WIB (Setiap Hari)"
  },

  /* ============ 4. HALAL ============ */
  halal: {
    aktif: true,
    nomorSertifikat: "ID32110067560380526", // ganti dengan nomor sertifikat halal asli
    // Ganti dengan file logo halal resmi MUI/BPJPH kamu di /assets, contoh: "assets/logo-halal.png"
    logoImage: "assets/halal.png"
  },

  /* ============ 5. ONGKIR GRATIS (BERSYARAT) ============ */
  freeOngkir: {
    aktif: true,
    minBelanja: 30000, // gratis ongkir jika total belanja >= angka ini
    area: [
      "harapan jaya bekasi utara"
    ],
    catatan: "Gratis ongkir berlaku untuk area di atas dengan minimal belanja Rp 30.000. Di luar area, ongkir menyesuaikan jarak (dikonfirmasi via WhatsApp).",
    // Perkiraan ongkir kalau area TIDAK termasuk di daftar "area" di atas (hanya estimasi awal)
    estimasiOngkirLuarArea: 9000
  },

  /* ============ 6. PEMBAYARAN ============ */
  pembayaran: {
    qrisAktif: true,
    // Taruh gambar QRIS asli kamu di /assets lalu isi path-nya di sini
    qrisImage: "assets/qris.png",
    cashAktif: true,
    catatan: "Untuk QRIS, lakukan pembayaran lalu kirim bukti transfer melalui chat WhatsApp saat checkout."
  },

  /* ============ 7. PROMO & VOUCHER ============ */
  promo: [
    {
      title: "Promo Sarapan Pagi",
      desc: "Diskon 10% untuk pemesanan sebelum jam 07.00 pagi.",
      image: "",
      kodeVoucher: "PAGI10"
    },
    {
      title: "Beli 5 Gorengan Gratis 1",
      desc: "Khusus pembelian pisang molen, ubi goreng, dan pastel.",
      image: "",
      kodeVoucher: "GORENG21"
    }
  ],

  /* ============ 8. UKURAN ROTI JOHN / BAGHDAD (bisa diedit) ============
     Ini cuma daftar LABEL ukuran (dipakai untuk semua produk).
     Harga tiap ukuran diatur PER MENU di bagian "hargaUkuran"
     pada masing-masing item menu di bawah (No. 12) — jadi tiap
     menu boleh punya harga M/L/XL yang beda-beda, persis seperti
     tabel Excel kamu.
  ============================================================= */
  ukuran: [
    { id: "M", label: "Medium (M) 15 cm" },
    { id: "L", label: "Large (L) 20 cm" },
    { id: "XL", label: "Xtra Large (XL) 30 cm" }
  ],

  /* ============ 9. ISIAN / TOPPING (checklist "tidak pakai ...") ============ */
  isianBisaDihilangkan: [
    { id: "telur", label: "Telur" },
    { id: "sayur", label: "Sayur (kubis & selada)" },
    { id: "ayam", label: "Daging ayam" },
    { id: "sapi", label: "Daging sapi" }
  ],

  /* ============ 10. LEVEL PEDAS ============ */
  levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Extra"],

  /* ============ 11. MENU ADD-ON (bisa diedit) ============
     Ada 3 jenis add-on, atur lewat field "tipe":

     1) tipe: "flat"   -> harga sama berapa pun ukurannya, tinggal centang.
        Contoh: { id:"mayo", nama:"Extra Mayonaise", tipe:"flat", harga:2000 }

     2) tipe: "ukuran" -> harga beda tiap ukuran M/L/XL, tinggal centang,
        harga otomatis menyesuaikan ukuran yang dipilih customer.
        Contoh: { id:"keju", nama:"Extra Keju", tipe:"ukuran",
                  hargaUkuran:{ M:3000, L:4000, XL:5000 } }

     3) tipe: "pcs"    -> harga per satuan/pcs, customer pilih jumlahnya
        pakai tombol tambah/kurang (misalnya "1 pcs = Rp3.000").
        Contoh: { id:"xtratelur", nama:"Extra Telur", tipe:"pcs",
                  hargaPerPcs:3000, satuan:"butir" }
  ================================================================= */
  addOn: [
    { id: "keju", nama: "Extra Keju", tipe: "ukuran", hargaUkuran: { M: 3000, L: 4000, XL: 5000 } },
    { id: "xtratelur", nama: "Extra Telur", tipe: "pcs", hargaPerPcs: 3000, satuan: "butir" },
    { id: "sosis", nama: "Extra Sosis", tipe: "flat", harga: 6000 },
    { id: "sausking", nama: "Extra Saus King John", tipe: "flat", harga: 3000 },
    { id: "mayo", nama: "Extra Mayonaise", tipe: "flat", harga: 2000 }
  ],

  /* ============ 12. DAFTAR MENU ============
     kategori tersedia: "roti-john", "roti-baghdad", "gorengan"
     untuk roti-john / roti-baghdad -> pakai "punyaUkuran: true"
     untuk gorengan -> pakai "punyaUkuran: false"
  ============================================= */
  menu: [
    {
      id: "lite-john",
      kategori: "roti-john",
      nama: "Lite John",
      deskripsi: "Telur & sayur (kubis dan selada), pas untuk sarapan ringan.",
      image: "",
      emoji: "🥖",
      punyaUkuran: true,
      // Harga per ukuran, isi sendiri-sendiri seperti tabel Excel kamu
      hargaUkuran: { M: 13000, L: 16000, XL: 22000 },
      pilihDaging: false,
      // isianTersedia = daftar isian yang BENERAN ada di menu ini, supaya
      // opsi "tidak pakai ..." yang muncul cuma yang relevan (tidak perlu
      // isi field ini kalau mau tampilkan semua opsi standar).
      isianTersedia: ["telur", "sayur"],
      addOnTersedia: ["keju", "xtratelur", "sausking", "mayo"]
    },
    {
      id: "max-john",
      kategori: "roti-john",
      nama: "Max John",
      deskripsi: "Telur, sayur, dan daging ayam kari, saus khas King John, mayonaise, dan saus sambal.",
      image: "",
      emoji: "🥖",
      punyaUkuran: true,
      hargaUkuran: { M: 19000, L: 24000, XL: 29000 },
      pilihDaging: false,
      isianTersedia: ["telur", "sayur", "ayam"],
      addOnTersedia: ["keju", "xtratelur", "sausking", "mayo"]
    },
    {
      id: "chicken-bbq-john",
      kategori: "roti-john",
      nama: "Chicken BBQ John",
      deskripsi: "Telur, sayur, dan daging ayam disiram saus BBQ.",
      image: "",
      emoji: "🥖",
      punyaUkuran: true,
      hargaUkuran: { M: 20000, L: 25000, XL: 30000 },
      pilihDaging: false,
      isianTersedia: ["telur", "sayur", "ayam"],
      addOnTersedia: ["keju", "xtratelur", "sausking", "mayo"]
    },
    {
      id: "beef-bbq-john",
      kategori: "roti-john",
      nama: "Beef BBQ John",
      deskripsi: "Telur, sayur, dan potongan beef slice disiram saus BBQ.",
      image: "",
      emoji: "🥖",
      punyaUkuran: true,
      hargaUkuran: { M: 24000, L: 28000, XL: 37000 },
      pilihDaging: false,
      isianTersedia: ["telur", "sayur", "sapi"],
      addOnTersedia: ["keju", "xtratelur", "sausking", "mayo"]
    },
    {
      id: "roti-baghdad",
      kategori: "roti-baghdad",
      nama: "Roti Baghdad Kari Ayam",
      deskripsi: "Roti isian daging ayam kari dengan bumbu kari impor malaysia dibungkus kulit lumpia lalu digoreng.",
      image: "",
      emoji: "🫓",
      punyaUkuran: false,
      hargaDasar: 12000,
      pilihDaging: true,
      addOnTersedia: []
    },
    {
      id: "gorengan-pisang-molen",
      kategori: "gorengan",
      nama: "Pisang Molen",
      deskripsi: "Pisang manis dibalut kulit lumpia renyah, digoreng hingga golden crispy. Isi 5 pcs.",
      image: "molenpisang.png",
      emoji: "",
      hargaDasar: 15000,
      punyaUkuran: false,
      pilihDaging: false,
      addOnTersedia: []
    },
    {
      id: "gorengan-molen ubi-goreng",
      kategori: "gorengan",
      nama: "molen Ubi Goreng",
      deskripsi: "molen Ubi jalar pilihan, digoreng golden brown ubi dalam lembut. Isi 5 pcs.",
      image: "",
      emoji: "🍠",
      hargaDasar: 10000,
      punyaUkuran: false,
      pilihDaging: false,
      addOnTersedia: []
    },
    {
      id: "gorengan-pastel",
      kategori: "gorengan",
      nama: "Pastel Isi Sayur & Telur",
      deskripsi: "Kulit pastel renyah dengan isian sayur, bihun, dan telur. Isi 5 pcs.",
      image: "pastel.png",
      emoji: "🥟",
      hargaDasar: 11000,
      punyaUkuran: false,
      pilihDaging: false,
      addOnTersedia: []
    }
  ],

  /* Pilihan daging untuk item yang "pilihDaging: true" */
  pilihanDaging: ["Daging Ayam", "Daging Sapi", "Ayam & Sapi (Mix)"]
};
