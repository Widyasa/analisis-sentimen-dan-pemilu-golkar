export function formatSuara(nilai: number): string {
  return new Intl.NumberFormat("id-ID").format(nilai);
}

export function formatPersen(nilai: number, digit = 2): string {
  const faktor = 10 ** digit;
  const geser = Number((nilai * faktor).toFixed(8));
  const bulat = Math.round(geser) / faktor;
  return `${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digit,
    maximumFractionDigits: digit,
  }).format(bulat)}%`;
}

export function formatJuta(nilai: number): string {
  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  }).format(nilai / 1_000_000)} jt`;
}

export function formatTanggal(iso: string): string {
  const [tahun, bulan, hari] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(tahun, bulan - 1, hari));
}

export function unduhCsv(nama: string, header: string[], baris: (string | number)[][]) {
  const sel = (nilai: string | number) => {
    const teks = String(nilai);
    return /[",\n]/.test(teks) ? `"${teks.replaceAll('"', '""')}"` : teks;
  };
  const isi = [header, ...baris].map((barisCsv) => barisCsv.map(sel).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${isi}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement("a");
  tautan.href = url;
  tautan.download = nama;
  tautan.click();
  URL.revokeObjectURL(url);
}

export function formatSelisih(nilai: number): string {
  const angka = formatSuara(Math.abs(nilai));
  if (nilai > 0) return `+${angka}`;
  if (nilai < 0) return `−${angka}`;
  return angka;
}
