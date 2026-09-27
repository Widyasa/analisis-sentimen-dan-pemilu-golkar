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

export function formatSelisih(nilai: number): string {
  const angka = formatSuara(Math.abs(nilai));
  if (nilai > 0) return `+${angka}`;
  if (nilai < 0) return `−${angka}`;
  return angka;
}
