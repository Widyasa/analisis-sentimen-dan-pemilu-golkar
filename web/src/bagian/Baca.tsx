import { data } from "../data";
import { formatPersen, formatSuara } from "../format";

export function Baca() {
  return (
    <div className="batas">
      <section className="panel">
        <h2>Cara membaca data</h2>
        <h3>Suara Pemilu</h3>
        <ul className="daftar">
          <li>Angka adalah suara sah partai untuk DPR RI, bukan daftar pemilih dan bukan jumlah orang yang datang ke TPS.</li>
          <li>
            Pangsa di provinsi memakai {data.penyebutPangsa} sebagai penyebut. Pangsa nasional memakai{" "}
            {formatSuara(data.totalSuaraSah)} suara sah.
          </li>
          <li>Peringkat pertama berarti suara terbanyak di antara 18 partai, bukan mayoritas.</li>
          <li>
            Golkar {formatSuara(data.suaraGolkar)} suara, atau {formatPersen((data.suaraGolkar / data.totalSuaraSah) * 100)}, peringkat{" "}
            {data.peringkatNasionalGolkar}.
          </li>
          <li>Di Aceh, berkas ini memuat partai nasional untuk DPR RI. Partai lokal pada pemilihan DPRA/DPRK tidak termasuk.</li>
        </ul>
        <h3>Sentimen post</h3>
        <ul className="daftar">
          <li>Label positif, netral, dan negatif adalah prediksi model pada seluruh teks post, bukan label manusia.</li>
          <li>Topik berasal dari aturan pencocokan frasa. Keyword atau topik tidak otomatis berlabel positif atau negatif.</li>
          <li>Post yang membandingkan beberapa partai atau tokoh belum tentu sedang menilai Golkar saja.</li>
          <li>Tiga ringkasan pengumpul tidak diklasifikasikan.</li>
          <li>Ambang 0,70 hanya membantu memilih post yang perlu dibaca manusia.</li>
        </ul>
      </section>
      <section className="panel">
        <h2>Batasan analisis</h2>
        <ul className="daftar">
          <li>Post yang terkumpul bukan sampel survei dan tidak mewakili pengguna X atau pemilih.</li>
          <li>Sentimen tidak menyebabkan hasil Pemilu. Jumlah post tidak digabung dengan jumlah suara.</li>
          <li>Berkas post tidak punya kolom provinsi, jadi tidak disejajarkan dengan suara per provinsi.</li>
          <li>Model dilatih pada dokumen sentimen Prosa, bukan pada post politik di X. Confidence tinggi bukan jaminan prediksi benar.</li>
          <li>Tidak ada label manusia yang terverifikasi, jadi akurasi tidak ditampilkan.</li>
          <li>Dashboard tidak menampilkan username, tautan akun, atau teks post.</li>
        </ul>
        <p className="sumber">
          Sumber suara: Keputusan KPU Nomor 1050 Tahun 2024 Lampiran II dan Keputusan KPU Nomor 1204
          Tahun 2024. Sumber sentimen: berkas post yang sudah dianalisis di notebook proyek ini.
        </p>
      </section>
    </div>
  );
}
