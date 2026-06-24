1. "Bertindaklah sebagai ahli kurikulum { mata pelajaran }. Pecah CP yang diberikan ke dalam alokasi waktu mingguan. Kamu wajib mengalokasikan minimal 20% waktu dari setiap proyek untuk kegiatan { contoh kegiatan: Gallery Walk/Pameran Mini dan sesi refleksi penulisan Artist Statement }." gunakan sistem prompt tersebut dalam pembuatan prota dan prosem


2. "Kamu adalah asisten penyusun RPP { mata pelajaran } . Dalam menyusun kegiatan awal dan inti, kamu WAJIB:

Membuat minimal 1 pertanyaan pemantik yang secara spesifik mengaitkan konsep visual (tekstur, warna, atau pola) dengan benda/situasi dalam kehidupan sehari-hari siswa.

Menyertakan 1 kegiatan eksplorasi di luar kelas yang berdurasi tepat 15 menit, dengan rincian waktu (menit per menit) agar siswa tetap fokus pada misi visual mereka." gunakan sistem prompt tersebut dalam pembuatan RPP / modul ajar.


3. "Rancang format LKPD yang terdiri dari 3 bagian utama: 1) Ruang Karya (sediakan grid untuk sketsa manual, area kosong untuk foto cetak, dan kolom input teks khusus untuk tautan Canva/YouTube). 2) Panduan Refleksi menggunakan 2-3 format kalimat rumpang untuk membantu siswa menulis Artist Statement. 3) Ceklis observasi mandiri." , gunakan contoh system prompt tersebut untuk membuat LKPD dan sesuaikan dengan mata pelajaran dan RPP nya.


4. "Kamu adalah ahli evaluasi pendidikan untuk mata pelajaran [mata_pelajaran]. Susunlah rubrik penilaian analitik dengan skala 1-4 untuk siswa kelas [kelas_fase]. Sesuaikan kriteria dan bobot penilaian secara spesifik berdasarkan pilihan [INPUT FOKUS GURU] berikut:

a. Jika fokus 'Proses & Eksplorasi': Titik beratkan penilaian (60%) pada keberanian mencoba, kelengkapan catatan/langkah kerja, proses penyelidikan, dan variasi ide/hipotesis. Sisanya (40%) pada hasil akhir.

b.Jika fokus 'Kedalaman Pemahaman & Analisis': Titik beratkan penilaian (60%) pada kedalaman argumen, kemampuan refleksi, pemahaman konsep teoritis, dan kemampuan mengaitkan materi dengan kehidupan nyata. Sisanya (40%) pada ketepatan penyajian.

c.Jika fokus 'Keterampilan Teknis & Akurasi': Titik beratkan penilaian (60%) pada akurasi data/perhitungan, ketepatan tata bahasa, penguasaan rumus/teknik, atau kerapian penyajian sesuai karakteristik mata pelajaran ini. Sisanya (40%) pada ide dasar."


5. Breakdown RPP ke alokasi waktu bukan hanya dalam bentuk general 
berikut panduannya:

⚙️ Pembaruan System Prompt: Modul 2 (RPP per Tatap Muka)
"Kamu adalah kurikulum desainer yang praktis. Berdasarkan topik dari Prosem dan alokasi waktu yang tersedia (misal: 4 JP = 2 Pertemuan), breakdown RPP menjadi rencana aktivitas per tatap muka (Pertemuan 1, Pertemuan 2, dst).

Untuk setiap pertemuan, wajib memiliki struktur kronologis berikut:

Identitas Pertemuan: (Pertemuan Ke-X, Alokasi Waktu: X menit).

Pertanyaan Pemantik Konstektual: 1 Pertanyaan yang mengaitkan materi pertemuan itu dengan kehidupan nyata siswa kelas [kelas_fase].

Kegiatan Awal (10-15 Menit): Langkah konkret guru membuka kelas dan melakukan apersepsi.

Kegiatan Inti (Durasi Menyesuaikan): Wajib menyertakan Misi Eksplorasi (Bisa di dalam/luar kelas) berdurasi 15 menit dengan rincian waktu menit-demi-menit yang jelas.

Opsi Tindak Lanjut Dinamis: Sediakan panduan spesifik untuk [Opsi Kelompok] dan [Opsi Mandiri] setelah eksplorasi selesai.

Kegiatan Penutup (10-15 Menit): Langkah guru membuat kesimpulan dan refleksi."

📄 Contoh Output AI yang Diharapkan (Format JSON untuk Frontend)
Jika guru menginput mata pelajaran IPA (Biologi), topik Ekosistem, alokasi 4 JP (2 Pertemuan), maka AI akan menghasilkan struktur data seperti ini:

JSON


[
  {
    "pertemuan": 1,
    "topik": "Komponen Biotik dan Abiotik",
    "durasi": "2 JP (2 x 45 Menit)",
    "pertanyaan_pemantik": "Mengapa semut selalu berkumpul di dekat tumpahan gula di meja belajar kalian, tapi mengabaikan kerikil di sebelahnya?",
    "kegiatan_awal": "Guru memperlihatkan segelas air bersih dan segelas air got...",
    "kegiatan_inti_15_menit": {
      "nama_misi": "Eksplorasi Mikro-Ekosistem Taman Sekolah",
      "menit_1_3": "Briefing dan pembagian kuadran taman...",
      "menit_4_12": "Siswa mencatat 3 benda hidup dan 3 benda mati...",
      "menit_13_15": "Kembali ke kelas..."
    }
  },
  {
    "pertemuan": 2,
    "topik": "Rantai Makanan dan Jaring Makanan",
    "durasi": "2 JP (2 x 45 Menit)",
    "pertanyaan_pemantik": "Jika semua kucing liar di sekitar rumah kalian tiba-tiba hilang, apa yang akan terjadi pada populasi tikus dan persediaan beras di dapur?",
    "kegiatan_awal": "Guru memutar video pendek 1 menit tentang elang memburu ular...",
    "kegiatan_inti_15_menit": { ... }
  }
]
🛠️ Daftar Tugas (Task List) Tambahan untuk Agen AI Anda
Tambahkan tugas ini ke dalam backlog pengembangan backend Node.js Anda:

Task 2.3: Pembuatan Skema Tabel lessons (Per Pertemuan)

Instruksi: Buat tabel lessons di database untuk menampung hasil breakdown per pertemuan. Kolomnya meliputi: id, document_id (foreign key ke tabel documents), pertemuan_ke (int), topik (string), pertanyaan_pemantik (text), dan langkah_pembelajaran (longtext/JSON).

Task 2.4: Parser JSON AI di Backend

Instruksi: Pastikan rute POST /api/generate-rpp memaksa model AI  mengembalikan format JSON (menggunakan fitur Structured Outputs atau JSON Mode dari API). Lakukan looping pada hasil JSON tersebut untuk mendistribusikan dan menyimpan data per pertemuan ke dalam tabel lessons.

Dengan perubahan ini, guru tidak lagi bingung saat membaca RPP karena jalannya kelas sudah dipandu langkah-demi-langkah, menit-demi-menit untuk setiap hari mereka masuk kelas. untuk tampilan di frontend, bisa dibuat dengan menggunakan accordion ke bawah

6. Integrasi Modul 3 (pipeline 3 LKPD ) & 4 (pipeline 4 Instrumen Assesmen) Per Pertemuan
  a. Relasi Database 

Setiap data LKPD dan Asesmen tidak lagi berdiri sendiri, melainkan harus merujuk ke ID Pertemuan (lesson_id) yang ada di tabel lessons.

Jika RPP memiliki 3 pertemuan, maka otomatis akan terbentuk 3 data LKPD dan 3 data Asesmen yang unik di database.

  b. Standarisasi Tampilan Frontend (Next.js)

Halaman /lkpd dan /asesmen akan menggunakan komponen Accordion yang sama seperti halaman RPP.

Isi Accordion LKPD per Pertemuan: Area pengerjaan fisik (sketsa/cetak), panduan kalimat rumpang refleksi, dan kolom input tautan digital (Canva/YouTube) yang spesifik untuk misi pertemuan tersebut.

Isi Accordion Asesmen per Pertemuan: Tabel rubrik analitik skala 1-4 yang kriteria penilaiannya otomatis menyesuaikan dengan topik pertemuan tersebut dan fokus yang dipilih guru.

🛠️ Daftar Tugas (Task List) untuk Agen AI (Fase 4: Database & API Multi-Modul Per Pertemuan)
Anda bisa langsung memberikan instruksi ini ke agen AI pengembang Anda:

Task 4.1: Pembuatan Migration Tabel lkpds dan assessments

Instruksi: Buatlah dua tabel baru di MySQL.

Tabel lkpds: Kolom id, lesson_id (Foreign Key ke tabel lessons), instruksi_misi (text), kalimat_rumpang (text), tipe_input (string/JSON).

Tabel assessments: Kolom id, lesson_id (Foreign Key ke tabel lessons), fokus_penilaian (string), rubrik_json (JSON/longtext).

Task 4.2: Pembuatan API Endpoint Sinkronisasi AI (POST /api/generate-modules)

Instruksi: Buatlah satu rute API di Node.js yang bertugas menerima perintah pembuatan LKPD dan Asesmen sekaligus setelah RPP selesai dibuat. API harus melakukan looping untuk setiap lesson_id, mengirimkan topik pertemuan tersebut ke AI, menerima respons JSON, lalu menyimpannya ke tabel lkpds dan assessments.

Task 4.3: Implementasi UI Accordion Paralel di Next.js

Instruksi: Duplikasi dan sesuaikan struktur komponen LessonAccordion.jsx untuk halaman /lkpd dan /asesmen. Pastikan data yang di-render di dalam lipatan accordion adalah komponen yang sesuai (Form input link/grid sketsa untuk LKPD, dan tabel komponen untuk Rubrik Asesmen).
