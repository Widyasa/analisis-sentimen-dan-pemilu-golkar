import agregat from "./data/agregat.json";

export const data = agregat;

export type Partai = (typeof data.partai)[number];
export type ProvinsiGolkar = (typeof data.provinsi)[number];
export type Pemenang = (typeof data.pemenangProvinsi)[number];
export type Topik = (typeof data.sentimen.topik)[number];
export type Frasa = (typeof data.sentimen.frasa)[number];
export type Minggu = (typeof data.sentimen.mingguan)[number];
