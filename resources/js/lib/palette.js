// Warna seri chart: petrol (utama), kuning sinyal, lalu warna yang mudah dibedakan
export const SERIES_COLORS = [
    '#0e5a5a',
    '#e0a100',
    '#c2410c',
    '#3b5bdb',
    '#7c9a3a',
    '#b03a6b',
    '#5c6b73',
    '#8a5a2b',
    '#9aa5a1',
];

export const seriesColor = (index) => SERIES_COLORS[index % SERIES_COLORS.length];
