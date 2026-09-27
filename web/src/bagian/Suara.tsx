import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { data, type ProvinsiGolkar } from "../data";
import { formatJuta, formatPersen, formatSelisih, formatSuara, unduhCsv } from "../format";

type Urutan = "pangsa" | "suara" | "peringkat";
type Arah = "naik" | "turun";
type Saringan = "semua" | "pertama" | "bukan";

const WARNA_GOLKAR = "#8a5a10";
const WARNA_LAIN = "#94a3b8";

function LabelProvinsi(props: { x?: number; y?: number; payload?: { value?: string } }) {
  return (
    <text x={props.x} y={props.y} dy={4} textAnchor="end" fill="#1c1917" fontSize={12}>
      {props.payload?.value}
    </text>
  );
}

function tigaTeratas(kunci: "suara" | "pangsa"): ProvinsiGolkar[] {
  return [...data.provinsi].sort((a, b) => b[kunci] - a[kunci]).slice(0, 3);
}

export function Suara() {
  const [urut, setUrut] = useState<Urutan>("pangsa");
  const [arah, setArah] = useState<Arah>("turun");
  const [urutTabel, setUrutTabel] = useState<Urutan>("peringkat");
  const [arahTabel, setArahTabel] = useState<Arah>("naik");
  const [cari, setCari] = useState("");
  const [saringan, setSaringan] = useState<Saringan>("semua");

  const suaraTeratas = tigaTeratas("suara");
  const pangsaTeratas = tigaTeratas("pangsa");
  const namaSuara = new Set(suaraTeratas.map((item) => item.provinsi));
  const namaPangsa = new Set(pangsaTeratas.map((item) => item.provinsi));

  const juara = useMemo(() => {
    const hitung = new Map<string, number>();
    for (const baris of data.pemenangProvinsi) {
      hitung.set(baris.singkatan, (hitung.get(baris.singkatan) ?? 0) + 1);
    }
    return [...hitung.entries()]
      .map(([singkatan, jumlah]) => ({ singkatan, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah);
  }, []);

  const grafikProvinsi = useMemo(() => {
    const salinan = [...data.provinsi];
    salinan.sort((a, b) => {
      const beda = urut === "peringkat" ? a.peringkat - b.peringkat : b[urut] - a[urut];
      return arah === "turun" ? beda : -beda;
    });
    return salinan;
  }, [urut, arah]);

  const tabel = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return data.provinsi.filter((baris) => {
      if (saringan === "pertama" && baris.peringkat !== 1) return false;
      if (saringan === "bukan" && baris.peringkat === 1) return false;
      if (!kata) return true;
      return (
        baris.provinsi.toLowerCase().includes(kata) ||
        baris.pembanding.toLowerCase().includes(kata) ||
        baris.pembandingSingkat.toLowerCase().includes(kata)
      );
    });
  }, [cari, saringan]);

  function urutkan(kunci: Urutan) {
    if (urutTabel === kunci) {
      setArahTabel((nilai) => (nilai === "turun" ? "naik" : "turun"));
      return;
    }
    setUrutTabel(kunci);
    setArahTabel(kunci === "peringkat" ? "naik" : "turun");
  }

  return (
    <div>
      <section className="sorot">
        <article className="kartu">
          <h3>Suara Golkar terbanyak</h3>
          <ol className="daftar">
            {suaraTeratas.map((baris) => (
              <li key={baris.provinsi}>
                <strong>{baris.provinsi}</strong>: {formatSuara(baris.suara)} suara,{" "}
                {formatPersen(baris.pangsa)}, peringkat {baris.peringkat}
              </li>
            ))}
          </ol>
        </article>
        <article className="kartu">
          <h3>Pangsa Golkar tertinggi</h3>
          <ol className="daftar">
            {pangsaTeratas.map((baris) => (
              <li key={baris.provinsi}>
                <strong>{baris.provinsi}</strong>: {formatPersen(baris.pangsa)} dari suara sah
                partai di provinsi itu, {formatSuara(baris.suara)} suara
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="panel" id="suara-nasional">
        <h2>Suara sah nasional 18 partai</h2>
        <p className="catatan">
          Penyebut pangsa nasional adalah {formatSuara(data.totalSuaraSah)} suara sah partai DPR
          RI. Batang Golkar diberi warna berbeda.
        </p>
        <div style={{ width: "100%", height: 520 }}>
          <ResponsiveContainer>
            <BarChart data={data.partai} layout="vertical" margin={{ left: 8, right: 16, top: 8 }}>
              <CartesianGrid stroke="#e4dccf" horizontal={false} />
              <XAxis type="number" tickFormatter={formatJuta} />
              <YAxis type="category" dataKey="singkatan" width={78} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(nilai, _nama, item) => {
                  const baris = item.payload as PartaiPayload;
                  return [
                    `${formatSuara(Number(nilai))} suara (${formatPersen(baris.pangsa)})`,
                    baris.nama,
                  ];
                }}
                labelFormatter={() => "Suara sah DPR RI"}
              />
              <Bar dataKey="suara" radius={[0, 4, 4, 0]}>
                {data.partai.map((baris) => (
                  <Cell key={baris.nomor} fill={baris.golkar ? WARNA_GOLKAR : WARNA_LAIN} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bungkus-tabel">
          <table>
            <caption>Angka di balik grafik suara nasional. Pangsa memakai seluruh suara sah partai sebagai penyebut.</caption>
            <thead>
              <tr>
                <th>Peringkat</th>
                <th>Partai</th>
                <th className="angka-kolom">Suara sah</th>
                <th className="angka-kolom">Pangsa</th>
                <th>Ambang 4%</th>
              </tr>
            </thead>
            <tbody>
              {data.partai.map((baris, indeks) => (
                <tr key={baris.nomor}>
                  <td>{indeks + 1}</td>
                  <td>{baris.nama}</td>
                  <td className="angka-kolom">{formatSuara(baris.suara)}</td>
                  <td className="angka-kolom">{formatPersen(baris.pangsa)}</td>
                  <td>{baris.ambang}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sumber">
          Sumber:{" "}
          <a href={data.sumberResmi.nasional.url} target="_blank" rel="noopener noreferrer">
            {data.sumberResmi.nasional.nama}
          </a>
          . Sumbu mendatar dalam juta suara. Status ambang batas 4 persen mengikuti berkas nasional.
        </p>
        <button
          type="button"
          className="lompat"
          onClick={() =>
            unduhCsv(
              "suara_nasional_dpr_ri_2024.csv",
              ["peringkat", "nomor_partai", "nama_partai", "suara_sah", "pangsa_persen", "status_ambang_batas_4_persen"],
              data.partai.map((baris, indeks) => [
                indeks + 1,
                baris.nomor,
                baris.nama,
                baris.suara,
                baris.pangsa.toFixed(4),
                baris.ambang,
              ]),
            )
          }
        >
          Unduh CSV suara nasional
        </button>
      </section>

      <section className="panel" id="juara-provinsi">
        <h2>Siapa suara terbanyak di tiap provinsi</h2>
        <p className="catatan">
          Hitungannya jumlah provinsi, bukan jumlah suara. Golkar memimpin di 14 provinsi. PDI-P
          tetap lebih besar secara nasional.
        </p>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={juara} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid stroke="#e4dccf" vertical={false} />
              <XAxis dataKey="singkatan" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(nilai) => [`${nilai} provinsi`, "Peringkat 1"]} />
              <Bar dataKey="jumlah" radius={[4, 4, 0, 0]}>
                {juara.map((baris) => (
                  <Cell key={baris.singkatan} fill={baris.singkatan === "Golkar" ? WARNA_GOLKAR : "#1e3a5f"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="catatan">
          Jumlah provinsi: {juara.map((baris) => `${baris.singkatan} ${baris.jumlah}`).join(", ")}.
        </p>
        <p className="sumber">
          Sumber:{" "}
          <a href={data.sumberResmi.provinsi.url} target="_blank" rel="noopener noreferrer">
            {data.sumberResmi.provinsi.nama}
          </a>
          . Peringkat pertama berarti suara terbanyak, bukan mayoritas.
        </p>
      </section>

      <section className="panel">
          <h2>Pangsa Golkar di 38 provinsi</h2>
          <div className="alat">
            <select
              aria-label="Urutan grafik provinsi"
              value={urut}
              onChange={(event) => {
                const nilai = event.target.value as Urutan;
                setUrut(nilai);
                setArah(nilai === "peringkat" ? "naik" : "turun");
              }}
            >
              <option value="pangsa">Urutkan menurut pangsa</option>
              <option value="suara">Urutkan menurut jumlah suara</option>
              <option value="peringkat">Urutkan menurut peringkat</option>
            </select>
          </div>
          <div className="grafik-gulir">
          <div className="kanvas kanvas-provinsi" style={{ width: "100%", height: 980 }}>
            <ResponsiveContainer>
              <BarChart data={grafikProvinsi} layout="vertical" margin={{ left: 4, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid stroke="#e4dccf" horizontal={false} />
                <XAxis type="number" tickFormatter={(nilai) => formatPersen(Number(nilai), 0)} />
                <YAxis
                  type="category"
                  dataKey="provinsi"
                  width={178}
                  interval={0}
                  tick={LabelProvinsi}
                />
                <Tooltip
                  formatter={(nilai, _nama, item) => {
                    const baris = item.payload as ProvinsiGolkar;
                    return [
                      `${formatPersen(Number(nilai))} · ${formatSuara(baris.suara)} suara · peringkat ${baris.peringkat}`,
                      "Pangsa Golkar",
                    ];
                  }}
                />
                <Bar dataKey="pangsa" radius={[0, 4, 4, 0]}>
                  {grafikProvinsi.map((baris) => (
                    <Cell key={baris.provinsi} fill={baris.peringkat === 1 ? WARNA_GOLKAR : "#64748b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          </div>
          <p className="sumber">
            Penyebut: {data.penyebutPangsa}. Warna gelap berarti Golkar peringkat 1. Keterangan
            peringkat juga muncul di tooltip.
          </p>
      </section>

      <section className="panel" id="jumlah-dan-pangsa">
          <h2>Jumlah suara dan pangsa</h2>
          <p className="catatan">
            Titik di kanan punya banyak suara. Titik di atas punya pangsa besar. Keduanya tidak
            selalu provinsi yang sama. Skala mendatar linier, dalam juta suara.
          </p>
          <div style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ left: 8, right: 12, top: 12, bottom: 8 }}>
                <CartesianGrid stroke="#e4dccf" />
                <XAxis
                  dataKey="suara"
                  type="number"
                  name="Suara"
                  tickFormatter={formatJuta}
                  label={{ value: "Suara sah Golkar", position: "bottom", offset: 0 }}
                />
                <YAxis
                  dataKey="pangsa"
                  type="number"
                  name="Pangsa"
                  width={56}
                  tickFormatter={(nilai) => formatPersen(Number(nilai), 0)}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(nilai, nama, item) => {
                    const baris = item.payload as ProvinsiGolkar;
                    if (nama === "Suara") return [formatSuara(Number(nilai)), `${baris.provinsi} · suara`];
                    return [formatPersen(Number(nilai)), `${baris.provinsi} · pangsa`];
                  }}
                />
                <Scatter data={data.provinsi} fill={WARNA_GOLKAR}>
                  {data.provinsi.map((baris) => (
                    <Cell key={baris.provinsi} fill={baris.peringkat === 1 ? WARNA_GOLKAR : "#64748b"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="sumber">Setiap titik adalah satu provinsi. Bukan peta. Warna gelap berarti Golkar peringkat 1.</p>
      </section>

      <section className="panel">
        <h2>Tabel Golkar per provinsi</h2>
        <p className="catatan">{data.aturanSelisih}</p>
        <button
          type="button"
          className="lompat"
          onClick={() =>
            unduhCsv(
              "golkar_per_provinsi_dpr_ri_2024.csv",
              [
                "provinsi",
                "peringkat",
                "suara_golkar",
                "pangsa_persen",
                "total_suara_sah_partai_di_provinsi",
                "partai_pembanding",
                "peringkat_pembanding",
                "suara_pembanding",
                "selisih_suara",
                "makna_selisih",
              ],
              data.provinsi.map((baris) => [
                baris.provinsi,
                baris.peringkat,
                baris.suara,
                baris.pangsa.toFixed(4),
                baris.totalProvinsi,
                baris.pembanding,
                baris.peringkatPembanding,
                baris.suaraPembanding,
                baris.selisih,
                baris.makna,
              ]),
            )
          }
        >
          Unduh CSV Golkar per provinsi
        </button>
        <div className="alat">
          <input
            aria-label="Cari provinsi atau partai pembanding"
            placeholder="Cari provinsi atau partai pembanding"
            value={cari}
            onChange={(event) => setCari(event.target.value)}
          />
          <select
            aria-label="Saringan peringkat"
            value={saringan}
            onChange={(event) => setSaringan(event.target.value as Saringan)}
          >
            <option value="semua">Semua provinsi</option>
            <option value="pertama">Golkar peringkat 1</option>
            <option value="bukan">Golkar bukan peringkat 1</option>
          </select>
        </div>
        <div className="bungkus-tabel">
          <table>
            <thead>
              <tr>
                <th>Provinsi</th>
                <th className="angka-kolom">
                  <button type="button" onClick={() => urutkan("suara")}>Suara Golkar</button>
                </th>
                <th className="angka-kolom">
                  <button type="button" onClick={() => urutkan("pangsa")}>Pangsa</button>
                </th>
                <th className="angka-kolom">
                  <button type="button" onClick={() => urutkan("peringkat")}>Peringkat</button>
                </th>
                <th>Pembanding</th>
                <th className="angka-kolom">Selisih suara</th>
              </tr>
            </thead>
            <tbody>
              {[...tabel]
                .sort((a, b) => {
                  const beda =
                    urutTabel === "peringkat" ? a.peringkat - b.peringkat : b[urutTabel] - a[urutTabel];
                  return arahTabel === "turun" ? beda : -beda;
                })
                .map((baris) => (
                  <tr key={baris.provinsi}>
                    <td>
                      {baris.provinsi}
                      {namaSuara.has(baris.provinsi) ? <span className="lencana">suara besar</span> : null}
                      {namaPangsa.has(baris.provinsi) ? <span className="lencana">pangsa tinggi</span> : null}
                    </td>
                    <td className="angka-kolom">{formatSuara(baris.suara)}</td>
                    <td className="angka-kolom">{formatPersen(baris.pangsa)}</td>
                    <td className="angka-kolom">{baris.peringkat}</td>
                    <td title={baris.pembanding}>
                      {baris.pembandingSingkat}
                      <span className="catatan"> · peringkat {baris.peringkatPembanding}</span>
                    </td>
                    <td className="angka-kolom" title={baris.makna}>
                      {formatSelisih(baris.selisih)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p className="sumber">
          {tabel.length} provinsi ditampilkan. Selisih positif berarti Golkar memimpin partai
          peringkat 2. Selisih negatif berarti Golkar tertinggal dari partai peringkat 1. Sumber:
          Keputusan KPU Nomor 1050 Tahun 2024 Lampiran II.
        </p>
      </section>
    </div>
  );
}

type PartaiPayload = {
  nama: string;
  pangsa: number;
};
