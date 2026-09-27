# -*- coding: utf-8 -*-
"""Baca CSV analisis yang sudah ada dan tulis JSON agregat tanpa teks atau identitas post."""
import json
import re
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

import pandas as pd

AKAR = Path(__file__).resolve().parents[2]
TUJUAN = Path(__file__).resolve().parents[1] / "src" / "data" / "agregat.json"

SINGKAT = {
    "Partai Kebangkitan Bangsa": "PKB",
    "Partai Gerakan Indonesia Raya": "Gerindra",
    "Partai Demokrasi Indonesia Perjuangan": "PDI-P",
    "Partai Golongan Karya": "Golkar",
    "Partai NasDem": "NasDem",
    "Partai Buruh": "Buruh",
    "Partai Gelombang Rakyat Indonesia": "Gelora",
    "Partai Keadilan Sejahtera": "PKS",
    "Partai Kebangkitan Nusantara": "PKN",
    "Partai Hati Nurani Rakyat": "Hanura",
    "Partai Garda Republik Indonesia": "Garuda",
    "Partai Amanat Nasional": "PAN",
    "Partai Bulan Bintang": "PBB",
    "Partai Demokrat": "Demokrat",
    "Partai Solidaritas Indonesia": "PSI",
    "Partai PERINDO": "Perindo",
    "Partai Persatuan Pembangunan": "PPP",
    "Partai Ummat": "Ummat",
}

URUTAN_TOPIK = [
    "suara naik atau suara tinggi",
    "caleg dan kampanye",
    "kursi DPR",
    "capres dan cawapres",
    "jatah menteri",
    "mesin partai dan kader",
    "oposisi atau koalisi",
    "orde baru atau serangan fajar",
    "perbandingan dengan PDIP",
]

HARAP_TOPIK = {
    "suara naik atau suara tinggi": (2, 3, 7),
    "caleg dan kampanye": (1, 3, 6),
    "kursi DPR": (2, 3, 2),
    "capres dan cawapres": (0, 4, 2),
    "jatah menteri": (0, 3, 2),
    "mesin partai dan kader": (3, 1, 1),
    "oposisi atau koalisi": (0, 1, 4),
    "orde baru atau serangan fajar": (1, 2, 2),
    "perbandingan dengan PDIP": (1, 1, 1),
}


def persen_angka(nilai: float, digit: int = 2) -> float:
    kuant = Decimal(10) ** -digit
    return float(Decimal(str(nilai)).quantize(kuant, rounding=ROUND_HALF_UP))


def singkat(nama: str) -> str:
    if nama not in SINGKAT:
        raise SystemExit(f"Nama partai belum punya singkatan: {nama}")
    return SINGKAT[nama]


nasional = pd.read_csv(AKAR / "datasets" / "kpu_suara_nasional_pemilu_2024.csv")
golkar = pd.read_csv(AKAR / "outputs" / "ringkasan_golkar_per_provinsi_2024.csv")
ringkas = pd.read_csv(AKAR / "datasets" / "kpu_ringkasan_partai_terbanyak_per_provinsi_2024.csv")
topik = pd.read_csv(AKAR / "outputs" / "sentimen" / "frasa_dan_topik_per_sentimen_2024.csv")
pred = pd.read_csv(AKAR / "outputs" / "sentimen" / "golkar_post_x_prediksi_sentimen_2024.csv")

total = int(nasional["total_suara_sah_nasional"].iloc[0])
if int(nasional["suara_sah_nasional"].sum()) != total:
    raise SystemExit("Jumlah suara nasional tidak cocok dengan total.")

partai = []
for _, baris in nasional.sort_values("suara_sah_nasional", ascending=False).iterrows():
    nama = str(baris["nama_partai"])
    suara = int(baris["suara_sah_nasional"])
    partai.append({
        "nomor": int(baris["nomor_partai"]),
        "nama": nama,
        "singkatan": singkat(nama),
        "suara": suara,
        "pangsa": suara / total * 100,
        "ambang": str(baris["status_ambang_batas_4_persen"]),
        "golkar": nama == "Partai Golongan Karya",
    })

peringkat_golkar = next(i for i, item in enumerate(partai, start=1) if item["golkar"])
suara_golkar = next(item["suara"] for item in partai if item["golkar"])
if suara_golkar != int(golkar["suara_sah_partai_dpr_ri"].sum()):
    raise SystemExit("Jumlah Golkar provinsi tidak sama dengan nasional.")
if len(golkar) != 38 or int((golkar["peringkat_suara_di_provinsi"] == 1).sum()) != 14:
    raise SystemExit("Jumlah provinsi atau peringkat pertama Golkar tidak sesuai.")

provinsi = []
for _, baris in golkar.iterrows():
    pembanding = str(baris["partai_pembanding"])
    provinsi.append({
        "provinsi": str(baris["provinsi"]),
        "peringkat": int(baris["peringkat_suara_di_provinsi"]),
        "suara": int(baris["suara_sah_partai_dpr_ri"]),
        "pangsa": float(baris["persentase_dari_suara_sah_provinsi"]),
        "totalProvinsi": int(baris["total_suara_sah_partai_dpr_ri_provinsi"]),
        "pembanding": pembanding,
        "pembandingSingkat": singkat(pembanding),
        "peringkatPembanding": int(baris["peringkat_partai_pembanding"]),
        "suaraPembanding": int(baris["suara_partai_pembanding"]),
        "selisih": int(baris["selisih_suara_golkar_dikurangi_pembanding"]),
        "makna": str(baris["makna_selisih"]),
    })

pemenang = []
for _, baris in ringkas.iterrows():
    nama = str(baris["partai_dengan_suara_terbanyak"])
    pemenang.append({
        "provinsi": str(baris["provinsi"]),
        "partai": nama,
        "singkatan": singkat(nama),
        "suara": int(baris["suara_partai_terbanyak"]),
        "pangsa": float(baris["persentase_suara_partai_terbanyak"]),
    })

masuk = pred[pred["masuk_analisis_sentimen"] == True].copy()  # noqa: E712
if len(pred) != 85 or len(masuk) != 82:
    raise SystemExit(f"Jumlah post tidak sesuai: {len(pred)} berkas, {len(masuk)} masuk.")
jumlah_label = masuk["sentimen_model"].value_counts().to_dict()
if (jumlah_label.get("negatif"), jumlah_label.get("netral"), jumlah_label.get("positif")) != (39, 27, 16):
    raise SystemExit(f"Komposisi sentimen tidak sesuai: {jumlah_label}")
di_bawah = int((masuk["confidence_model"] < 0.70).sum())
tinjau = int(masuk["perlu_tinjauan_manual"].sum())
if di_bawah != 11 or tinjau != 32:
    raise SystemExit(f"Tinjauan tidak sesuai: di bawah ambang {di_bawah}, ditandai {tinjau}")

kualitas = pred["status_kualitas_sumber"].value_counts().to_dict()
harap_kualitas = {
    "belum_diverifikasi_terhadap_post_asli": 62,
    "cuplikan_tampak_terpotong_perlu_konteks": 17,
    "tuduhan_perlu_verifikasi_independen": 3,
    "ringkasan_pengumpul_bukan_teks_post": 3,
}
if kualitas != harap_kualitas:
    raise SystemExit(f"Kualitas sumber tidak sesuai: {kualitas}")

alasan_tinjauan = {}
for catatan in masuk["alasan_tinjauan"].fillna(""):
    if not str(catatan).strip():
        continue
    for bagian in str(catatan).split(";"):
        kunci = bagian.strip()
        alasan_tinjauan[kunci] = alasan_tinjauan.get(kunci, 0) + 1
alasan_json = [
    {"alasan": nama, "jumlah": jumlah}
    for nama, jumlah in sorted(alasan_tinjauan.items(), key=lambda item: (-item[1], item[0]))
]

detail = pd.read_csv(AKAR / "datasets" / "kpu_suara_partai_dprri_per_provinsi_2024.csv")
url_provinsi = sorted(set(detail["url_sumber"].astype(str)) | set(ringkas["url_sumber"].astype(str)))
url_nasional = sorted(set(nasional["sumber_resmi"].astype(str)))
if url_provinsi != ["https://jdih.kpu.go.id/data/data_kepkpu/2024kpt1050_L2.pdf"]:
    raise SystemExit(f"URL provinsi tidak tunggal: {url_provinsi}")
if url_nasional != ["https://jdih.kpu.go.id/data/data_kepkpu/2024kpt1204.pdf"]:
    raise SystemExit(f"URL nasional tidak tunggal: {url_nasional}")

masuk["tanggal"] = pd.to_datetime(masuk["tanggal_post"])
mingguan = (
    masuk.groupby([pd.Grouper(key="tanggal", freq="W-SUN"), "sentimen_model"])
    .size()
    .unstack(fill_value=0)
    .reindex(columns=["positif", "netral", "negatif"], fill_value=0)
)
minggu_json = []
for tanggal, baris in mingguan.iterrows():
    minggu_json.append({
        "akhirMinggu": pd.Timestamp(tanggal).strftime("%Y-%m-%d"),
        "positif": int(baris["positif"]),
        "netral": int(baris["netral"]),
        "negatif": int(baris["negatif"]),
    })

batas_bin = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.01]
label_bin = ["0,40–0,50", "0,50–0,60", "0,60–0,70", "0,70–0,80", "0,80–0,90", "0,90–1,00"]
potong = pd.cut(masuk["confidence_model"], bins=batas_bin, right=False, labels=label_bin)
bin_json = [
    {"rentang": label, "jumlah": int((potong == label).sum())}
    for label in label_bin
]

topik_saja = topik[topik["jenis"] == "topik"]
matriks = []
for nama in URUTAN_TOPIK:
    bagian = topik_saja[topik_saja["nama"] == nama]
    angka = {}
    for label in ("positif", "netral", "negatif"):
        ketemu = bagian.loc[bagian["sentimen_model"] == label, "jumlah_post"]
        angka[label] = int(ketemu.iloc[0]) if len(ketemu) else 0
    trio = (angka["positif"], angka["netral"], angka["negatif"])
    if trio != HARAP_TOPIK[nama]:
        raise SystemExit(f"Topik {nama} = {trio}, diharapkan {HARAP_TOPIK[nama]}")
    matriks.append({"nama": nama, **angka})

frasa = []
for _, baris in topik[topik["jenis"] == "frasa_berulang"].iterrows():
    frasa.append({
        "sentimen": str(baris["sentimen_model"]),
        "frasa": str(baris["nama"]),
        "jumlahPost": int(baris["jumlah_post"]),
    })

muatan = {
    "suaraGolkar": suara_golkar,
    "totalSuaraSah": total,
    "peringkatNasionalGolkar": peringkat_golkar,
    "provinsiPeringkatPertama": 14,
    "jumlahProvinsi": 38,
    "aturanSelisih": str(golkar["aturan_tanda_selisih"].iloc[0]),
    "penyebutPangsa": str(golkar["penyebut_persentase"].iloc[0]),
    "sumberResmi": {
        "provinsi": {
            "nama": "Keputusan KPU Nomor 1050 Tahun 2024 Lampiran II",
            "url": url_provinsi[0],
            "barisDetail": int(len(detail)),
            "barisRingkasan": int(len(ringkas)),
        },
        "nasional": {
            "nama": "Keputusan KPU Nomor 1204 Tahun 2024",
            "url": url_nasional[0],
            "baris": int(len(nasional)),
        },
    },
    "partai": partai,
    "provinsi": provinsi,
    "pemenangProvinsi": pemenang,
    "sentimen": {
        "jumlahBerkas": 85,
        "masukPrediksi": 82,
        "tidakDiklasifikasikan": 3,
        "positif": 16,
        "netral": 27,
        "negatif": 39,
        "confidenceDiBawah070": 11,
        "perluTinjauan": 32,
        "alasanTinjauan": alasan_json,
        "kualitasSumber": {
            "belumDiverifikasi": 62,
            "cuplikanTerpotong": 17,
            "tuduhanPerluVerifikasi": 3,
            "ringkasanPengumpul": 3,
        },
        "ambang": 0.7,
        "tanggalAwal": str(masuk["tanggal_post"].min()),
        "tanggalAkhir": str(masuk["tanggal_post"].max()),
        "mingguan": minggu_json,
        "confidence": bin_json,
        "topik": matriks,
        "frasa": frasa,
    },
}

teks = json.dumps(muatan, ensure_ascii=False, indent=2)
diizinkan = set(url_provinsi + url_nasional)
for tautan in re.findall(r"https?://[^\"\s]+", teks):
    if tautan not in diizinkan:
        raise SystemExit(f"Tautan tidak diizinkan di JSON publik: {tautan}")
for potongan in ("x.com", "record_id", "teks_post", "@"):
    if potongan in teks:
        raise SystemExit(f"JSON agregat memuat teks yang tidak boleh dipublikasikan: {potongan}")

TUJUAN.parent.mkdir(parents=True, exist_ok=True)
TUJUAN.write_text(teks, encoding="utf-8")
print(f"tertulis {TUJUAN}")
print("pangsa golkar 2 desimal", persen_angka(suara_golkar / total * 100))
