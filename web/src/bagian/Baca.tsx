import { data } from "../data";
import { formatPersen, formatSuara, formatTanggal } from "../format";

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
        <h3>Bagaimana suara diringkas</h3>
        <p>
          Berkas provinsi memuat {data.sumberResmi.provinsi.barisDetail} baris: 18 partai di tiap
          provinsi. Suara 18 partai dijumlahkan dan dicocokkan dengan total provinsi, lalu jumlah
          tiap partai dicocokkan dengan {data.sumberResmi.nasional.baris} baris hasil nasional.
          Pangsa di provinsi adalah suara partai dibagi total suara sah partai di provinsi itu.
          Peringkat mengikuti urutan suara di provinsi tersebut.
        </p>
        <h3>Bagaimana unggahan mendapat label</h3>
        <p>
          Dari {data.sentimen.jumlahBerkas} baris, {data.sentimen.tidakDiklasifikasikan} ringkasan
          pengumpul dikeluarkan. {data.sentimen.masukPrediksi} post sisanya diberi label positif,
          netral, atau negatif oleh model atas seluruh teks. Itu prediksi sentimen, bukan survei dan
          bukan hasil Pemilu.
        </p>
        <p>
          Topik adalah langkah terpisah. Aturan kata kunci di notebook menandai apakah sebuah post
          menyebut, misalnya, kursi DPR atau jatah menteri. Satu post dapat masuk lebih dari satu
          topik. Masuknya sebuah topik tidak otomatis membuat sentimennya positif atau negatif.
        </p>
        <p>
          {data.sentimen.perluTinjauan} post ditandai untuk dibaca manusia. Confidence adalah
          keyakinan model pada label yang dipilih, bukan akurasi model.
        </p>
        <h3>Sumber post X</h3>
        <ul className="daftar">
          <li>
            Periode post yang dianalisis: {formatTanggal(data.sentimen.tanggalAwal)} sampai{" "}
            {formatTanggal(data.sentimen.tanggalAkhir)}.
          </li>
          <li>
            Berkas sumber berisi {data.sentimen.jumlahBerkas} baris.{" "}
            {data.sentimen.kualitasSumber.ringkasanPengumpul} baris berupa ringkasan pengumpul dan tidak
            masuk prediksi. {data.sentimen.masukPrediksi} post lainnya diprediksi model.
          </li>
          <li>
            Status kualitas sumber pada {data.sentimen.jumlahBerkas} baris:{" "}
            {data.sentimen.kualitasSumber.belumDiverifikasi} belum diverifikasi terhadap post asli,{" "}
            {data.sentimen.kualitasSumber.cuplikanTerpotong} tampak berupa cuplikan terpotong, dan{" "}
            {data.sentimen.kualitasSumber.tuduhanPerluVerifikasi} berisi tuduhan yang perlu verifikasi
            independen. Tiga ringkasan pengumpul adalah kategori terpisah.
          </li>
          <li>
            Angka status sumber itu tidak dijumlahkan dengan {data.sentimen.perluTinjauan} post yang
            ditandai tinjauan manual. Alasan tinjauan dapat bertumpang tindih, misalnya cuplikan yang
            juga punya confidence rendah.
          </li>
        </ul>
        <h3>Sentimen post</h3>
        <ul className="daftar">
          <li>Label positif, netral, dan negatif adalah prediksi model pada seluruh teks post, bukan label manusia.</li>
          <li>Topik berasal dari aturan pencocokan frasa. Keyword atau topik tidak otomatis berlabel positif atau negatif.</li>
          <li>Post yang membandingkan beberapa partai atau tokoh belum tentu sedang menilai Golkar saja.</li>
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
      </section>
      <section className="panel">
        <h2>Katalog data</h2>
        <div className="bungkus-tabel tabel-teks">
          <table>
            <caption>Data yang dipakai dashboard. Teks unggahan dan identitas akun tidak diunduh dari sini.</caption>
            <thead>
              <tr>
                <th>Data</th>
                <th>Sumber</th>
                <th>Periode</th>
                <th className="angka-kolom">Baris</th>
                <th>Yang dipakai</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Suara sah nasional partai DPR RI</td>
                <td>
                  <a href={data.sumberResmi.nasional.url} target="_blank" rel="noopener noreferrer">
                    {data.sumberResmi.nasional.nama}
                  </a>
                </td>
                <td>Pemilu 2024</td>
                <td className="angka-kolom">{data.sumberResmi.nasional.baris}</td>
                <td>Suara tiap partai, total suara sah, dan status ambang batas 4 persen.</td>
              </tr>
              <tr>
                <td>Suara partai per provinsi</td>
                <td>
                  <a href={data.sumberResmi.provinsi.url} target="_blank" rel="noopener noreferrer">
                    {data.sumberResmi.provinsi.nama}
                  </a>
                </td>
                <td>Pemilu 2024</td>
                <td className="angka-kolom">{data.sumberResmi.provinsi.barisDetail}</td>
                <td>
                  {data.jumlahProvinsi} provinsi kali {data.sumberResmi.nasional.baris} partai. Dipakai
                  untuk memeriksa jumlah dan menentukan peringkat.
                </td>
              </tr>
              <tr>
                <td>Partai dengan suara terbanyak per provinsi</td>
                <td>
                  <a href={data.sumberResmi.provinsi.url} target="_blank" rel="noopener noreferrer">
                    {data.sumberResmi.provinsi.nama}
                  </a>
                </td>
                <td>Pemilu 2024</td>
                <td className="angka-kolom">{data.sumberResmi.provinsi.barisRingkasan}</td>
                <td>Satu baris per provinsi: partai peringkat 1 dan suaranya.</td>
              </tr>
              <tr>
                <td>Ringkasan Golkar per provinsi</td>
                <td>Dihitung dari berkas provinsi di atas</td>
                <td>Pemilu 2024</td>
                <td className="angka-kolom">{data.jumlahProvinsi}</td>
                <td>Suara, pangsa, peringkat, partai pembanding, dan selisih.</td>
              </tr>
              <tr>
                <td>Post X tentang Golkar</td>
                <td>Berkas yang sudah ada di proyek, bukan dokumen KPU</td>
                <td>
                  {formatTanggal(data.sentimen.tanggalAwal)}–{formatTanggal(data.sentimen.tanggalAkhir)}
                </td>
                <td className="angka-kolom">
                  {data.sentimen.jumlahBerkas} terkumpul, {data.sentimen.masukPrediksi} diprediksi
                </td>
                <td>Hanya jumlah, label prediksi, confidence, topik, dan alasan tinjauan. Teks post tidak dibagikan.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="sumber">
          Sumber suara:{" "}
          <a href={data.sumberResmi.provinsi.url} target="_blank" rel="noopener noreferrer">
            {data.sumberResmi.provinsi.nama}
          </a>{" "}
          dan{" "}
          <a href={data.sumberResmi.nasional.url} target="_blank" rel="noopener noreferrer">
            {data.sumberResmi.nasional.nama}
          </a>
          . Unduhan CSV ada di tab Hasil suara. Sumber sentimen: berkas post yang sudah dianalisis di notebook.
        </p>
      </section>
    </div>
  );
}
