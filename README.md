# Sarapan Kita — Website Delivery Order

Website mobile-first untuk bisnis sarapan **Sarapan Kita** (Roti John, Roti Baghdad, gorengan) lengkap dengan menu, keranjang, checkout via WhatsApp, QRIS/cash, invoice, lokasi Google Maps, dan info halal.

Website ini **gratis, statis (HTML/CSS/JS biasa)**, dan bisa langsung dipublikasikan lewat **GitHub Pages** tanpa biaya server maupun database.

```
sarapan-kita/
├── index.html          -> struktur halaman
├── css/style.css        -> tampilan & warna
├── js/data.js            -> SEMUA ISI KONTEN (edit di sini)
├── js/script.js          -> logika website (biasanya tidak perlu diubah)
├── assets/               -> taruh foto menu, logo, QRIS, logo halal di sini
└── README.md             -> panduan ini
```

---

## 1. Cara Mengedit Isi Website

Hampir semua yang bisa diedit ada di **satu file saja**: `js/data.js`.
Buka file itu dengan text editor apa pun (Notepad, VS Code, atau langsung dari GitHub — lihat bagian 4).

| Yang mau diubah | Bagian di `data.js` |
|---|---|
| Nama brand & tagline | `brand` |
| Logo | `brand.logoImage` |
| Nomor WhatsApp checkout | `contact.whatsapp` |
| Alamat outlet & Google Maps | `outlet` |
| Info halal & nomor sertifikat | `halal` |
| Syarat gratis ongkir & area | `freeOngkir` |
| QRIS & metode bayar | `pembayaran` |
| Promo & voucher | `promo` |
| Label ukuran (M/L/XL) | `ukuran` |
| Harga tiap ukuran PER MENU (bisa beda-beda per menu) | `menu[...].hargaUkuran` |
| Isian yang bisa dihilangkan (tanpa sayur/telur) | `isianBisaDihilangkan` |
| Level pedas | `levelPedas` |
| Menu tambahan (add-on) & jenis harganya | `addOn` |
| Daftar menu, harga, foto, deskripsi | `menu` |

**Tentang harga add-on** — tiap add-on di `addOn` punya `tipe`:
- `"flat"` — harga sama untuk semua ukuran, tinggal dicentang.
- `"ukuran"` — harga beda tiap ukuran M/L/XL (contoh: Extra Keju), otomatis menyesuaikan ukuran yang dipilih.
- `"pcs"` — harga per pcs/butir, customer pilih jumlahnya pakai tombol +/− (contoh: Extra Telur, "1 pcs = Rp3.000").

Setiap bagian ada komentar `/* ... */` di dalam file yang menjelaskan cara isinya. Setelah edit, **simpan file**, lalu unggah ulang ke GitHub (lihat bagian 4).

### Menambah menu baru
Salin salah satu blok di dalam array `menu: [ ... ]`, tempel di bawahnya, lalu ganti `id` (harus unik), `nama`, `deskripsi`, `hargaDasar`, `image`, dan `kategori` (`"roti-john"`, `"roti-baghdad"`, atau `"gorengan"`).

### Mengganti foto menu / logo / QRIS / logo halal
1. Siapkan file gambar (format `.jpg` atau `.png`, disarankan ukuran persegi, maksimal ±500KB agar loading cepat).
2. Taruh file itu di folder `assets/`.
3. Di `data.js`, isi field terkait dengan nama filenya, contoh:
   ```js
   image: "assets/roti-john-original.jpg"
   ```

### Mengganti warna tampilan
Buka `css/style.css`, di bagian paling atas ada:
```css
:root{
  --kuning: #F5B301;
  --merah: #D62828;
  --hitam: #1B1815;
  ...
}
```
Ganti kode warna (hex) sesuai selera, seluruh halaman otomatis mengikuti.

### Mengambil link embed Google Maps
1. Buka [Google Maps](https://maps.google.com), cari lokasi outletmu.
2. Klik tombol **Bagikan** → tab **Sematkan peta (Embed a map)**.
3. Salin bagian `src="..."` dari kode HTML yang muncul.
4. Tempel URL tersebut ke `outlet.mapsEmbedUrl` di `data.js`.
5. Untuk `outlet.mapsLinkUrl`, klik **Bagikan** → tab **Kirim link** → salin link pendeknya.

---

## 2. Cara Kerja Fitur Penting

- **Checkout**: pelanggan pilih menu → isi ukuran/isian/pedas/add-on → masuk keranjang → isi wilayah antar → total otomatis dihitung (termasuk cek gratis ongkir) → klik **"Checkout via WhatsApp"** → otomatis membuka WhatsApp ke nomor kamu dengan pesan pesanan lengkap, dan invoice langsung tampil di layar (bisa dicetak/simpan sebagai PDF lewat tombol **Cetak / Simpan PDF**).
- **Pembayaran**: karena ini website statis (tanpa server), pembayaran QRIS dilakukan manual — pelanggan scan QRIS yang tampil, lalu kirim bukti transfer lewat chat WhatsApp yang sudah otomatis terbuka.
- **Data keranjang** tersimpan sementara di HP/browser pelanggan (localStorage), bukan di server, jadi tidak butuh database.

> Catatan: karena website ini murni statis (tanpa backend/database), semua transaksi & konfirmasi akhirnya tetap lewat WhatsApp. Kalau ke depan mau checkout otomatis (auto-konfirmasi, riwayat pesanan tersimpan di server, dsb.), itu butuh backend tambahan — beri tahu saya kalau mau dikembangkan ke tahap itu.

---

## 3. Coba Dulu di Komputer (Opsional)

Sebelum publish, kamu bisa cek tampilannya langsung:
1. Buka folder `sarapan-kita`.
2. Klik dua kali file `index.html` → akan terbuka di browser (Chrome/Firefox/dll).
3. Perkecil lebar jendela browser untuk melihat tampilan mobile.

---

## 4. Langkah Publish Gratis Lewat GitHub Pages

### A. Buat Akun GitHub (kalau belum punya)
1. Buka [github.com](https://github.com) → **Sign up** → ikuti langkahnya sampai selesai dan verifikasi email.

### B. Buat Repository Baru
1. Setelah login, klik ikon **+** di kanan atas → **New repository**.
2. **Repository name**: isi misalnya `sarapan-kita`.
3. Pilih **Public**.
4. **Jangan** centang "Add a README file" (karena kita sudah punya file sendiri).
5. Klik **Create repository**.

### C. Upload File Website
Cara termudah tanpa command line:
1. Di halaman repository yang baru dibuat, klik **"uploading an existing file"** (atau menu **Add file → Upload files**).
2. Buka folder `sarapan-kita` di komputer kamu, **pilih semua isi di dalamnya** (file `index.html`, folder `css`, `js`, `assets`, `README.md`) — pastikan struktur foldernya ikut terupload, bukan hanya file di root.
3. Seret (drag & drop) semua itu ke halaman GitHub, atau klik **choose your files**.
4. Scroll ke bawah, klik **Commit changes**.

> Tips: kalau drag & drop folder tidak berhasil menyertakan struktur folder `css/`, `js/`, `assets/`, gunakan cara **GitHub Desktop** (lihat bagian E) — lebih mudah untuk upload banyak folder sekaligus.

### D. Aktifkan GitHub Pages
1. Di halaman repository, klik tab **Settings**.
2. Di menu kiri, klik **Pages**.
3. Pada bagian **Build and deployment → Source**, pilih **Deploy from a branch**.
4. Pada **Branch**, pilih `main` dan folder `/ (root)`, lalu klik **Save**.
5. Tunggu 1–2 menit, refresh halaman itu — akan muncul link seperti:
   ```
   https://namakamu.github.io/sarapan-kita/
   ```
6. Buka link itu di HP untuk melihat website kamu sudah online, gratis, dan bisa dibagikan ke pelanggan.

### E. (Alternatif Lebih Mudah) Upload Pakai GitHub Desktop
Jika ingin cara yang lebih rapi untuk upload folder lengkap dan mempermudah update di kemudian hari:
1. Download **GitHub Desktop** di [desktop.github.com](https://desktop.github.com), install, lalu login dengan akun GitHub kamu.
2. Klik **File → Clone repository**, pilih repository `sarapan-kita` yang tadi dibuat.
3. Pilih lokasi folder di komputer, klik **Clone**.
4. Copy-paste semua isi folder `sarapan-kita` (hasil dari saya) ke dalam folder hasil clone tadi.
5. Buka kembali GitHub Desktop → akan terlihat daftar file yang berubah → isi kolom **Summary** (contoh: "Upload website pertama") → klik **Commit to main**.
6. Klik **Push origin** di kanan atas.
7. Lanjutkan ke langkah **D (Aktifkan GitHub Pages)** di atas.

### F. Update Website di Kemudian Hari
Setiap kali kamu mengubah menu, harga, atau foto:
- **Cara cepat lewat browser**: buka file yang ingin diubah di repository GitHub (misalnya `js/data.js`) → klik ikon pensil (Edit) → ubah isinya → scroll bawah → **Commit changes**. Website otomatis update dalam 1–2 menit.
- **Cara pakai GitHub Desktop**: edit file di komputer seperti biasa → buka GitHub Desktop → **Commit** → **Push origin**.

---

## 5. Checklist Sebelum Dibagikan ke Pelanggan

- [ ] Ganti semua foto menu placeholder dengan foto asli di folder `assets/`
- [ ] Ganti nomor WhatsApp di `contact.whatsapp` dengan nomor asli (format `62...`)
- [ ] Ganti alamat & link Google Maps di `outlet`
- [ ] Ganti gambar QRIS placeholder (`assets/qris-placeholder.png`) dengan QRIS asli
- [ ] Ganti nomor sertifikat halal & logo resmi di `halal` (jika sudah bersertifikat)
- [ ] Cek ulang harga & ukuran semua menu
- [ ] Tes alur checkout dari HP sendiri (pastikan pesan WhatsApp terkirim dengan benar)

Selamat berjualan! 🥖🔥
