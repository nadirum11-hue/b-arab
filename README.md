# PWA Sistem Edukasi Interaktif — GitHub Pages

Seluruh file website berada dalam satu folder dan dapat diletakkan langsung di root repository GitHub.

## Isi folder
- `index.html` — aplikasi asli dengan integrasi PWA dan fallback cache lokal.
- `manifest.json` — metadata instalasi PWA.
- `sw.js` — cache app shell dan aset CDN yang pernah berhasil dimuat.
- `icon.svg` — ikon aplikasi.
- `Code.gs` — backend Apps Script yang harus dipasang pada project Apps Script yang terkait dengan spreadsheet.

## Cara hosting GitHub Pages
1. Buat repository GitHub.
2. Upload **isi folder ini** langsung ke root repository (pastikan `index.html` tepat di root, bukan di subfolder).
3. Buka **Settings → Pages**, pilih deploy dari branch utama dan folder `/ (root)`.
4. Tunggu URL GitHub Pages aktif, lalu buka sekali saat online agar app shell dan library CDN tersimpan di cache.

## Wajib untuk sinkronisasi Google Spreadsheet
GitHub Pages hanya meng-host frontend statis; `google.script.run` tidak tersedia di sana. Karena itu `Code.gs` sudah diperbarui agar menyediakan API JSONP untuk frontend ini.

1. Buka project Apps Script yang saat ini digunakan oleh URL Web App Anda.
2. Ganti kode server dengan isi `Code.gs` dari folder ini. Pastikan project tetap terhubung ke spreadsheet yang benar.
3. Klik **Deploy → Manage deployments → Edit** (ikon pensil), pilih **New version**, lalu deploy. Jika perlu, atur akses sesuai kebijakan akun/organisasi Anda.
4. Frontend sudah menunjuk ke URL Web App yang Anda berikan. Jika URL deployment berubah, ubah konstanta URL di fungsi `fetchAPI` pada `index.html`.

**Penting:** API JSONP menggunakan query string GET agar dapat dipanggil lintas-origin tanpa proxy. Batch data yang sangat besar dapat melebihi batas URL browser/server. Gunakan hanya untuk aplikasi tepercaya; jangan masukkan data rahasia atau data sensitif karena parameter API terlihat di URL/log.

## Kemampuan offline dan batasan
- Shell aplikasi dan aset CDN dicache setelah berhasil dimuat saat online. Buka aplikasi sekali dalam keadaan online sebelum menggunakannya offline.
- Data terakhir yang berhasil disinkronkan disimpan di `localStorage` oleh aplikasi asli, sehingga dapat dibaca offline pada browser/perangkat yang sama.
- Offline tidak dapat menulis perubahan ke Google Spreadsheet; perubahan perlu disinkronkan saat internet kembali. Browser juga tidak dapat menyimpan seluruh library CDN sebelum pernah dimuat.
- Swipe dari tepi kiri ke kanan mencoba kembali ke panel sebelumnya. Tombol Back Android mengikuti riwayat panel dan meminta konfirmasi jika hendak keluar. Browser membatasi dialog konfirmasi keluar ke dialog standar.
- GitHub Pages wajib HTTPS agar Service Worker dan instalasi PWA berfungsi.


Catatan pembaruan: paket ini menyertakan ikon PNG 192x192 dan 512x512 untuk kompatibilitas instalasi PWA Chrome. Setelah mengganti file di GitHub, buka ulang situs GitHub Pages dan coba instal dari menu Chrome.

## Menu instalasi PWA
Versi ini menambahkan menu **Instal Aplikasi (PWA)** tepat di bawah **Pusat Ekspor & Backup**. Tombol akan memanggil prompt instalasi jika Chrome menyediakan `beforeinstallprompt`; jika tidak, aplikasi menampilkan status service worker dan panduan. Tombol tidak dapat memaksa Chrome menginstal jika situs belum memenuhi kriteria browser.


Pembaruan tambahan: halaman setup sekarang menyediakan pilihan perpindahan soal Manual atau Otomatis (jeda 2, 3, atau 5 detik). Pilihan berlaku untuk satu sesi. Code.gs tidak diubah oleh pembaruan ini.


## Perbaikan terbaru: reset menjodohkan dan simpan nilai bertahap
- Soal **Menjodohkan** memiliki tombol **RESET PASANGAN** untuk menghapus semua pasangan pilihan dan memulai ulang tanpa mengganti soal.
- Pada mode **Jawaban Terakhir**, jika pasangan salah atau belum lengkap, siswa dapat memperbaiki jawaban pada soal yang sama. Kesalahan tidak langsung mengakhiri soal menjodohkan.
- Nilai sesi dikirim ke Apps Script dalam kelompok kecil (3 nilai per permintaan) untuk mengurangi risiko URL JSONP terlalu panjang. Setelah server mengonfirmasi satu kelompok, hanya kelompok itu yang dikeluarkan dari antrean; nilai yang belum terkonfirmasi tetap berada di sesi permainan.
- Jika penyimpanan gagal, dialog sekarang menampilkan pesan error yang lebih spesifik. Jangan tutup atau muat ulang game sebelum mencoba simpan ulang, karena nilai yang belum tersimpan masih ditahan di sesi browser.

## File yang perlu diperbarui
1. Di GitHub Pages, ganti `index.html` dan `sw.js` dengan file dari paket ini.
2. Tunggu GitHub Pages selesai menerbitkan, lalu buka ulang aplikasi. Cache PWA dinaikkan ke versi baru.
3. Jika pesan server gagal masih muncul, buka Apps Script yang terhubung ke spreadsheet, pasang isi `Code.gs` dari paket ini, lalu **Deploy → Manage deployments → Edit → New version → Deploy**. Pastikan deployment mengarah ke spreadsheet yang benar dan URL `/exec` pada fungsi `fetchAPI` tetap sesuai.
4. Uji menyimpan beberapa nilai, lalu periksa tab **Nilai** di Google Spreadsheet sebelum menjalankan sesi besar.

Catatan: perubahan ini sudah diperiksa secara sintaks, tetapi belum diuji terhadap spreadsheet/deployment Apps Script milik Anda. Jika gagal lagi, catat pesan error yang tampil agar penyebab server atau izin akses bisa ditentukan.


## Perbaikan alur Menjodohkan pada mode Jawaban Terakhir
- Jawaban benar maupun salah tidak lagi memunculkan dialog peringatan yang menghentikan alur. Jawaban salah langsung dicatat sebagai nilai 0 dan permainan berlanjut sesuai pilihan Manual/Otomatis.
- Pasangan yang tidak lengkap juga dicatat sebagai jawaban salah saat tombol cek/lanjut ditekan, agar siswa tetap dapat melanjutkan.
- Kunci jawaban dan koreksi tetap disimpan di riwayat jawaban untuk ditampilkan di rekap akhir.
- Mode Jawaban Langsung tetap mempertahankan mekanisme umpan balik dan kesempatan memperbaiki jawaban.


## Perbaikan tegas: Menjodohkan pada Jawaban Terakhir (v10)
- Saat pilihan setup adalah Jawaban Terakhir, soal Menjodohkan tidak menampilkan popup/peringatan benar-salah ketika tombol SELANJUTNYA ditekan.
- Jawaban lengkap yang salah maupun pasangan yang belum lengkap tetap dicatat sebagai nilai 0 dan giliran lanjut mengikuti mode Manual/Otomatis.
- Koreksi dan kunci jawaban tetap disimpan untuk rekap akhir.
- Deteksi mode memeriksa state permainan sekaligus pilihan mode yang dicentang pada setup untuk menghindari state yang tidak sinkron.
- Cache PWA dinaikkan ke v10 agar perubahan frontend dimuat ulang.


## V11 — Tombol reset lebih kecil
- Tombol **RESET PASANGAN** sekarang kecil, rata kiri di area bawah, dan tidak selebar tombol lanjut untuk mengurangi salah klik.
- Cache PWA dinaikkan ke `sei-pwa-v11`.
- Ganti `index.html` dan `sw.js` di folder utama GitHub. `Code.gs` tidak perlu diganti untuk perubahan tata letak ini.
