import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { data } from "../data";
import { formatPersen, formatTanggal } from "../format";

const WARNA = {
  positif: "#0f766e",
  netral: "#475569",
  negatif: "#c2410c",
};

export function Sentimen() {
  const s = data.sentimen;
  const dasar = { positif: s.positif, netral: s.netral, negatif: s.negatif };
  const topik = s.topik.map((baris) => ({
    ...baris,
    namaPendek: baris.nama,
  }));

  return (
    <div>
      <section className="panel">
        <h2>Sumber post yang dianalisis</h2>
        <p className="catatan">
          Periode {formatTanggal(s.tanggalAwal)} sampai {formatTanggal(s.tanggalAkhir)}. Dari{" "}
          {s.jumlahBerkas} baris sumber, {s.kualitasSumber.ringkasanPengumpul} ringkasan pengumpul tidak
          diprediksi. Status kualitas sumber: {s.kualitasSumber.belumDiverifikasi} belum diverifikasi
          terhadap post asli, {s.kualitasSumber.cuplikanTerpotong} cuplikan terpotong, dan{" "}
          {s.kualitasSumber.tuduhanPerluVerifikasi} tuduhan yang perlu verifikasi independen. Kategori
          itu tidak dijumlahkan dengan {s.perluTinjauan} tanda tinjauan manual, karena alasannya dapat
          bertumpang tindih.
        </p>
      </section>

      <section className="panel">
        <h2>Komposisi prediksi</h2>
        <p className="catatan">
          {s.masukPrediksi} post masuk prediksi. {s.tidakDiklasifikasikan} ringkasan pengumpul tidak
          masuk. Persentase di bawah memakai {s.masukPrediksi} sebagai penyebut.
        </p>
        <div className="tumpukan" aria-hidden="true">
          <span style={{ width: `${(s.positif / s.masukPrediksi) * 100}%`, background: WARNA.positif }} />
          <span style={{ width: `${(s.netral / s.masukPrediksi) * 100}%`, background: WARNA.netral }} />
          <span style={{ width: `${(s.negatif / s.masukPrediksi) * 100}%`, background: WARNA.negatif }} />
        </div>
        <div className="komposisi">
          {(["positif", "netral", "negatif"] as const).map((label) => (
            <article key={label} style={{ borderTopColor: WARNA[label] }}>
              <p className="label">{label}</p>
              <p className="angka">{s[label]}</p>
              <p className="catatan">{formatPersen((s[label] / s.masukPrediksi) * 100)} dari post yang diprediksi</p>
            </article>
          ))}
        </div>
        <p className="sumber">
          Model: mdhugol/indonesia-bert-sentiment-classification, dijalankan lokal sebelum dashboard
          ini dibuat. Dashboard tidak menjalankan model.
        </p>
      </section>

      <section className="panel">
        <h2>Volume post per minggu</h2>
        <p className="catatan">
          Minggu ditandai pada hari Minggu di akhir minggu, {formatTanggal(s.tanggalAwal)} sampai{" "}
          {formatTanggal(s.tanggalAkhir)}. Minggu tanpa post pada berkas ini tidak digambar.
        </p>
        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer>
            <BarChart data={s.mingguan} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid stroke="#e4dccf" vertical={false} />
              <XAxis dataKey="akhirMinggu" tickFormatter={(nilai) => formatTanggal(String(nilai)).replace(/ \d{4}$/, "")} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip labelFormatter={(label) => `Minggu berakhir ${formatTanggal(String(label))}`} />
              <Legend />
              <Bar dataKey="positif" stackId="minggu" fill={WARNA.positif} />
              <Bar dataKey="netral" stackId="minggu" fill={WARNA.netral} />
              <Bar dataKey="negatif" stackId="minggu" fill={WARNA.negatif} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="sumber">Jumlah post pada berkas, bukan volume seluruh percakapan di X.</p>
      </section>

      <section className="kisi-dua">
        <article className="panel">
          <h2>Confidence model</h2>
          <p className="catatan">
            Ambang 0,70 adalah pilihan analisis untuk memprioritaskan tinjauan manusia, bukan ambang
            bawaan model. {s.confidenceDiBawah070} prediksi berada di bawah ambang. {s.perluTinjauan}{" "}
            post ditandai tinjauan manual, termasuk teks terpotong, emoji, atau tuduhan yang belum
            diverifikasi.
          </p>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={s.confidence} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid stroke="#e4dccf" vertical={false} />
                <XAxis dataKey="rentang" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(nilai) => [`${nilai} post`, "Jumlah"]} />
                <Bar dataKey="jumlah" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="sumber">Tiga bin di kiri ambang 0,70 perlu dibaca lebih dulu.</p>
        </article>
        <article className="panel">
          <h2>Frasa yang berulang</h2>
          <p className="catatan">
            Dua atau tiga kata yang muncul di sedikitnya dua post pada label yang sama. Teks post
            tidak ditampilkan.
          </p>
          <div className="bungkus-tabel">
            <table>
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Frasa</th>
                  <th className="angka-kolom">Post</th>
                </tr>
              </thead>
              <tbody>
                {s.frasa.map((baris) => (
                  <tr key={`${baris.sentimen}-${baris.frasa}`}>
                    <td>{baris.sentimen}</td>
                    <td>{baris.frasa}</td>
                    <td className="angka-kolom">{baris.jumlahPost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="panel">
        <h2>Topik menurut label prediksi</h2>
        <p className="catatan">
          Topik dihitung dengan aturan pencocokan frasa di notebook. Satu post dapat masuk beberapa
          topik, jadi jumlah baris tidak boleh dijumlahkan menjadi jumlah post unik. Persentase di
          tooltip memakai ukuran kelompok sentimen: {s.positif} positif, {s.netral} netral, {s.negatif}{" "}
          negatif.
        </p>
        <div className="grafik-gulir">
        <div className="kanvas" style={{ width: "100%", height: 460 }}>
          <ResponsiveContainer>
            <BarChart data={topik} layout="vertical" margin={{ left: 8, right: 16, top: 8 }}>
              <CartesianGrid stroke="#e4dccf" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="nama" width={196} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(nilai, nama) => {
                  const label = String(nama) as keyof typeof dasar;
                  const jumlah = Number(nilai);
                  const penyebut = dasar[label];
                  return [`${jumlah} post (${formatPersen((jumlah / penyebut) * 100)} dari ${penyebut} post ${label})`, label];
                }}
              />
              <Legend />
              <Bar dataKey="positif" fill={WARNA.positif} />
              <Bar dataKey="netral" fill={WARNA.netral} />
              <Bar dataKey="negatif" fill={WARNA.negatif} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>
        <p className="sumber">
          Sebuah topik tidak otomatis positif atau negatif. Prediksi membaca teks post secara
          keseluruhan, bukan sikap terhadap Golkar saja. Warna batang diulang pada legenda teks.
        </p>
      </section>
    </div>
  );
}
