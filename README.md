# Sentimen Analisis Golkar

Notebook ini punya dua bagian yang dipisah.

- Bagian 1–13: suara sah partai untuk DPR RI, Pemilu 2024, dari berkas KPU di `datasets/`.
- Bagian 14 dan seterusnya: sentimen post X yang sudah ada di `datasets/golkar_post_x_pemilu_2024_tinjauan_awal.csv`.

Post tidak diambil ulang dari X. Dataset sumber dan berkas suara tidak ditimpa.

## Menjalankan

Gunakan lingkungan virtual di folder proyek. Jangan memasang paket ini secara global.

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pip install torch --index-url https://download.pytorch.org/whl/cpu
```

Di Cursor, pilih interpreter `.venv\Scripts\python.exe`. Lalu buka `notebooks/analisis_hasil_pemilu_dpr_ri_2024.ipynb` dan jalankan semua sel dari atas.

Unduhan model pertama kali butuh internet. Yang diunduh hanya bobot model ke cache Hugging Face di komputer ini. Teks post tidak dikirim ke API inferensi. Setelah cache terisi, inferensi berjalan lokal.

## Model

Nama: `mdhugol/indonesia-bert-sentiment-classification`.

Kartu model menyatakan ini IndoBERT base phase 1 uncased yang dilatih pada dataset sentimen Prosa (`smsa_doc-sentiment-prosa`). README kartu model memetakan `LABEL_0` ke positif, `LABEL_1` ke netral, dan `LABEL_2` ke negatif. Berkas `config.json` hanya menulis `LABEL_0`, `LABEL_1`, dan `LABEL_2`, tanpa kata sentimen. Notebook memeriksa dua kalimat contoh pada kartu model sebelum memakai peta itu.

Respons API kartu model yang diperiksa tidak memuat field lisensi, dan README model tidak menyatakan lisensi. Notebook tidak menambahkan lisensi yang tidak tertulis.

## Kolom hasil

Berkas `outputs/sentimen/golkar_post_x_bersih_2024.csv` menyimpan teks yang dibersihkan dan tanda baris yang masuk analisis.

Berkas `outputs/sentimen/frasa_dan_topik_per_sentimen_2024.csv` memuat frasa dua atau tiga kata yang berulang, plus kelompok topik. Satu post dapat masuk lebih dari satu topik. Aturan frasanya tertulis di notebook.

Berkas `outputs/sentimen/golkar_post_x_prediksi_sentimen_2024.csv` menambah:

- `sentimen_model`: positif, netral, negatif, atau tidak_diklasifikasikan
- `confidence_model`: skor kelas yang dipilih model
- `label_mentah_model`: label asli model (`LABEL_0` dan seterusnya)
- `perlu_tinjauan_manual` dan `alasan_tinjauan`

Kolom `label_sentimen_usulan` tetap ada sebagai usulan awal pada berkas sumber. Status sumbernya: usulan AI, bukan label gold. Kolom itu bukan kebenaran dan tidak dipakai untuk menghitung akurasi.

## Asumsi dan keterbatasan

- Tidak ada duplikat `x_post_id` atau URL pada berkas ini, jadi pembersihan duplikat tidak membuang baris.
- Tiga baris bertanda ringkasan pengumpul dikeluarkan dari prediksi. Cuplikan terpotong tetap diprediksi, tetapi ditandai untuk tinjauan.
- Aturan bersih hanya menghapus URL, mention, dan spasi berlebih. Negasi, emoji, dan hashtag dipertahankan. Pada berkas ini tidak ada URL, mention, atau hashtag di dalam teks, dan tidak ada baris yang berubah setelah aturan itu.
- Ambang tinjauan 0,70 dipilih di notebook, bukan ambang bawaan model.
- Model dilatih pada dokumen sentimen Prosa, bukan pada post X politik. Confidence tinggi bukan label manusia.
- Berkas post tidak punya kolom provinsi, jadi sentimen tidak bisa disejajarkan dengan suara per provinsi.
- Post yang terkumpul bukan sampel survei. Sentimen tidak menjelaskan dan tidak menyebabkan hasil suara.

## Dashboard web

Aplikasi ada di folder `web`. Ia hanya membaca angka agregat di `web/src/data/agregat.json`. CSV post, username, dan teks post tidak ikut ke bundle.

Menjalankan lokal, dari folder `web`:

```powershell
npm install
npm run dev
```

Build produksi: `npm run build`. Hasilnya di `web/dist`.

Deploy ke Vercel dilakukan manual. Saat mengimpor repository, atur **Root Directory** ke `web`. Framework preset: Vite. Perintah build `npm run build`, folder output `dist`. Tidak ada environment variable. Model NLP tidak dijalankan saat build.

Jika CSV analisis berubah, jalankan ulang `python web/scripts/buat_agregat.py` dari folder proyek sebelum build. Skrip itu menolak menulis URL, ID post, atau teks post ke JSON.
