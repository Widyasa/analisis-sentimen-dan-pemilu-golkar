import { useState } from "react";
import { Baca } from "./bagian/Baca";
import { Sentimen } from "./bagian/Sentimen";
import { Suara } from "./bagian/Suara";
import { data } from "./data";
import { formatPersen, formatSuara } from "./format";

function Temuan({ onBuka }: { onBuka: (tab: Tab, id: string) => void }) {
  const menurutSuara = [...data.provinsi].sort((a, b) => b.suara - a.suara).slice(0, 3);
  const menurutPangsa = [...data.provinsi].sort((a, b) => b.pangsa - a.pangsa).slice(0, 3);
  const pangsa = (data.suaraGolkar / data.totalSuaraSah) * 100;

  return (
    <section className="panel temuan" aria-label="Temuan utama">
      <h2>Temuan utama</h2>
      <ul className="daftar">
        <li>
          Golkar memperoleh {formatSuara(data.suaraGolkar)} suara sah, atau {formatPersen(pangsa)} dari{" "}
          {formatSuara(data.totalSuaraSah)} suara sah partai DPR RI, dan berada di peringkat{" "}
          {data.peringkatNasionalGolkar} nasional.{" "}
          <button type="button" className="lompat" onClick={() => onBuka("suara", "suara-nasional")}>
            Lihat suara nasional
          </button>
        </li>
        <li>
          Golkar mendapat suara terbanyak di {data.provinsiPeringkatPertama} dari {data.jumlahProvinsi}{" "}
          provinsi. Peringkat pertama berarti suara terbanyak, bukan mayoritas.{" "}
          <button type="button" className="lompat" onClick={() => onBuka("suara", "juara-provinsi")}>
            Lihat peringkat provinsi
          </button>
        </li>
        <li>
          Provinsi dengan jumlah suara Golkar terbesar ({menurutSuara.map((baris) => baris.provinsi).join(", ")})
          berbeda dari provinsi dengan pangsa Golkar tertinggi (
          {menurutPangsa.map((baris) => baris.provinsi).join(", ")}).{" "}
          <button type="button" className="lompat" onClick={() => onBuka("suara", "jumlah-dan-pangsa")}>
            Lihat jumlah dan pangsa
          </button>
        </li>
      </ul>
    </section>
  );
}

type Tab = "suara" | "sentimen" | "baca";

const LAPORAN = "/laporan_analisis_pemilu_dpr_ri_2024_dan_sentimen_golkar.pdf";
const NOTEBOOK =
  "https://github.com/Widyasa/analisis-sentimen-dan-pemilu-golkar/blob/master/notebooks/analisis_hasil_pemilu_dpr_ri_2024.ipynb";
const GITHUB = "https://github.com/Widyasa/analisis-sentimen-dan-pemilu-golkar";

const TAB: { id: Tab; label: string }[] = [
  { id: "suara", label: "Hasil suara" },
  { id: "sentimen", label: "Sentimen post" },
  { id: "baca", label: "Cara membaca" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("suara");
  const s = data.sentimen;
  const pangsa = (data.suaraGolkar / data.totalSuaraSah) * 100;

  return (
    <main className="halaman">
      <header className="kepala">
        <p className="kicker">Portofolio analisis data</p>
        <h1>Suara DPR RI 2024 dan prediksi sentimen post tentang Golkar</h1>
        <p className="pengantar">
          Halaman ini memisahkan dua bacaan: hasil suara sah partai untuk DPR RI, dan prediksi model
          pada post X yang terkumpul tentang Golkar. Keduanya tidak menjelaskan satu sama lain.
        </p>
        <div className="aksi-laporan">
          <a className="unduh" href={LAPORAN} target="_blank" rel="noopener noreferrer">
            Lihat laporan lengkap
          </a>
          <a className="unduh unduh-kedua" href={NOTEBOOK} target="_blank" rel="noopener noreferrer">
            Lihat Jupyter notebook
          </a>
          <a className="unduh unduh-kedua" href={GITHUB} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </header>

      <section className="metrik" aria-label="Angka utama">
        <article className="kartu">
          <p className="label">Suara sah Golkar</p>
          <p className="angka">{formatSuara(data.suaraGolkar)}</p>
          <p className="catatan">
            {formatPersen(pangsa)} dari {formatSuara(data.totalSuaraSah)} suara sah partai. Peringkat{" "}
            {data.peringkatNasionalGolkar} nasional.
          </p>
        </article>
        <article className="kartu">
          <p className="label">Provinsi dengan Golkar di peringkat 1</p>
          <p className="angka">
            {data.provinsiPeringkatPertama} dari {data.jumlahProvinsi}
          </p>
          <p className="catatan">Peringkat 1 berarti suara terbanyak, bukan mayoritas.</p>
        </article>
        <article className="kartu">
          <p className="label">Post yang diprediksi</p>
          <p className="angka">{s.masukPrediksi}</p>
          <p className="catatan">
            {s.negatif} negatif, {s.netral} netral, {s.positif} positif. {s.tidakDiklasifikasikan}{" "}
            ringkasan pengumpul tidak masuk.
          </p>
        </article>
        <article className="kartu">
          <p className="label">Perlu dibaca manusia</p>
          <p className="angka">{s.perluTinjauan}</p>
          <p className="catatan">
            {s.confidenceDiBawah070} prediksi punya confidence di bawah ambang tinjauan 0,70.
          </p>
        </article>
      </section>

      <Temuan
        onBuka={(tujuan, id) => {
          setTab(tujuan);
          window.setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ block: "start" });
          }, 0);
        }}
      />

      <div className="tablist" role="tablist" aria-label="Bagian dashboard">
        {TAB.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "suara" ? <Suara /> : null}
        {tab === "sentimen" ? <Sentimen /> : null}
        {tab === "baca" ? <Baca /> : null}
      </div>
    </main>
  );
}
